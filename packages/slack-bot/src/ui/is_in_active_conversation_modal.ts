import { SlackModal } from '../client/types';

export function isInActiveConversationModal(triggerId: string): SlackModal {
  return {
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'SIYA (Bot)',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'OK, got it!',
        emoji: true,
      },
      blocks: [
        {
          block_id: 'active_conversation_popup',
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':warning: Please *complete your current on-going standup update :writing_hand:* before starting this one to avoid ambiguity in your submission.',
          },
        },
      ],
    },
  };
}
