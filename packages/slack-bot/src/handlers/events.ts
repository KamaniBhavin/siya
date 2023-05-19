import { Context } from 'hono';
import { Bindings } from '../bindings';
import { ISlackEvent } from '../client/types';
import { z } from 'zod';
import {
  AppHomeOpenedEventSchema,
  AppUninstalledEventSchema,
  HomeMessageEventSchema,
  UrlVerificationEventSchema,
} from '../schemas/events';
import { db } from '../../../prisma-data-proxy';
import { slackHomeView } from '../ui/home_view';
import { Slack } from '../client/slack';
import { SlackStandUpConversationDORequest } from '../durable_objects/slack_stand_up_conversation_do';
import { deleteStandUp } from '../services/delete_stand_up_service';

export async function events(context: Context<{ Bindings: Bindings }>) {
  const event: ISlackEvent = await context.req.json();

  if (event.type === 'url_verification') {
    const { challenge } = UrlVerificationEventSchema.parse(event);
    return context.json({ challenge });
  }

  // We can process the event asynchronously. We don't need to wait for the
  // response to be sent back to Slack.
  context.executionCtx.waitUntil(handleEvents(event, context));

  return context.newResponse(null, 200);
}

async function handleEvents(
  event: ISlackEvent,
  context: Context<{ Bindings: Bindings }>,
) {
  switch (event.event?.type) {
    case 'app_uninstalled':
      await appUninstalled(AppUninstalledEventSchema.parse(event), context);
      break;
    case 'app_home_opened':
      await appHomeOpened(AppHomeOpenedEventSchema.parse(event), context);
      break;
    case 'message':
      await appHomeMessage(HomeMessageEventSchema.parse(event), context);
      break;
  }
}

async function appUninstalled(
  event: z.infer<typeof AppUninstalledEventSchema>,
  { env }: Context<{ Bindings: Bindings }>,
) {
  const prisma = db(env.DATABASE_URL);

  // Select all the participants for all the stand-ups for the team
  // Selecting only the slackUserId field to reduce the amount of data we need to fetch
  // from the database
  const standUps = await prisma.slackStandUp.findMany({
    where: {
      slackTeamId: event.team_id,
    },
    select: {
      id: true,
      participants: {
        select: {
          slackUserId: true,
        },
      },
    },
  });

  // Delete all the stand-ups for the team
  await Promise.all(
    standUps.map(async (standUp) => {
      await deleteStandUp(standUp.id, env, false);
    }),
  );
}

async function appHomeOpened(
  event: z.infer<typeof AppHomeOpenedEventSchema>,
  { env }: Context<{ Bindings: Bindings }>,
) {
  const {
    event: { user: slackUserId },
    team_id: slackTeamId,
  } = event;

  await publishHome(slackUserId, slackTeamId, env);
}

export async function publishHome(
  slackUserId: string,
  slackTeamId: string,
  env: Bindings,
) {
  const prisma = db(env.DATABASE_URL);

  // Slack has a limit of 100 blocks per view, so we only fetch the last 10 stand-ups
  // for the user
  const standUps = await prisma.slackStandUp.findMany({
    where: {
      slackUserId: slackUserId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(slackTeamId));
  const homeView = slackHomeView(slackUserId, standUps);
  const slackClient = new Slack(token);

  await slackClient.publishView(homeView);
}

async function appHomeMessage(
  event: z.infer<typeof HomeMessageEventSchema>,
  { env }: Context<{ Bindings: Bindings }>,
) {
  const { user, text, client_msg_id: msgId } = event.event;

  // msgId is null when the message is sent from the Bot.
  // We ignore these messages
  if (!msgId) {
    return new Response(null, { status: 200 });
  }

  // A user can only have one active conversation at a time
  // If the user has an active conversation, we send the message to the DO
  // If not, we ignore the message
  const conversation = await db(
    env.DATABASE_URL,
  ).slackActiveStandUpConversation.findUnique({
    where: {
      slackUserId: user,
    },
  });

  if (!conversation) {
    console.log(`No active conversation for user ${user}`);
    return new Response(null, { status: 200 });
  }

  const doId = env.SLACK_STAND_UP_CONVERSATION_DO.idFromString(
    conversation.conversationDOId,
  );
  const stub = await env.SLACK_STAND_UP_CONVERSATION_DO.get(doId);

  const request = new Request(env.SIYA_API_URL, {
    method: 'POST',
    body: JSON.stringify(<SlackStandUpConversationDORequest>{
      type: 'response',
      participantSlackId: user,
      text: text,
    }),
  });

  await stub.fetch(request);
}
