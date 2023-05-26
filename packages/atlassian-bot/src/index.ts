import { Hono } from 'hono';
import { Bindings } from './bindings';
import { integration } from './handlers/integration';
import { zValidator } from '@hono/zod-validator';
import { IntegrationSchema } from './schemas/integration_schema';
import { addWorkLogs } from './handlers/addWorkLogs';
import { AddWorkLogSchema } from './schemas/add_work_log_schema';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/ping', (c) => {
  return c.json({ message: 'pong' });
});

app.post(
  '/jira/integration',
  zValidator('json', IntegrationSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  integration,
);

app.post(
  '/jira/add-work-logs',
  zValidator('json', AddWorkLogSchema, (result, c) => {
    if (!result.success) {
      return c.text(JSON.stringify(result.error.errors), { status: 400 });
    }
  }),
  addWorkLogs,
);

export default app;
