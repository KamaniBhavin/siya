import { Hono } from 'hono';
import { Bindings } from './bindings';
import { sentry } from './middlewares/sentry';

const app = new Hono<{ Bindings: Bindings }>();

// Register sentry middleware to capture exceptions
app.use('*', sentry);

app.get('/', (c) => {
  return c.json({ message: `Hello ${c.env.APP}!` });
});

export default app;
