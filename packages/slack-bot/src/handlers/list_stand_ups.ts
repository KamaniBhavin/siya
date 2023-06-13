import { Context } from 'hono';
import { Bindings } from '../bindings';
import { SlashCommandSchema } from '../schemas/create';
import { db } from '../../../prisma-data-proxy';
import { z } from 'zod';
import { Slack } from '../client/slack';
import standUpListMessage from '../ui/stand_up_list_message';

export async function listStandUps(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const command = SlashCommandSchema.parse(Object.fromEntries(form.entries()));

  context.executionCtx.waitUntil(sendStandUpListMessage(command, context.env));

  return context.newResponse(null, 200);
}

async function sendStandUpListMessage(
  command: z.infer<typeof SlashCommandSchema>,
  env: Bindings,
) {
  const {
    user_id: slackUserId,
    team_id: teamId,
    channel_id: channelId,
  } = command;
  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(teamId));
  const slackClient = new Slack(token);

  const standUps = await db(env.DATABASE_URL).slackStandUp.findMany({
    include: {
      participants: false,
    },
    where: {
      participants: {
        some: {
          slackUserId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!standUps || standUps.length === 0) {
    await slackClient.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: `You are not part of any stand ups. Use \`/siya-create-stand-up\` to create a stand up`,
    });

    return;
  }

  await slackClient.postEphemeral({
    channel: channelId,
    user: slackUserId,
    blocks: standUpListMessage(standUps).blocks,
  });
}
