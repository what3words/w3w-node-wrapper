import * as esbuild from 'esbuild';
import { buildOptions } from './common.mjs';

const define = {};

for (const k in process.env) {
  if (k.startsWith('W3W_')) {
    define[`process.env.${k}`] = JSON.stringify(process.env[k]);
  }
}

await esbuild
  .build(buildOptions)
  .then(() => console.log('⚡ Done'))
  .catch(() => process.exit(1));
