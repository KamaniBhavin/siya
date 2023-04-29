import { SlackBlocks } from '../client/types';

export const slackAppOnBoardingMessage: SlackBlocks = {
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "👋 Hey there! Welcome to *SIYA*, the ultimate tool for creating and managing recurring stand-ups for your team! 🎉 Ready to take your team's productivity to the next level? Let's go!",
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "With *SIYA*, you can: \n📝 *Customize your stand-ups*: Create unique questions that fit your team's needs and preferences. \n📊 *Track your progress*: Visualize your team's performance over time and identify areas for improvement. \n🚀 *Boost your productivity*: Use data-driven insights to optimize your workflow and get more done. Let's get started!",
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "🚀 *Creating a new recurring stand-up is easy!* \n👉 Simply click the `Create New Stand-up` button under the `Home` tab or use the `/create` command from anywhere in SIYA. Let's make your first stand-up a success! 💪",
      },
    },
  ],
};
