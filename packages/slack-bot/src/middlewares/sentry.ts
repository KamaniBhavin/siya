import { Context, Next } from 'hono';
import { Toucan } from 'toucan-js';
import { Bindings } from '../bindings';

/**
 * A middleware to capture exceptions across the application and send them to Sentry
 *
 * @param c - The context of the request
 * @param next - The next middleware to be executed in the chain
 *
 * @returns {Promise<void>}
 */
export async function sentry(c: Context<{ Bindings: Bindings }>, next: Next) {
  await next();

  if (!c.error) {
    return;
  }

  const { req } = c;
  const sentry = new Toucan({
    dsn: c.env.SENTRY_DSN,
    request: c.req.raw,
  });

  sentry.captureException(c.error, {
    data: {
      body: req.body,
      headers: req.headers,
      method: req.method,
      params: req.param(),
      path: req.path,
    },
  });
}
