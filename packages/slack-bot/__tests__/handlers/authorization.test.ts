import { describe, expect, test } from 'vitest';
import app from '../../src';
import { api, BINDINGS } from '../index.test';

/**
 * The test simulates a Slack OAuth callback.
 * So, it will only test for malformed requests.
 */
describe('authorization', () => {
  const url = `${api}/authorize`;

  test('should return 500 as code is in-valid', async () => {
    const req = new Request(`${url}?code=123`, { method: 'GET' });
    const resp = await app.fetch(req, BINDINGS);
    if (resp) {
      expect(resp.status).toBe(500);
    }
  });

  test("should return 400 as code isn't provided", async () => {
    const req = new Request(url, { method: 'GET' });
    const resp = await app.fetch(req, BINDINGS);
    if (resp) {
      expect(resp.status).toBe(400);
    }
  });
});
