import { Context } from 'hono';
import { Bindings } from '../bindings';
import { SlashCommandSchema } from '../schemas/create';
import { z } from 'zod';
import { Slack } from '../client/slack';
import helpMessage from '../ui/help_message';

export default async function help(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const command = SlashCommandSchema.parse(Object.fromEntries(form.entries()));

  context.executionCtx.waitUntil(sendHelpMessage(command, context.env));

  return context.newResponse(null, 200);
}

async function sendHelpMessage(
  command: z.infer<typeof SlashCommandSchema>,
  env: Bindings,
) {
  const {
    user_id: slackUserId,
    team_id: slackTeamId,
    channel_id: channelId,
  } = command;
  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(slackTeamId));
  const slackClient = new Slack(token);

  await slackClient.postEphemeral({
    channel: channelId,
    user: slackUserId,
    blocks: helpMessage().blocks,
  });
}
