import { beforeAll, expect, test } from 'vitest';
import {
  api,
  BINDINGS,
  fakeSlackBotToken,
  fakeTeamId,
  getMockExecutionContext,
} from '../index.test';
import app from '../../src';

const describe = setupMiniflareIsolatedStorage();

/**
 * This test mocks a Slack bot token.
 * It simulates a Slack user clicking on the "Create a stand-up" button.
 * As the token is mocked, the modal will not be opened. But it will not throw an error.
 * It will return a 200 response if the request passes all the zod validations.
 */
describe('should create a stand-up modal', () => {
  const url = `${api}/create`;

  // Mock the Slack bot token. Below token is a fake token.
  beforeAll(async () => {
    const { SLACK_BOT_TOKENS } = await BINDINGS;
    await SLACK_BOT_TOKENS.put(fakeTeamId, fakeSlackBotToken);
  });

  // Below test will pass as the request is valid. But it will not open the modal.
  // As trigger_id is mocked, it will not throw an error.
  test('should return 200', async () => {
    const formData = new FormData();
    formData.append('trigger_id', '123');
    formData.append('user_id', '123');
    formData.append('team_id', 'T04UP686HAQ');

    const req = new Request(url, { method: 'POST', body: formData });

    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      expect(resp.status).toBe(200);
    }
  });

  test('should return 400 as trigger_id is missing', async () => {
    const formData = new FormData();
    formData.append('user_id', '123');
    formData.append('team_id', 'T04UP686HAQ');

    const req = new Request(url, { method: 'POST', body: formData });

    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      expect(resp.status).toBe(400);
    }
  });

  test('should return 400 as user_id is missing', async () => {
    const formData = new FormData();
    formData.append('trigger_id', '123');
    formData.append('team_id', 'T04UP686HAQ');

    const req = new Request(url, { method: 'POST', body: formData });

    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      expect(resp.status).toBe(400);
    }
  });

  test('should return 400 as team_id is missing', async () => {
    const formData = new FormData();
    formData.append('trigger_id', '123');
    formData.append('user_id', '123');

    const req = new Request(url, { method: 'POST', body: formData });

    const resp = await app.fetch(req, BINDINGS, new getMockExecutionContext());

    if (resp) {
      expect(resp.status).toBe(400);
    }
  });
});
