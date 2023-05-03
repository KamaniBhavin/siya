import { SlackBlocks } from '../client/types';

export function slackStandUpUpdateAlertMessage(
  participant: string,
  standUpUUID: string,
): SlackBlocks {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `👋 Hey <@${participant}>! It's time for your stand up!`,
        },
      },
      {
        block_id: 'stand_up_alert',
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Submit',
              emoji: true,
            },
            value: standUpUUID,
            action_id: 'submit_stand_up',
            style: 'primary',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Skip',
              emoji: true,
            },
            value: standUpUUID,
            action_id: 'skip_stand_up',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'On leave',
              emoji: true,
            },
            value: standUpUUID,
            action_id: 'on_leave',
            style: 'danger',
          },
        ],
      },
    ],
  };
}
