import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'slack-bot-test',
    dir: '__test__',
    environment: 'miniflare',
  },
});
