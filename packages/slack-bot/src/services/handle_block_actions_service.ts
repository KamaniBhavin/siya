import { ISlackBlockAction } from '../client/types';
import { openCreateStandUpModal } from '../handlers/create';
import { deleteStandUp } from './delete_stand_up_service';
import { Bindings } from '../bindings';
import { ISlackStandUpParticipantResponse } from '../durable_objects/stand_up_brief_do';
import { SlackStandUpConversationDORequest } from '../durable_objects/slack_stand_up_conversation_do';
import { ISlackStandUpReminderDORequest } from '../durable_objects/stand_up_reminder_do';
import { Slack } from '../client/slack';
import { z } from 'zod';
import { isInActiveConversationModal } from '../ui/is_in_active_conversation_modal';

export async function handleBlockActions(
  interaction: ISlackBlockAction,
  env: Bindings,
) {
  const {
    trigger_id: triggerId,
    actions: [{ action_id: actionId, value }],
    user: { id: slackUserId },
    team: { id: slackTeamId },
  } = interaction;

  switch (actionId) {
    case 'create_stand_up':
      await openCreateStandUpModal(triggerId, slackUserId, slackTeamId, env);
      break;
    case 'delete_stand_up':
      await deleteStandUp(value, env);
      break;
    case 'skip_stand_up':
      await participantIsOnLeaveOrSkipped(interaction, env);
      break;
    case 'on_leave':
      await participantIsOnLeaveOrSkipped(interaction, env);
      break;
    case 'submit_stand_up':
      await startStandUpConversationInDO(interaction, env);
      break;
  }
}

export async function participantIsOnLeaveOrSkipped(
  interaction: ISlackBlockAction,
  env: Bindings,
) {
  const {
    actions: [{ action_id: actionId, value: standUpId }],
    user: { id: userId },
  } = interaction;

  await deleteAlertMessage(userId, standUpId, env);

  const doId = env.SLACK_STAND_UP_BRIEF_DO.idFromName(standUpId);
  const stub = await env.SLACK_STAND_UP_BRIEF_DO.get(doId);

  const request = new Request(env.SIYA_API_URL, {
    method: 'POST',
    body: JSON.stringify(<ISlackStandUpParticipantResponse>{
      type: 'response',
      participantSlackId: userId,
      data: [actionId],
    }),
  });

  return await stub.fetch(request);
}

export async function startStandUpConversationInDO(
  interaction: ISlackBlockAction,
  env: Bindings,
) {
  const {
    trigger_id: triggerId,
    actions: [{ value: standUpId }],
    user: { id: slackUserId },
    team: { id: slackTeamId },
  } = interaction;

  const activeConversationDOId =
    await env.SLACK_STAND_UP_ACTIVE_USER_CONVERSATIONS.get(slackUserId);

  // If the user is already in a conversation, we don't want to start a new one
  if (activeConversationDOId) {
    const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(slackTeamId));

    // Open a modal to inform the user that they are already in a conversation
    const slackClient = new Slack(token);
    await slackClient.openView(isInActiveConversationModal(triggerId));

    // We don't want to start a new conversation, so we return
    // Also, we don't want to delete the alert message, because we want users to be able to click on it again
    // to start a new conversation if they want to
    return;
  }

  await deleteAlertMessage(slackUserId, standUpId, env);

  const doId = env.SLACK_STAND_UP_CONVERSATION_DO.idFromName(
    `${standUpId}-${slackUserId}`,
  );
  const stub = await env.SLACK_STAND_UP_CONVERSATION_DO.get(doId);

  const request = new Request(env.SIYA_API_URL, {
    method: 'POST',
    body: JSON.stringify(<SlackStandUpConversationDORequest>{
      type: 'start_conversation',
    }),
  });

  return await stub.fetch(request);
}

async function deleteAlertMessage(
  userId: string,
  standUpId: string,
  env: Bindings,
) {
  const doId = await env.SLACK_STAND_UP_REMINDER_DO.idFromName(
    `${standUpId}-${userId}`,
  );
  const stub = await env.SLACK_STAND_UP_REMINDER_DO.get(doId);

  const request = new Request(env.SIYA_API_URL, {
    method: 'PUT',
    body: JSON.stringify(<ISlackStandUpReminderDORequest>{
      type: 'delete_alert_message',
    }),
  });

  return await stub.fetch(request);
}
