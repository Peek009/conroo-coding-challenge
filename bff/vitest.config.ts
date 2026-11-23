import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      EXTERNAL_API_BASE_URL: 'https://example.com',
    },
  },
});
