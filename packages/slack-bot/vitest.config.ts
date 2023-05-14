import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'slack-bot-test',
    dir: '__tests__',
    environment: 'miniflare',
    // see: https://github.com/cloudflare/miniflare/issues/417
    environmentOptions: {
      scriptPath: 'dist/index.js',
      modules: true,
    },
  },
});
