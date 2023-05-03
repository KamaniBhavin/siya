import { ISlackViewSubmission } from '../client/types';
import {
  SlackCreateStandUpModalState,
  SlackCreateStandUpModalStateSchema,
} from '../client/states';
import { Context } from 'hono';
import { Bindings } from '../bindings';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { SlackStandUp, SlackStandUpParticipant } from '@prisma/client/edge';
import { db } from '../../../prisma-data-proxy';
import { DateTime } from 'luxon';
import {
  ISlackStandUpReminderDOData,
  ISlackStandUpReminderDORequest,
} from '../durable_objects/stand_up_reminder_do';

export async function createStandUp(
  interaction: ISlackViewSubmission<SlackCreateStandUpModalState>,
  context: Context<{ Bindings: Bindings }>,
) {
  const parsed = SlackCreateStandUpModalStateSchema.safeParse(
    interaction.view.state,
  );

  if (!parsed.success) {
    return context.text(parsed.error.message, 400);
  }

  // This is non-blocking, so we don't need to wait for it to finish.
  // This is done so that we can return a response to Slack as soon as possible.
  // Prisma has some serious cold start issues, so we want to avoid
  // delaying the response to Slack.
  context.executionCtx.waitUntil(createAsync(interaction, context));

  return context.newResponse(null, 200);
}

async function createAsync(
  interaction: ISlackViewSubmission<SlackCreateStandUpModalState>,
  context: Context<{ Bindings: Bindings }>,
) {
  const prisma = db(context.env.DATABASE_URL);
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
  } = interaction.view.state;

  const standUp = await prisma.slackStandUp.create({
    include: {
      participants: true,
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
    .parse(await context.env.SLACK_BOT_TOKENS.get(standUp.slackTeamId));
  const slackClient = new Slack(token);

  await slackClient.postMessage({
    channel: standUp.slackUserId,
    text: 'Stand up created successfully! :tada:',
  });

  await initializeSlackStandUpReminderDOs(standUp, context);

  return context.json({ ok: true }, 200);
}

async function initializeSlackStandUpReminderDOs(
  standUp: SlackStandUp & { participants: SlackStandUpParticipant[] },
  { env }: Context<{ Bindings: Bindings }>,
) {
  const { participants, time, timezone } = standUp;

  // String representation of the time of the stand-up in the user's timezone.
  const standUpAt = DateTime.fromJSDate(time)
    .toLocaleString(DateTime.TIME_SIMPLE)
    .concat(' ', timezone);

  // The time to remind the user to do the stand-up. This is 30 minutes before
  // the stand-up time.
  let remindAt = DateTime.now()
    .setZone(timezone)
    .set({ hour: time.getHours(), minute: time.getMinutes() })
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

      const request = new Request(env.SIYA_API_URL, {
        method: 'POST',
        body: JSON.stringify(<ISlackStandUpReminderDORequest>{
          data: <ISlackStandUpReminderDOData>{
            type: 'initialize',
            standUpId: standUp.id,
            name: standUp.name,
            slackTeamId: standUp.slackTeamId,
            slackChannelId: standUp.slackChannelId,
            remindAt: remindAt.toMillis(),
            timezone: timezone,
            standUpAt: standUpAt,
            frequency: standUp.frequency,
            participantSlackId: slackUserId,
          },
        }),
      });

      await stub.fetch(request);
    }),
  );
}
