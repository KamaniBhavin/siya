import { ISlackViewSubmission } from '../client/types';
import {
  SlackCreateStandUpModalState,
  SlackCreateStandUpModalStateSchema,
} from '../client/states';
import { Bindings } from '../bindings';
import { z } from 'zod';
import { Slack } from '../client/slack';
import {
  SlackStandUp,
  SlackStandUpParticipant,
  SlackStandUpQuestion,
} from '@prisma/client/edge';
import { db } from '../../../prisma-data-proxy';
import { DateTime } from 'luxon';
import { ISlackStandUpReminderDORequest } from '../durable_objects/stand_up_reminder_do';
import { SlackStandUpBriefDORequest } from '../durable_objects/stand_up_brief_do';
import { ISlackStandUpConversationInitDORequest } from '../durable_objects/slack_stand_up_conversation_do';
import { publishHome } from '../handlers/events';
import { jiraIntegrationMessage } from '../ui/jira_integration_message';

export async function createStandUp(
  interaction: ISlackViewSubmission<SlackCreateStandUpModalState>,
  env: Bindings,
) {
  const parsed = SlackCreateStandUpModalStateSchema.parse(
    interaction.view.state,
  );

  // This is non-blocking, so we don't need to wait for it to finish.
  // This is done so that we can return a response to Slack as soon as possible.
  // Prisma has some serious cold start issues, so we want to avoid
  // delaying the response to Slack.
  const prisma = db(env.DATABASE_URL);
  const {
    values: {
      name_block: {
        name: { value: standUpName },
      },
      participants_block: {
        participants: { selected_users: participants },
      },
      channel_block: {
        channel: { selected_channel: channel },
      },
      frequency_block: {
        frequency: {
          selected_option: { value: frequency },
        },
      },
      stand_up_at_block: {
        stand_up_at: { selected_time: time },
        timezone: {
          selected_option: { value: timezone },
        },
      },
      questions_block: {
        questions: { value: questions },
      },
    },
  } = parsed;

  const standUp = await prisma.slackStandUp.create({
    include: {
      participants: true,
      questions: true,
    },
    data: {
      name: standUpName,
      slackChannelId: channel,
      time: DateTime.fromISO(time).toJSDate(),
      frequency: frequency,
      timezone: timezone,
      slackTeamId: interaction.team.id,
      slackUserId: interaction.user.id,
      questions: {
        createMany: {
          data: questions.split(';').map((question) => ({
            question: question.trim(),
          })),
        },
      },
      participants: {
        createMany: {
          data: participants.map((participant) => ({
            slackUserId: participant,
          })),
        },
      },
    },
  });

  const token = z
    .string()
    .parse(await env.SLACK_BOT_TOKENS.get(standUp.slackTeamId));
  const slackClient = new Slack(token);

  // send a confirmation message to the user
  await slackClient.postMessage({
    channel: standUp.slackUserId,
    text: 'Stand up created successfully! :tada:',
  });

  // publish the home tab to the user. This will show the user the stand-up
  // they just created.
  await publishHome(interaction.user.id, interaction.team.id, env);

  // Initialize the SlackStandUpReminderDOs for each participant.
  // The DOs will remind the participants to do the stand-up 30 minutes before
  // the stand-up time.
  await initializeSlackStandUpReminderDOs(standUp, env);

  // Initialize the SlackStandUpBriefDO for the stand-up.
  // The DO will accumulate the stand-up responses and send a brief to the
  // stand-up channel at the stand-up time.
  await initializeSlackStandUpBriefDO(standUp, env);

  // Initialize the SlackStandUpConversationDO for the stand-up.
  // The DO will create a conversation between the stand-up participants and
  // the stand-up bot when user clicks on "Submit" button.
  await initializeSlackStandUpConversationDO(standUp, env);
}

