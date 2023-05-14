import { ISlackViewSubmission } from '../client/types';
import { SlackCreateStandUpModalState } from '../client/states';
import { createStandUp } from './create_stand_up_service';
import { Bindings } from '../bindings';

export async function handleViewSubmissions(
  interaction: ISlackViewSubmission<SlackCreateStandUpModalState>,
  env: Bindings,
) {
  switch (interaction.view.callback_id) {
    case 'create_stand_up':
      await createStandUp(interaction, env);
  }
}
