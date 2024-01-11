import * as esbuild from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

await esbuild
  .build({
    entryPoints: ["src/what3words.js"],
    bundle: true,
    outfile: "public/dist/bundle.js",
    plugins: [
      polyfillNode({
        // Options (optional)
      }),
    ],
  })
  .then(() => console.log("⚡ Done"))
  .catch(() => process.exit(1));
