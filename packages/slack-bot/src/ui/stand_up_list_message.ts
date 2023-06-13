import { SlackBlocks } from '../client/types';
import { SlackStandUp } from '@prisma/client/edge';
import { KnownBlock } from '@slack/types';
import { DateTime } from 'luxon';
import { frequencyText } from '../utils';

export default function standUpListMessage(
  standUps: SlackStandUp[],
): SlackBlocks {
  return {
    blocks: standUps
      .map(({ id, name, frequency, time, timezone }) => {
        const standUpAt = DateTime.fromJSDate(time)
          .toLocaleString(DateTime.TIME_SIMPLE)
          .concat(' ', timezone);

        return <KnownBlock[]>[
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `*ID*: ${id}\n*Name*: ${name}\n*Frequency*: ${frequencyText(
                  frequency,
                )}\n*Time*: ${standUpAt}`,
              },
            ],
          },
          {
            type: 'divider',
          },
        ];
      })
      .flat(),
  };
}
