import { ISlackBlockAction, ISlackMessageBlockAction } from '../client/types';
import { openCreateStandUpModal } from '../handlers/create';
import { deleteStandUp } from './delete_stand_up_service';
import { Bindings } from '../bindings';
import { ISlackStandUpParticipantResponse } from '../durable_objects/stand_up_brief_do';
import { SlackStandUpConversationDORequest } from '../durable_objects/slack_stand_up_conversation_do';
import { ISlackStandUpReminderDORequest } from '../durable_objects/stand_up_reminder_do';
import { Slack } from '../client/slack';
import { z } from 'zod';
import { isInActiveConversationModal } from '../ui/is_in_active_conversation_modal';
import { db } from '../../../prisma-data-proxy';
import {
  SlackJiraIntegrationMessageState,
  SlackJiraIntegrationMessageStateSchema,
} from '../client/states';
import helpMessage from '../ui/help_message';

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
    case 'jira_integration':
      await integrateWithJira(
        <ISlackMessageBlockAction<SlackJiraIntegrationMessageState>>interaction,
        env,
      );
      break;
    case 'cancel_integration':
      await cancelJiraIntegration(interaction);
      break;
    case 'help':
      await sendHelpMessage(interaction, env);
  }
}

// A block action to mark a participant as on leave or skipped
// This is a non-blocking action
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

  const request = new Request(env.SIYA_SLACK_BOT_API_URL, {
    method: 'POST',
    body: JSON.stringify(<ISlackStandUpParticipantResponse>{
      type: 'response',
      participantSlackId: userId,
      data: [actionId],
    }),
  });

  return await stub.fetch(request);
}

// A block action to start a stand-up submission conversation in a DO
// This is a non-blocking action
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

  const isInActiveConversation = await db(
    env.DATABASE_URL,
  ).slackActiveStandUpConversation.count({
    where: {
      slackUserId: slackUserId,
    },
  });

  // If the user is already in a conversation, we don't want to start a new one
  if (isInActiveConversation) {
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

  const request = new Request(env.SIYA_SLACK_BOT_API_URL, {
    method: 'POST',
    body: JSON.stringify(<SlackStandUpConversationDORequest>{
      type: 'start_conversation',
    }),
  });

  return await stub.fetch(request);
}

// A block action to delete an alert message from a DO
// This is done to prevent users from clicking on the alert message again
// This is a non-blocking action
async function deleteAlertMessage(
  userId: string,
  standUpId: string,
  env: Bindings,
) {
  const doId = await env.SLACK_STAND_UP_REMINDER_DO.idFromName(
    `${standUpId}-${userId}`,
  );
  const stub = await env.SLACK_STAND_UP_REMINDER_DO.get(doId);

  const request = new Request(env.SIYA_SLACK_BOT_API_URL, {
    method: 'PUT',
    body: JSON.stringify(<ISlackStandUpReminderDORequest>{
      type: 'delete_alert_message',
    }),
  });

  return await stub.fetch(request);
}

// A block action to integrate with Jira for a stand-up
// This is a response of a message action for JIRA integration
// This is a non-blocking action
async function integrateWithJira(
  interaction: ISlackMessageBlockAction<SlackJiraIntegrationMessageState>,
  env: Bindings,
) {
  const {
    actions: [{ block_id: blockId }],
    state,
    response_url: responseUrl,
  } = interaction;
  const parsed = SlackJiraIntegrationMessageStateSchema.parse(state);

  // Send the integration request to the atlassian bot
  // key is the block id, which is of the form "stand_up_id:slack_user_id"
  // Atlassian bot will delete the message after it has integrated with Jira
  const url = `${env.SIYA_ATLASSIAN_BOT_API_URL}/jira/integration`;
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify({
      response_url: responseUrl,
      key: blockId,
      project_id: parsed.values.project_id_input.project_id_action.value,
      email: parsed.values.email_input.email_action.value,
      api_key: parsed.values.api_key_input.api_key_action.value,
    }),
  });

  await fetch(request);
}

// A block action to cancel Jira integration. This deletes the JIRA integration message
// This is a non-blocking action
async function cancelJiraIntegration(interaction: ISlackBlockAction) {
  const responseUrl = interaction.response_url;

  const request = new Request(responseUrl, {
    method: 'POST',
    body: JSON.stringify({
      delete_original: true,
    }),
  });

  await fetch(request);
}

// A block action to send a help message
// This is a non-blocking action
async function sendHelpMessage(interaction: ISlackBlockAction, env: Bindings) {
  const {
    user: { id: slackUserId },
    team: { id: slackTeamId },
  } = interaction;

  const token = z.string().parse(await env.SLACK_BOT_TOKENS.get(slackTeamId));
  const slackClient = new Slack(token);

  await slackClient.postMessage({
    channel: slackUserId,
    blocks: helpMessage().blocks,
  });
}
