import { SlackModal } from '../client/types';
import { FREQUENCIES } from '../constants/frequencies';
import { TIMEZONES } from '../constants/timezones';

function slackCreateStandUpModal(
  userId: string,
  triggerId: string,
): SlackModal {
  return {
    trigger_id: triggerId,
    view: {
      type: 'modal',
      callback_id: 'create_stand_up',
      private_metadata: JSON.stringify({ user_id: userId }),
      title: {
        type: 'plain_text',
        text: 'SIYA (Bot)',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          block_id: 'header_block',
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:wave: Hey <@${userId}>, Let's configure your recurring stand up`,
          },
        },
        {
          type: 'divider',
        },
        {
          block_id: 'name_block',
          type: 'input',
          element: {
            type: 'plain_text_input',
            action_id: 'name',
            placeholder: {
              type: 'plain_text',
              text: 'Name your standup',
              emoji: true,
            },
          },
          label: {
            type: 'plain_text',
            text: '➡️ Name',
            emoji: true,
          },
        },
        {
          block_id: 'participants_block',
          type: 'input',
          element: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Who all participates?',
              emoji: true,
            },
            action_id: 'participants',
          },
          label: {
            type: 'plain_text',
            text: '👥 Participants',
            emoji: true,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'plain_text',
              text: '📢 Channel to conduct stand up?',
            },
          ],
        },
        {
          block_id: 'channel_block',
          type: 'actions',
          elements: [
            {
              type: 'channels_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select a channel',
                emoji: true,
              },
              action_id: 'channel',
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'plain_text',
              text: '🔁 Frequency',
              emoji: true,
            },
          ],
        },
        {
          block_id: 'frequency_block',
          type: 'actions',
          elements: [
            {
              type: 'static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select an item',
                emoji: true,
              },
              options: FREQUENCIES,
              action_id: 'frequency',
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'plain_text',
              text: '⏰ Standup at (Participants will be alerted 30 minutes before it begins)',
              emoji: true,
            },
          ],
        },
        {
          block_id: 'stand_up_at_block',
          type: 'actions',
          elements: [
            {
              type: 'timepicker',
              initial_time: '10:30',
              placeholder: {
                type: 'plain_text',
                text: 'Select time',
                emoji: true,
              },
              action_id: 'stand_up_at',
            },
            {
              type: 'static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select timezone',
                emoji: true,
              },
              action_id: 'timezone',
              options: TIMEZONES.options,
            },
          ],
        },
        {
          block_id: 'questions_block',
          type: 'input',
          element: {
            type: 'plain_text_input',
            multiline: true,
            action_id: 'questions',
            placeholder: {
              type: 'plain_text',
              text: 'Your questions here',
              emoji: true,
            },
          },
          label: {
            type: 'plain_text',
            text: '❓ Questions (Separate each question with a `;`)',
            emoji: true,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: "🚀 Standup initialisation may take a moment, but we've got it under control ⏳ Hold tight for just a few seconds! 🤞 We'll keep you posted every step of the way! 🤗",
            },
          ],
        },
      ],
    },
  };
}

export default slackCreateStandUpModal;
