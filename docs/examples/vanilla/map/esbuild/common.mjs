import { polyfillNode } from 'esbuild-plugin-polyfill-node';

const define = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('W3W_'))
    .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
);

export const buildOptions = {
  entryPoints: ['src/what3words.js'],
  bundle: true,
  outfile: 'public/dist/bundle.js',
  plugins: [polyfillNode()],
  define,
};
