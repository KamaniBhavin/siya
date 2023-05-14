import { Context } from 'hono';
import { Bindings } from '../bindings';
import { InteractionsSchema } from '../schemas/interactions';
import {
  ISlackBlockAction,
  ISlackInteraction,
  ISlackViewSubmission,
} from '../client/types';
import { SlackCreateStandUpModalState } from '../client/states';
import { handleBlockActions } from '../services/handle_block_actions_service';
import { handleViewSubmissions } from '../services/handle_view_submissions_service';

export async function interactions(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const { payload: payload } = InteractionsSchema.parse(
    Object.fromEntries(form.entries()),
  );

  const interaction: ISlackInteraction = JSON.parse(payload);

  // This is handled in the background. so, we don't need to wait for it
  // to finish. This is done so that we can return a response to Slack
  // as soon as possible.
  context.executionCtx.waitUntil(
    (async () => {
      switch (interaction.type) {
        case 'view_submission':
          await handleViewSubmissions(
            <ISlackViewSubmission<SlackCreateStandUpModalState>>interaction,
            context.env,
          );
          break;
        case 'block_actions':
          await handleBlockActions(<ISlackBlockAction>interaction, context.env);
      }
    })(),
  );

  return context.newResponse(null, 200);
}
