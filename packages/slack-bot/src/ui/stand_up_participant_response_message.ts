import {
  ISlackStandUpParticipantResponse,
  IStandUpResponse,
} from '../durable_objects/stand_up_brief_do';
import { SlackBlocks } from '../client/types';
import { formatResponseText } from './stand_up_brief_message';

export function standUpParticipantResponseMessage(
  response: ISlackStandUpParticipantResponse,
) {
  switch (response.data[0]) {
    case 'submit_stand_up':
      return buildSubmitStandUpBlocks(response, response.data[1]);
    case 'skip_stand_up':
      return buildSkipStandUpBlocks(response);
    case 'on_leave':
      return buildOnLeaveBlocks(response);
    default:
      throw new Error('Invalid stand up update message type');
  }
}

function buildSubmitStandUpBlocks(
  response: ISlackStandUpParticipantResponse,
  data: IStandUpResponse[],
): SlackBlocks {
  return {
    blocks: [
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `:tada: *<@${response.participantSlackId}>* has submitted their stand up!`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: formatResponseText(data),
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
            text: 'Great job, keep up the good work! 🙌',
          },
        ],
      },
    ],
  };
}

function buildSkipStandUpBlocks(
  response: ISlackStandUpParticipantResponse,
): SlackBlocks {
  return {
    blocks: [
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:warning: *<@${response.participantSlackId}>* has skipped today's stand up.`,
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
            text: `We understand that sometimes schedules can be unpredictable, but regular stand-up updates are an important part of our team's communication and productivity. Please try to attend the next one, *<@${response.participantSlackId}>*!`,
          },
        ],
      },
    ],
  };
}

function buildOnLeaveBlocks(
  response: ISlackStandUpParticipantResponse,
): SlackBlocks {
  return {
    blocks: [
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:beach_with_umbrella: *<@${response.participantSlackId}>* is on leave.`,
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
            text: `Enjoy your well-deserved break, *<@${response.participantSlackId}>*! We'll catch up with you when you're back.`,
          },
        ],
      },
    ],
  };
}
