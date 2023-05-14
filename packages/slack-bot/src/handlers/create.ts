import { Context } from 'hono';
import { Bindings } from '../bindings';
import { createSchema } from '../schemas/create';
import { z } from 'zod';
import { Slack } from '../client/slack';
import slackCreateStandUpModal from '../ui/create_stand_up_modal';

export async function create(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const {
    trigger_id: triggerId,
    user_id: userId,
    team_id: teamId,
  } = createSchema.parse(Object.fromEntries(form.entries()));

  // This is non-blocking and will not block the response.
  context.executionCtx.waitUntil(
    openCreateStandUpModal(triggerId, userId, teamId, context.env),
  );

  return context.newResponse(null, 200);
}

export async function openCreateStandUpModal(
  triggerId: string,
  userId: string,
  teamId: string,
  env: Bindings,
) {
  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(teamId));
  const slackClient = new Slack(token);
  const modal = slackCreateStandUpModal(userId, triggerId);

  await slackClient.openView(modal);
}
