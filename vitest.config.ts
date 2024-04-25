import { defineConfig } from 'vitest/config';

const exclude = ['test/**', 'tests/mocks/**', 'docs/**', '.prettierrc.js'];

export default defineConfig({
  test: {
    reporters: ['junit', 'verbose'],
    exclude,
    include: ['tests/**/*.spec.ts'],
    globals: true,
    coverage: {
      exclude,
      reportsDirectory: new URL('./coverage-vitest/', import.meta.url).pathname,
    },
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
      '@utils/': new URL('./tests/utils/', import.meta.url).pathname,
    },
    outputFile: {
      junit: new URL('./coverage/junit-vitest-report.xml', import.meta.url)
        .pathname,
    },
  },
});
