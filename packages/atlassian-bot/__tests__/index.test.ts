import { describe, expect, test } from 'vitest';
import app from '../src';

const BINDINGS = getMiniflareBindings();

describe('Cloudflare bindings test', () => {
  test('should return bindings from env', async () => {
    const req = new Request('http://localhost/', {
      method: 'GET',
    });

    const resp = await app.fetch(req, BINDINGS);
    if (resp) {
      const json = await resp.json();
      expect(json).toEqual({ message: 'Hello atlassian-bot!' });
    }
  });
});
