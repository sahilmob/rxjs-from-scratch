import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['my_rxjs/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['my_rxjs/src/**/*.ts'],
      exclude: ['my_rxjs/src/index.ts', 'my_rxjs/src/**/*.test.ts']
    }
  }
});