async function initializeSlackStandUpReminderDOs(
  standUp: SlackStandUp & { participants: SlackStandUpParticipant[] },
  env: Bindings,
) {
  const { participants, time, timezone } = standUp;

  // String representation of the time of the stand-up in the user's timezone.
  const standUpAtText = DateTime.fromJSDate(time)
    .toLocaleString(DateTime.TIME_SIMPLE)
    .concat(' ', timezone);

  // Creating a luxon DateTime object from the time of the stand-up.
  const { hour, minute } = DateTime.fromJSDate(new Date(time));

  // The time to remind the user to do the stand-up. This is 30 minutes before
  // the stand-up time.
  let remindAt = DateTime.now()
    .setZone(timezone)
    .set({ hour: hour, minute: minute })
    .minus({ minutes: 30 });

  // If the remindAt time is in the past, then we need to remind the user
  // tomorrow.
  if (remindAt.diffNow().milliseconds < 0) {
    remindAt = remindAt.plus({ day: 1 });
  }

  await Promise.all(
    participants.map(async ({ slackUserId }) => {
      // A combination of the stand-up ID and the user's Slack ID is always unique.
      const doId = env.SLACK_STAND_UP_REMINDER_DO.idFromName(
        `${standUp.id}-${slackUserId}`,
      );
      const stub = await env.SLACK_STAND_UP_REMINDER_DO.get(doId);

      const request = new Request(env.SIYA_SLACK_BOT_API_URL, {
        method: 'POST',
        body: JSON.stringify(<ISlackStandUpReminderDORequest>{
          type: 'initialize',
          standUpId: standUp.id,
          name: standUp.name,
          slackTeamId: standUp.slackTeamId,
          slackChannelId: standUp.slackChannelId,
          remindAt: remindAt.toMillis(),
          timezone: timezone,
          standUpAt: standUpAtText,
          frequency: standUp.frequency,
          participantSlackId: slackUserId,
        }),
      });

      await stub.fetch(request);
    }),
  );
}

// Initialize the SlackStandUpBriefDO for the stand-up.
// The DO will accumulate the stand-up responses and send a brief to the
// stand-up channel at the stand-up time.
async function initializeSlackStandUpBriefDO(
  standUp: SlackStandUp & { participants: SlackStandUpParticipant[] },
  env: Bindings,
) {
  const doId = env.SLACK_STAND_UP_BRIEF_DO.idFromName(standUp.id);
  const stub = await env.SLACK_STAND_UP_BRIEF_DO.get(doId);

  const request = new Request(env.SIYA_SLACK_BOT_API_URL, {
    method: 'POST',
    body: JSON.stringify(<SlackStandUpBriefDORequest>{
      type: 'initialize',
      standUp: standUp,
    }),
  });

  await stub.fetch(request);
}

// Initialize the SlackStandUpConversationDOs for each participant.
// A combination of the stand-up ID and the user's Slack ID is always unique.
// This will engage the user in a conversation with the bot to do the stand-up.
async function initializeSlackStandUpConversationDO(
  standUp: SlackStandUp & { participants: SlackStandUpParticipant[] } & {
    questions: SlackStandUpQuestion[];
  },
  env: Bindings,
) {
  const { participants, questions } = standUp;

  await Promise.all(
    participants.map(async ({ slackUserId }) => {
      // A combination of the stand-up ID and the user's Slack ID is always unique.
      const doId = env.SLACK_STAND_UP_CONVERSATION_DO.idFromName(
        `${standUp.id}-${slackUserId}`,
      );
      const stub = await env.SLACK_STAND_UP_CONVERSATION_DO.get(doId);

      const request = new Request(env.SIYA_SLACK_BOT_API_URL, {
        method: 'POST',
        body: JSON.stringify(<ISlackStandUpConversationInitDORequest>{
          type: 'initialize',
          standUp: { ...standUp, questions },
          participantSlackId: slackUserId,
        }),
      });

      await stub.fetch(request);
    }),
  );
}
