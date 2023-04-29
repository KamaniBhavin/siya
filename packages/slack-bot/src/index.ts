import { Hono } from 'hono';
import { Bindings } from './bindings';
import { sentry } from './middlewares/sentry';
import { zValidator } from '@hono/zod-validator';
import { authorizationSchema } from './schemas/authorization';
import authorization from './handlers/authorization';
import { createSchema } from './schemas/create';
import { create } from './handlers/create';

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');
// Register sentry middleware
app.use('*', sentry);

// A simple ping to measure latency/cold starts
app.get('/ping', (c) => {
  return c.json({ message: 'pong' });
});

// A Slack OAuth callback handler
app.get('/authorize', zValidator('query', authorizationSchema), authorization);

// A Slack route to create a new stand-up
app.post('/create', zValidator('form', createSchema), create);

export default app;
