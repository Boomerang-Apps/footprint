import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules/**'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/image/**/*.ts',
        'lib/storage/**/*.ts',
        'lib/ai/**/*.ts',
        'app/api/upload/**/*.ts',
        'app/api/transform/**/*.ts',
        'components/upload/**/*.tsx',
      ],
      exclude: [
        'node_modules/',
        '.next/',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/*.test.{ts,tsx}',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
