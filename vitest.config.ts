import { defineConfig } from 'vitest/config';

const exclude = ['test/**', 'tests/mocks/**', 'docs/**', '.prettierrc.js'];

export default defineConfig({
  test: {
    reporters: ['default', ['junit', { suiteName: 'UI tests' }]],
    exclude,
    include: ['tests/**/*.spec.ts'],
    globals: true,
    coverage: {
      // reporter: ['html'],
      exclude,
      reportsDirectory: './coverage-vitest',
    },
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
    outputFile: {
      junit: './coverage-vitest/junit-report.xml',
    },
  },
});
