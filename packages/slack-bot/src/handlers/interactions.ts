import { Context } from 'hono';
import { Bindings } from '../bindings';
import { interactionsSchema } from '../schemas/interactions';
import {
  ISlackBlockAction,
  ISlackInteraction,
  ISlackViewSubmission,
} from '../client/types';
import { createStandUp } from '../services/create_stand_up_service';
import { SlackCreateStandUpModalState } from '../client/states';
import { openCreateStandUpModal } from './create';

export async function interactions(context: Context<{ Bindings: Bindings }>) {
  const form = await context.req.formData();
  const { payload: payload } = interactionsSchema.parse(
    Object.fromEntries(form.entries()),
  );

  const interaction: ISlackInteraction = JSON.parse(payload);

  switch (interaction.type) {
    case 'view_submission':
      return handleViewSubmissions(
        <ISlackViewSubmission<SlackCreateStandUpModalState>>interaction,
        context,
      );
    case 'block_actions':
      return handleBlockActions(<ISlackBlockAction>interaction, context);
    default:
      return context.newResponse(null, 200);
  }
}

async function handleViewSubmissions(
  interaction: ISlackViewSubmission<SlackCreateStandUpModalState>,
  context: Context<{ Bindings: Bindings }>,
) {
  switch (interaction.view.callback_id) {
    case 'create_stand_up':
      return await createStandUp(interaction, context);
    default:
      return context.newResponse(null, 200);
  }
}

async function handleBlockActions(
  interaction: ISlackBlockAction,
  context: Context<{ Bindings: Bindings }>,
) {
  const {
    trigger_id: triggerId,
    actions: [{ action_id: actionId }],
    user: { id: userId },
    team: { id: teamId },
  } = interaction;

  switch (actionId) {
    case 'create_stand_up':
      return await openCreateStandUpModal(triggerId, userId, teamId, context);
    default:
      return context.newResponse(null, 200);
  }
}
