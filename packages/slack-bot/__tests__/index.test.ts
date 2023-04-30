import { describe, expect, test } from 'vitest';
import app from '../src';
import { ExecutionContext } from 'hono/dist/types/context';

describe('ping', () => {
  test('should return pong', async () => {
    const req = new Request(`${api}/ping`, {
      method: 'GET',
    });

    const resp = await app.fetch(req, BINDINGS);
    if (resp) {
      const json = await resp.json();
      expect(json).toEqual({ message: 'pong' });
    }
  });
});

export const api = 'http://localhost/api';
export const BINDINGS = getMiniflareBindings();
export const fakeTeamId = 'T04UP686HAQ';
export const fakeSlackBotToken =
  'xoxb-4975212221364-5063368783521-LZ11NOUW6e4IkFQXw9GJNn9M';

export class getMockExecutionContext implements ExecutionContext {
  passThroughOnException(): void {
    throw new Error('Method not implemented.');
  }

  async waitUntil(promise: Promise<unknown>): Promise<void> {
    await promise;
  }
}
