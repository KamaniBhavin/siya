import { Context } from 'hono';
import { Bindings } from '../bindings';
import { SlashCommandSchema } from '../schemas/create';
import { db } from '../../../prisma-data-proxy';
import {
  initializeSlackStandUpBriefDO,
  initializeSlackStandUpConversationDO,
  initializeSlackStandUpReminderDOs,
} from '../services/create_stand_up_service';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { SlackStandUp, SlackStandUpQuestion } from '@prisma/client/edge';
import { deleteParticipantsDOs } from '../services/delete_stand_up_service';

// This function is used by both the add and remove participants handlers
// So we can avoid duplicating code
// It validates the slash command format and extracts the standUpId and participants
async function validateSlashCommand(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const { user_id: userId, text } = SlashCommandSchema.parse(
    Object.fromEntries(form.entries()),
  );

  if (!text) {
    return context.newResponse(
      'Please provide a stand up id and a list of participants to add to the stand up',
      200,
    );
  }

  // parse the text to get the standUpId and participants
  // standUpId is the first word in the text
  // participants are the rest of the words in the text
  const [standUpId, ...slackUserIds] = text.split(' ');

  // Check if stand up exists
  const standUp = await db(context.env.DATABASE_URL).slackStandUp.findUnique({
    include: {
      questions: true,
    },
    where: {
      id: standUpId,
    },
  });

  if (!standUp) {
    return context.newResponse(
      `Stand up with id ${standUpId} does not exist`,
      200,
    );
  }

  // Check if user is the creator of the stand-up
  if (standUp.slackUserId !== userId) {
    return context.newResponse(
      `You do not have permission to add participants to stand up ${standUp.name}. Only the <@${standUp.slackUserId}> can add participants to this stand up.`,
      200,
    );
  }

  // parse participants to get slackUserIds
  // The format of a Slack user ID is <@U12345678 | username>
  // We want to extract the user ID from this string and add it to the set
  const participantSlackIds = new Set(
    slackUserIds.map((participant) => {
      const [slackUserId] = participant.split('|');
      return slackUserId.slice(2);
    }),
  );

  if (participantSlackIds.size === 0) {
    return context.newResponse(
      'Please provide a space-separated list of Slack users',
      200,
    );
  }

  return {
    standUp,
    participantSlackIds,
  };
}

// This handler is called when a user wants to add participants to a stand-up using
// the /siya-add-participants slash command
// The format of the slash command is /siya-add-participants <standUpId> <slackUserId1> <slackUserId2> ...
export async function addParticipants(
  context: Context<{ Bindings: Bindings }>,
) {
  const response = await validateSlashCommand(context);

  // If the response is a Response object, then there was an error
  // and we should return the response
  if (response instanceof Response) {
    return response;
  }

  // Otherwise, we can proceed with adding the participants
  const { standUp, participantSlackIds } = response;

  // This is non-blocking, so we don't need to wait for it to finish
  context.executionCtx.waitUntil(
    createParticipantsAndDOs(standUp, participantSlackIds, context.env),
  );

  return context.newResponse(null, 200);
}

// Asynchronously creates the participants and DOs for the stand-up
async function createParticipantsAndDOs(
  standUp: SlackStandUp & { questions: SlackStandUpQuestion[] },
  participantSlackIds: Set<string>,
  env: Bindings,
) {
  const participants = await Promise.all(
    Array.from(participantSlackIds).map(async (slackUserId) => {
      return db(env.DATABASE_URL).slackStandUpParticipant.upsert({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          slackUserId_slackStandUpId: {
            slackUserId,
            slackStandUpId: standUp.id,
          },
        },
        create: {
          slackUserId,
          slackStandUpId: standUp.id,
        },
        update: {},
      });
    }),
  );

  await initializeSlackStandUpReminderDOs({ ...standUp, participants }, env);

  await initializeSlackStandUpConversationDO({ ...standUp, participants }, env);

  await initializeSlackStandUpBriefDO({ ...standUp, participants }, env);

  const participantsText = participants
    .map((participant) => {
      return `<@${participant.slackUserId}>`;
    })
    .join(' ');

  const token = z
    .string()
    .parse(await env.SLACK_BOT_TOKENS.get(standUp.slackTeamId));

  const slackClient = new Slack(token);
  await slackClient.postMessage({
    channel: standUp.slackUserId,
    text: `Successfully added ${participantsText} to stand up ${standUp.name}`,
  });
}

// This handler is called when a user wants to remove participants from a stand-up using
// the /siya-remove-participants slash command
// The format of the slash command is /siya-remove-participants <standUpId> <slackUserId1> <slackUserId2> ...
export async function removeParticipants(
  context: Context<{ Bindings: Bindings }>,
) {
  const response = await validateSlashCommand(context);

  // If the response is a Response object, then there was an error
  // and we should return the response
  if (response instanceof Response) {
    return response;
  }

  // Otherwise, we can proceed with adding the participants
  const { standUp, participantSlackIds } = response;

  // This is non-blocking, so we don't need to wait for it to finish
  context.executionCtx.waitUntil(
    deleteParticipantsAndDos(
      standUp,
      Array.from(participantSlackIds),
      context.env,
    ),
  );

  return context.newResponse(null, 200);
}

// Asynchronously deletes the participants and DOs for the stand-up
async function deleteParticipantsAndDos(
  standUp: SlackStandUp,
  participantSlackIds: string[],
  env: Bindings,
) {
  await deleteParticipantsDOs(standUp.id, participantSlackIds, env);

  await db(env.DATABASE_URL).slackStandUpParticipant.deleteMany({
    where: {
      slackUserId: {
        in: participantSlackIds,
      },
    },
  });

  const participantsText = participantSlackIds
    .map((participant) => {
      return `<@${participant}>`;
    })
    .join(' ');

  const token = z
    .string()
    .parse(await env.SLACK_BOT_TOKENS.get(standUp.slackTeamId));
  const slackClient = new Slack(token);

  await slackClient.postMessage({
    channel: standUp.slackUserId,
    text: `Successfully removed ${participantsText} from stand up ${standUp.name}`,
  });
}
