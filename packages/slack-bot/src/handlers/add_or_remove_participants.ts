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

type ValidateSlashCommandResult = {
  userId: string;
  teamId: string;
  channelId: string;
  standUp: SlackStandUp & { questions: SlackStandUpQuestion[] };
  participantSlackIds: string[];
};

// This function is used by both the add and remove participants handlers
// So we can avoid duplicating code
// It validates the slash command format and extracts the standUpId and participants
async function validateSlashCommand(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const {
    user_id: userId,
    team_id: teamId,
    channel_id: channelId,
    text,
  } = SlashCommandSchema.parse(Object.fromEntries(form.entries()));
  const token = z
    .string()
    .parse(await context.env.SLACK_BOT_TOKENS.get(teamId));
  const slackClient = new Slack(token);

  if (!text) {
    await slackClient.postEphemeral({
      channel: channelId,
      user: userId,
      text: 'Please provide a stand-up id and a list of participants',
    });

    return null;
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
    await slackClient.postEphemeral({
      channel: channelId,
      user: userId,
      text: `Stand up does not exist. See Home tab for a list of stand ups`,
    });

    return null;
  }

  // Check if user is the creator of the stand-up
  if (standUp.slackUserId !== userId) {
    await slackClient.postEphemeral({
      channel: channelId,
      user: userId,
      text: `Only <@${standUp.slackUserId}> can add or remove participants`,
    });

    return null;
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
    await slackClient.postEphemeral({
      channel: channelId,
      user: userId,
      text: `Please provide a list of participants following the stand-up id`,
    });

    return null;
  }

  return {
    userId,
    teamId,
    channelId,
    standUp,
    participantSlackIds: Array.from(participantSlackIds),
  };
}

// This handler is called when a user wants to add participants to a stand-up using
// the /siya-add-participants slash command
// The format of the slash command is /siya-add-participants <standUpId> <slackUserId1> <slackUserId2> ...
export async function addParticipants(
  context: Context<{ Bindings: Bindings }>,
) {
  const result = await validateSlashCommand(context);

  // If the response is a Response object, then there was an error,
  // and we should return the response
  if (!result) {
    return context.newResponse(null, 200);
  }

  // This is non-blocking, so we don't need to wait for it to finish
  context.executionCtx.waitUntil(createParticipantsAndDOs(result, context.env));

  return context.newResponse(null, 200);
}

// Asynchronously creates the participants and DOs for the stand-up
async function createParticipantsAndDOs(
  data: ValidateSlashCommandResult,
  env: Bindings,
) {
  const { standUp, participantSlackIds, userId, channelId } = data;
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
  await slackClient.postEphemeral({
    channel: channelId,
    user: userId,
    text: `Added ${participantsText} to stand-up ${standUp.name}`,
  });
}

// This handler is called when a user wants to remove participants from a stand-up using
// the /siya-remove-participants slash command
// The format of the slash command is /siya-remove-participants <standUpId> <slackUserId1> <slackUserId2> ...
export async function removeParticipants(
  context: Context<{ Bindings: Bindings }>,
) {
  const result = await validateSlashCommand(context);

  // If the response is a Response object, then there was an error,
  // and we should return the response
  if (!result) {
    return context.newResponse(null, 200);
  }

  // This is non-blocking, so we don't need to wait for it to finish
  context.executionCtx.waitUntil(deleteParticipantsAndDos(result, context.env));

  return context.newResponse(null, 200);
}

// Asynchronously deletes the participants and DOs for the stand-up
async function deleteParticipantsAndDos(
  result: ValidateSlashCommandResult,
  env: Bindings,
) {
  const { standUp, participantSlackIds, userId, channelId } = result;
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

  await slackClient.postEphemeral({
    channel: channelId,
    user: userId,
    text: `Removed ${participantsText} from stand-up ${standUp.name}`,
  });
}
