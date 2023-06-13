import { SlackBlocks } from '../client/types';

export default function helpMessage(): SlackBlocks {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Siya Dev Help*\nHere are some available commands to manage stand-ups:',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*`/siya-dev-create-stand-up`*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '> *Info:* Create a new stand-up and configure its details such as name, frequency, and time.',
          },
          {
            type: 'mrkdwn',
            text: '> *Usage:* `/siya-dev-create-stand-up`',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*`/siya-dev-list-stand-ups`*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '> *Info:* List all existing stand-ups and their associated information.',
          },
          {
            type: 'mrkdwn',
            text: '> *Usage:* `/siya-dev-list-stand-ups`',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*`/siya-dev-jira-integration`*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '> *Info:* Integrate with Jira for seamless issue tracking and linking with stand-ups.',
          },
          {
            type: 'mrkdwn',
            text: '> *Usage:* `/siya-dev-jira-integration [stand-up-id]`',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*`/siya-dev-add-participants`*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '> *Info:* Add participants to a specific stand-up to receive notifications and updates.',
          },
          {
            type: 'mrkdwn',
            text: '> *Usage:* `/siya-dev-add-participants [stand-up-id] [tag particpants 1] [tag participant 2] ...`',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*`/siya-dev-remove-participants`*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '> *Info:* Remove participants from a stand-up to stop receiving notifications and updates.',
          },
          {
            type: 'mrkdwn',
            text: '> *Usage:* `/siya-dev-remove-participants [stand-up-id] [tag particpants 1] [tag participant 2] ...`',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*`/siya-dev-disable-integration`*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '> *Info:* Disable a specific integration, such as Jira integration, for a stand-up.',
          },
          {
            type: 'mrkdwn',
            text: '> *Usage:* `/siya-dev-disable-integration [stand-up-id]`',
          },
        ],
      },
    ],
  };
}
