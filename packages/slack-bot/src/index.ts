import { Hono } from 'hono';
import { Bindings } from './bindings';
import { sentry } from './middlewares/sentry';
import { zValidator } from '@hono/zod-validator';
import { authorizationSchema } from './schemas/authorization';
import authorization from './handlers/authorization';
import { createSchema } from './schemas/create';
import { create } from './handlers/create';
import { interactionsSchema } from './schemas/interactions';
import { interactions } from './handlers/interactions';
import { eventSchema } from './schemas/events';
import { events } from './handlers/events';

const app = new Hono<{ Bindings: Bindings }>();
// Register sentry middleware
app.use('*', sentry);
// A simple ping to measure latency/cold starts
app.get('/ping', (c) => {
  return c.json({ message: 'pong' });
});

// A Slack OAuth callback handler
app.get(
  '/authorize',
  zValidator('query', authorizationSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  authorization,
);

// A Slack route to create a new stand-up
app.post(
  '/create',
  zValidator('form', createSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  create,
);

//A Slack route for all the interactions
app.post(
  '/interactions',
  zValidator('form', interactionsSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  interactions,
);

//A Slack route for all the events
app.post(
  '/events',
  zValidator('json', eventSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  events,
);

export default app;

/********************** Durable Objects **********************/
export { SlackStandUpReminderDO } from './durable_objects/stand_up_reminder_do';
export { SlackStandUpBriefDO } from './durable_objects/stand_up_brief_do';
export { SlackStandUpConversationDO } from './durable_objects/slack_stand_up_conversation_do';
