import { Context, Hono } from 'hono';
import { Bindings } from './bindings';
import { sentry } from './middlewares/sentry';
import { zValidator } from '@hono/zod-validator';
import { AuthorizationSchema } from './schemas/authorization';
import authorization from './handlers/authorization';
import { SlashCommandSchema } from './schemas/create';
import { create } from './handlers/create';
import { InteractionsSchema } from './schemas/interactions';
import { interactions } from './handlers/interactions';
import { EventSchema } from './schemas/events';
import { events } from './handlers/events';
import { jiraIntegration } from './handlers/jira_integration';
import {
  addParticipants,
  removeParticipants,
} from './handlers/add_or_remove_participants';

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
  zValidator('query', AuthorizationSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  authorization,
);

// A Slack route to create a new stand-up
app.post(
  '/create',
  zValidator('form', SlashCommandSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  create,
);

//A Slack route for all the interactions
app.post(
  '/interactions',
  zValidator('form', InteractionsSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  interactions,
);

//A Slack route for all the events
app.post(
  '/events',
  zValidator('json', EventSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  events,
);

// A Slack shortcut route to add JIRA integration
app.post(
  '/jira-integration',
  zValidator('form', SlashCommandSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  jiraIntegration,
);

// A Slack shortcut route to add a participant to a stand-up
app.post(
  '/add-participants',
  zValidator('form', SlashCommandSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  addParticipants,
);

app.post(
  '/remove-participants',
  zValidator('form', SlashCommandSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  removeParticipants,
);

export default app;

/********************** Durable Objects **********************/
export { SlackStandUpReminderDO } from './durable_objects/stand_up_reminder_do';
export { SlackStandUpBriefDO } from './durable_objects/stand_up_brief_do';
export { SlackStandUpConversationDO } from './durable_objects/slack_stand_up_conversation_do';
