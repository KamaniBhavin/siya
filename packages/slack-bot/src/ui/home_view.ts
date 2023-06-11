import { SlackStandUp } from '@prisma/client/edge';
import { SlackHomeView } from '../client/types';
import { KnownBlock } from '@slack/types';
import { DateTime } from 'luxon';
import { Frequency } from '@prisma/client';

export function slackHomeView(
  userId: string,
  standUps: SlackStandUp[],
): SlackHomeView {
  return {
    user_id: userId,
    view: {
      type: 'home',
      blocks: [
        {
          type: 'image',
          image_url:
            'https://avatars.slack-edge.com/2023-03-23/5015334430497_03d97efbd7c0c327bad6_96.png',
          alt_text: 'SIYA (Bot)',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "*🎉 Welcome to SIYA 🤖*\n\nEasily set up stand ups for your team with just a few clicks. 💬\n\n👀 *Create or manage your stand ups* from this home view. Customize them by *adding topics and questions*, and choose *fun emojis*. 😎\n\n📆 Set the *frequency and timing* of your standup with our bot. *Preview it* to ensure it's just right. 👌\n\n👥 Keep your team *connected and on track* without any hassle. 🙌\n\nLet's get started! 🚀",
          },
        },
        {
          block_id: 'main',
          type: 'actions',
          elements: [
            {
              action_id: 'create_stand_up',
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Create New Stand-up',
                emoji: true,
              },
              style: 'primary',
              value: 'create_stand_up',
            },
            {
              action_id: 'help',
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Help',
                emoji: true,
              },
              value: 'help',
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Your Stand-ups*',
          },
        },
        {
          type: 'divider',
        },
        ...buildStandUpBlocks(standUps).flat(),
      ],
    },
  };
}

export function buildStandUpBlocks(
  standUps: SlackStandUp[],
): (KnownBlock[] | KnownBlock)[] {
  if (standUps.length === 0) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "You don't have any stand-ups yet. \n - You can create one by clicking on the *Create New Stand-up* button under home tab. or \n - You can create one by typing `/create` in any channel.",
        },
      },
    ];
  }

  return standUps.map(({ id, name, frequency, time, timezone }) => {
    const standUpAt = DateTime.fromJSDate(time)
      .toLocaleString(DateTime.TIME_SIMPLE)
      .concat(' ', timezone);

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${name}* \n ${frequencyText(frequency)} \n ${standUpAt}`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Delete',
            emoji: true,
          },
          style: 'danger',
          value: `${id}`,
          action_id: 'delete_stand_up',
          confirm: {
            title: {
              type: 'plain_text',
              text: `Are you sure you want to delete ${name}?`,
            },
            text: {
              type: 'mrkdwn',
              text: 'This action is destructive and cannot be undone.',
            },
            confirm: {
              type: 'plain_text',
              text: 'Do it',
            },
            deny: {
              type: 'plain_text',
              text: "Stop, I've changed my mind!",
            },
          },
        },
      },
      {
        type: 'divider',
      },
    ];
  });
}

function frequencyText(frequency: Frequency): string {
  switch (frequency) {
    case Frequency.MONDAY_TO_FRIDAY:
      return 'Monday to Friday';
    case Frequency.MONDAY_TO_SATURDAY:
      return 'Monday to Saturday';
    case Frequency.EVERYDAY:
      return 'Everyday';
  }
}
