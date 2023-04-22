import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'slack-bot-test',
    dir: '__tests__',
    environment: 'miniflare',
  },
});
