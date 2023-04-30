import { test, beforeAll, expect } from 'vitest';
import {
  api,
  BINDINGS,
  fakeSlackBotToken,
  fakeTeamId,
  getMockExecutionContext,
} from '../index.test';
import app from '../../src';

const describe = setupMiniflareIsolatedStorage();

describe('Slack create stand-up modal interactions', () => {
  const url = `${api}/interactions`;

  // Mock the Slack bot token. Below token is a fake token.
  beforeAll(async () => {
    const { SLACK_BOT_TOKENS } = await BINDINGS;
    await SLACK_BOT_TOKENS.put(fakeTeamId, fakeSlackBotToken);
  });

  test('should return 400 as payload is missing', async () => {
    const formData = new FormData();
    const req = new Request(url, { method: 'POST', body: formData });
    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      console.log(await resp.json());
      expect(resp.status).toBe(400);
    }
  });

  test('should return 400 as payload is having view without a state', async () => {
    const formData = new FormData();
    formData.append(
      'payload',
      JSON.stringify({
        type: 'view_submission',
        team: {
          id: 'T04UP686HAQ',
        },
        user: {
          id: 'U04UHPKD14M',
        },
        view: {
          callback_id: 'create_stand_up',
          state: {},
        },
      }),
    );

    const req = new Request(url, { method: 'POST', body: formData });
    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      console.log(await resp.json());
      expect(resp.status).toBe(400);
    }
  });

  test('should create a stand-up with provided modal state', async () => {
    const formData = new FormData();
    formData.append(
      'payload',
      JSON.stringify({
        type: 'view_submission',
        team: {
          id: 'T04UP686HAQ',
          domain: 'siyastandupin-cjx1522',
        },
        user: {
          id: 'U04UHPKD14M',
          username: '13havinkamani',
          name: '13havinkamani',
          team_id: 'T04UP686HAQ',
        },
        view: {
          callback_id: 'create_stand_up',
          state: {
            values: {
              name_block: {
                name: {
                  type: 'plain_text_input',
                  value: 'Test from testing',
                },
              },
              participants_block: {
                participants: {
                  type: 'multi_users_select',
                  selected_users: ['U04VC73609Y', 'U04UHPKD14M'],
                },
              },
              channel_block: {
                channel: {
                  type: 'channels_select',
                  selected_channel: 'C04UHRE3ZNZ',
                },
              },
              frequency_block: {
                frequency: {
                  type: 'static_select',
                  selected_option: {
                    text: {
                      type: 'plain_text',
                      text: 'Monday - Friday',
                      emoji: true,
                    },
                    value: 'MONDAY_TO_FRIDAY',
                  },
                },
              },
              stand_up_at_block: {
                stand_up_at: {
                  type: 'timepicker',
                  selected_time: '10:30',
                },
                timezone: {
                  type: 'static_select',
                  selected_option: {
                    text: {
                      type: 'plain_text',
                      text: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi',
                      emoji: true,
                    },
                    value: 'Asia/Calcutta',
                  },
                },
              },
              questions_block: {
                questions: {
                  type: 'plain_text_input',
                  value: 'Who ; What ; When',
                },
              },
            },
          },
        },
      }),
    );

    const req = new Request(url, { method: 'POST', body: formData });
    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      expect(resp.status).toBe(200);
    }
  });
});
