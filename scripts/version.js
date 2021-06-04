const fs = require('fs');
const path = require('path');
const pjson = require('./package.json');

function writeFile(file, contents) {
  file = path.resolve(__dirname, file);
  fs.writeFileSync(file, contents);
}

writeFile('../src/version.ts', `export const version = '${pjson.version}';`);
