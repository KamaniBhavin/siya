import {
  ISlackStandUpParticipantResponse,
  IStandUpResponse,
  StandUpResponseSchema,
} from '../durable_objects/stand_up_brief_do';
import { SlackBlocks } from '../client/types';
import { DateTime } from 'luxon';
import { KnownBlock } from '@slack/types';
import { z } from 'zod';

export function standUpBriefMessage(
  participantSlackIds: string[],
  responses: ISlackStandUpParticipantResponse[],
): SlackBlocks {
  const responded = responses.map((response) => response.participantSlackId);

  const skipped = responses
    .filter((response) => response.data[0] === 'skip_stand_up')
    .map((response) => response.participantSlackId);

  const onLeave = responses
    .filter((response) => response.data[0] === 'on_leave')
    .map((response) => response.participantSlackId);

  const notResponded = participantSlackIds.filter(
    (slackId) => !responded.includes(slackId),
  );

  const skipText =
    skipped.length > 0
      ? skipped.map((slackId) => `<@${slackId}>`).join(', ')
      : 'No one';

  const onLeaveText =
    onLeave.length > 0
      ? onLeave.map((slackId) => `<@${slackId}>`).join(', ')
      : 'No one';

  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Standup Update for *${DateTime.now().toLocaleString(
            DateTime.DATE_MED,
          )}*`,
        },
      },
      ...buildStandUpResponseBlocks(responses).flat(),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${skipText} skipped today's stand up & ${onLeaveText} are on holidays`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: buildNotRespondedText(notResponded),
          },
        ],
      },
    ],
  };
}

/**
 * Builds the stand-up response blocks for a participant response
 *
 * @param responses
 * @returns SlackBlock[] - The blocks for the stand-up response
 */
function buildStandUpResponseBlocks(
  responses: ISlackStandUpParticipantResponse[],
): (KnownBlock | KnownBlock[])[] {
  return responses
    .filter((response) => response.data[0] === 'submit_stand_up')
    .map((response) => {
      const data = z.array(StandUpResponseSchema).parse(response.data[1]);

      return [
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `
						*<@${response.participantSlackId}>*\n${responseText(data)}`,
          },
        },
        {
          type: 'divider',
        },
      ];
    });
}

/**
 * Returns the response text for a given stand-up response
 *
 * @param responses
 * @returns string
 *
 * @example
 *  - What did you do yesterday?
 *  > I worked on the stand-up feature
 *
 */
function responseText(responses: IStandUpResponse[]) {
  return responses
    .map((response) => {
      return `- ${response.question} \n> ${response.response
        .split('\n')
        .join('\n> ')}`;
    })
    .join('\n');
}

/**
 * Returns the text for the not responded section
 * @param notResponded - The list of participants who have not responded
 * @returns string - In Slack mark-down format
 *
 * @example
 * - I didn't hear from <@U01A2BCDEF>, <@U01A2BCDEF>! Keep up your good work, team! :rocket:
 */
function buildNotRespondedText(notResponded: string[]) {
  switch (notResponded.length) {
    case 0:
      return 'Everyone has responded! Keep up your good work, team! :rocket:';
    default:
      return `I didn't hear from ${notResponded
        .map((n) => `<@${n}>`)
        .join(', ')}! Keep up your good work, team! :rocket:`;
  }
}
