import { SlackBlocks } from '../client/types';

export const standUpOnBoardingMessage = (
  standUpName: string,
  standUpChannel: string,
  standUpAt: string,
): SlackBlocks => {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:wave: Hello there! This is SIYA (Bot). You have been invited to participate in the *${standUpName} team's daily standup meeting* :raised_hands:. The purpose of this meeting is to help team members stay informed about each other's work and to identify any obstacles or challenges that need to be addressed. :rocket:`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `The standup will take place in the *<#${standUpChannel}>* Slack channel at ${standUpAt}. Every day, 30 minutes before the standup, I will prompt you to share your updates and to report any issues or blockers you may have encountered. This is your opportunity to keep your team members informed about your progress and to seek help or feedback as needed. :raised_hands:`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Please make sure to attend the daily standup meeting and to be prepared to share your updates. This will help your team members stay informed and will contribute to a more effective and efficient workflow. :muscle: If you have any questions or concerns, please do not hesitate to reach out to the ${standUpName} team's lead or to SIYA. Thank you! :pray:`,
        },
      },
    ],
  };
};
