import { SlackBlocks } from '../client/types';

export function jiraIntegrationMessage(
  standUpId: string,
  slackUserId: string,
): SlackBlocks {
  const key = `${slackUserId}@${standUpId}`;

  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'This integration will update worklogs on JIRA based on standup updates.',
        },
      },
      {
        type: 'input',
        block_id: 'project_id_input',
        element: {
          type: 'plain_text_input',
          action_id: 'project_id_action',
          placeholder: {
            type: 'plain_text',
            text: 'Enter your JIRA project ID',
          },
        },
        label: {
          type: 'plain_text',
          text: 'Project ID',
        },
        hint: {
          type: 'plain_text',
          text: "For example, 'siya' is the project ID for the JIRA project located at https://siya.atlassian.net/jira/**",
        },
      },
      {
        type: 'input',
        block_id: 'email_input',
        element: {
          type: 'plain_text_input',
          action_id: 'email_action',
          placeholder: {
            type: 'plain_text',
            text: 'Enter your JIRA account email',
          },
        },
        label: {
          type: 'plain_text',
          text: 'Email',
        },
        hint: {
          type: 'plain_text',
          text: 'Email used with JIRA',
        },
      },
      {
        type: 'input',
        block_id: 'api_key_input',
        element: {
          type: 'plain_text_input',
          action_id: 'api_key_action',
          placeholder: {
            type: 'plain_text',
            text: 'Enter your API token',
          },
        },
        label: {
          type: 'plain_text',
          text: 'API Token',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '<https://id.atlassian.com/manage/api-tokens|Click here> to generate your API token.',
        },
      },
      {
        type: 'actions',
        block_id: key,
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Save',
            },
            style: 'primary',
            action_id: 'jira_integration',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Not now',
            },
            style: 'danger',
            action_id: 'cancel_integration',
          },
        ],
      },
    ],
  };
}
