import { Context } from 'hono';
import { Bindings } from '../bindings';
import { SlashCommandSchema } from '../schemas/create';
import { z } from 'zod';
import { Slack } from '../client/slack';
import { jiraIntegrationMessage } from '../ui/jira_integration_message';

export async function jiraIntegration(
  context: Context<{ Bindings: Bindings }>,
) {
  const form = await context.req.formData();
  const { user_id: userId, team_id: teamId } = SlashCommandSchema.parse(
    Object.fromEntries(form.entries()),
  );

  // This is non-blocking and will not block the response.
  context.executionCtx.waitUntil(
    sendJiraIntegrationMessage(userId, teamId, context.env),
  );

  return context.newResponse(null, 200);
}

async function sendJiraIntegrationMessage(
  userId: string,
  teamId: string,
  env: Bindings,
) {
  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(teamId));

  const slackClient = new Slack(token);
  await slackClient.postMessage({
    channel: userId,
    blocks: jiraIntegrationMessage('test', 'user').blocks,
  });
}
