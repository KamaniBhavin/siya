import { ISlackViewSubmission } from '../client/types';
import {
  SlackCreateStandUpModalState,
  SlackCreateStandUpModalStateSchema,
} from '../client/states';
import { Context } from 'hono';
import { Bindings } from '../bindings';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { SlackStandUp } from '@prisma/client/edge';
import { db } from '../../../prisma-data-proxy';
import { DateTime } from 'luxon';

export async function createStandUp(
  interaction: ISlackViewSubmission<SlackCreateStandUpModalState>,
  context: Context<{ Bindings: Bindings }>,
) {
  const prisma = db(context.env.DATABASE_URL);
  const parsed = SlackCreateStandUpModalStateSchema.safeParse(
    interaction.view.state,
  );

  if (!parsed.success) {
    return context.text(parsed.error.message, 400);
  }

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
  } = parsed.data;

  const standUp = await prisma.slackStandUp.create({
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

  // This is non-blocking.
  // Slack will wait for 3 seconds for a response. If we don't respond within 3 seconds, Slack will show an error.
  context.executionCtx.waitUntil(
    sendStandUpOnBoardingMessage(standUp, context),
  );

  return context.newResponse(null, 200);
}

async function sendStandUpOnBoardingMessage(
  standUp: SlackStandUp,
  context: Context<{ Bindings: Bindings }>,
) {
  const { slackTeamId, slackUserId } = standUp;
  const token = z
    .string()
    .parse(await context.env.SLACK_BOT_TOKENS.get(slackTeamId));

  const slackClient = new Slack(token);
  await slackClient.postMessage({
    channel: slackUserId,
    text: 'Stand up created successfully! :tada:',
  });
}
