import { defineConfig } from 'vitest/config';
import commonjs from 'vite-plugin-commonjs';

const exclude = [
  'test/**',
  'tests/mocks/**',
  'docs/**',
  '.prettierrc.js',
  'coverage/**',
];

const path = (path: string) => new URL(path, import.meta.url).pathname;

export default defineConfig({
  plugins: [commonjs()],
  test: {
    reporters: ['junit', 'verbose'],
    exclude,
    include: ['tests/**/*.spec.ts'],
    globals: true,
    coverage: {
      exclude,
      reportsDirectory: path('./coverage-vitest/'),
    },
    alias: {
      '@/': path('./src/'),
      '@utils/': path('./tests/utils/'),
    },
    outputFile: {
      junit: path('./coverage/junit-vitest-report.xml'),
    },
  },
});
