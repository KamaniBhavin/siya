import { Hono } from 'hono';
import { Bindings } from './bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.json({ message: `Hello ${c.env.APP}!` });
});

export default app;
