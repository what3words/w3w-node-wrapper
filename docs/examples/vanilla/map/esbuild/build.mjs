import * as esbuild from 'esbuild';
import { buildOptions } from './common.mjs';

await esbuild
  .build(buildOptions)
  .then(() => console.log('⚡ Done'))
  .catch(() => process.exit(1));
