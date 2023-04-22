import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'atlassian-bot-test',
    dir: '__test__',
    environment: 'miniflare',
  },
});
