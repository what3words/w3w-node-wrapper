import * as esbuild from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

const PORT = 3000;

const ctx = await esbuild.context({
  entryPoints: ["src/what3words.js"],
  bundle: true,
  outfile: "public/dist/bundle.js",
  plugins: [polyfillNode()],
  sourcemap: true,
});

await ctx.watch();

const { host, port } = await ctx.serve({
  port: PORT,
  servedir: "public",
});

console.log(`⚡ Serving app at http://${host}:${port}`);
