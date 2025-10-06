import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['my_signals/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['my_signals/src/**/*.ts'],
      exclude: ['my_signals/src/index.ts', 'my_signals/src/**/*.test.ts']
    }
  }
});
