import * as esbuild from 'esbuild';
import { buildOptions } from './common.mjs';

const PORT = 3000;

const ctx = await esbuild.context({
  ...buildOptions,
  banner: {
    js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`,
  },
  sourcemap: true,
});

await ctx.watch();

const { host, port } = await ctx.serve({
  port: PORT,
  servedir: 'public',
});

console.log(`⚡ Serving app at http://${host}:${port}`);
