import { db } from '../../../prisma-data-proxy';
import { Bindings } from '../bindings';
import { publishHome } from '../handlers/events';

export async function deleteStandUp(
  standUpId: string,
  env: Bindings,
  shouldPublishHome = true,
) {
  const prisma = db(env.DATABASE_URL);

  // Select all the participant's Slack user IDs for the stand-up
  // Selecting only the slackUserId field to reduce the amount of data we need to fetch
  const standUp = await prisma.slackStandUp.findUniqueOrThrow({
    where: {
      id: standUpId,
    },
    select: {
      id: true,
      slackUserId: true,
      slackTeamId: true,
      participants: {
        select: {
          slackUserId: true,
        },
      },
    },
  });

  // Delete the stand-up reminders, conversations, and brief from the DOs
  const participantIds = standUp.participants.map(
    (participant) => participant.slackUserId,
  );
  await deleteParticipantsDOs(standUpId, participantIds, env);

  // Delete the stand-up from the database
  await prisma.slackStandUp.delete({
    where: {
      id: standUpId,
    },
  });

  // Publish the home tab for the user to remove the stand-up from the UI
  if (shouldPublishHome) {
    await publishHome(standUp.slackUserId, standUp.slackTeamId, env);
  }
}

export async function deleteParticipantsDOs(
  standUpId: string,
  participantIds: string[],
  env: Bindings,
) {
  // get all the DO IDs for the stand-up reminders from the participant's Slack user IDs
  const compositeIds = participantIds.map((participantId) => {
    return `${standUpId}-${participantId}`;
  });

  // Make a request to the Reminder DO API to delete itself
  await Promise.all(
    compositeIds.map(async (id) => {
      const doId = env.SLACK_STAND_UP_REMINDER_DO.idFromName(id);
      const doStub = await env.SLACK_STAND_UP_REMINDER_DO.get(doId);
      await doStub.fetch(
        new Request(env.SIYA_SLACK_BOT_API_URL, { method: 'DELETE' }),
      );
    }),
  );

  // Make a request to the Conversation DO API to delete itself
  await Promise.all(
    compositeIds.map(async (id) => {
      const doId = env.SLACK_STAND_UP_CONVERSATION_DO.idFromName(id);
      const doStub = await env.SLACK_STAND_UP_CONVERSATION_DO.get(doId);
      await doStub.fetch(
        new Request(env.SIYA_SLACK_BOT_API_URL, { method: 'DELETE' }),
      );
    }),
  );

  // Make a request to the Brief DO API to delete itself
  const doId = env.SLACK_STAND_UP_BRIEF_DO.idFromName(standUpId);
  const doStub = await env.SLACK_STAND_UP_BRIEF_DO.get(doId);
  await doStub.fetch(
    new Request(env.SIYA_SLACK_BOT_API_URL, { method: 'DELETE' }),
  );
}
