# Vanilla Map With Wrapper

This project presents an example of how to make use of the `@what3words/api` js wrapper in a browser environment.

## Usage

Edit the source file variables `W3W_API_KEY` and `GOOGLE_API_KEY` located in `src/what3words.js` to a valid key from your respective dashboards ([what3words](accounts.what3words.com/overview), [google](https://console.cloud.google.com/project/_/google/maps-apis/credentials)). Follow the commands below as needed to run or build the project.

1. To install the project dependencies, run the command `npm install`.
2. To build the project, run `npm run build`.
3. To serve the project using esbuild, run `npm run dev`.

## Development

[esbuild](https://esbuild.github.io/) was used to build the project with a dependency on [esbuild-plugin-polyfill-node](https://www.npmjs.com/package/esbuild-plugin-polyfill-node) to shim node-specific features to successfully compile for browsers. You may choose to bundle your project with any appropriate tool of your choice, the only requirement as of `v5.0.1` is to polyfill the node `os` built-in.
