// All the bindings used by cloudflare worker
export type Bindings = {
  APP: string;
  SENTRY_DSN: string;
  DATABASE_URL: string;
  SLACK_API_URL: string;
  SLACK_APP_ID: string;
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_SIGNING_SECRET: string;
  SIYA_API_URL: string;
  SLACK_BOT_TOKENS: KVNamespace;
};
