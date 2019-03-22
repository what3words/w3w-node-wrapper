const fs = require("fs");
const path = require("path");

function deleteFile(pathFrom) {
  pathFrom = path.resolve(__dirname, pathFrom);
  if (fs.existsSync(pathFrom)) {
    fs.unlinkSync(pathFrom);
  }
}

function renameFile(pathFrom, pathTo) {
  pathFrom = path.resolve(__dirname, pathFrom);
  pathTo = path.resolve(__dirname, pathTo);
  if (fs.existsSync(pathFrom)) {
    fs.renameSync(pathFrom, pathTo);
  }
}

function copyFile(pathFrom, pathTo) {
  pathFrom = path.resolve(__dirname, pathFrom);
  pathTo = path.resolve(__dirname, pathTo);
  if (fs.existsSync(pathFrom)) {
    fs.copyFileSync(pathFrom, pathTo);
  }
}

// UMD
deleteFile("../dist/umd/fetch.browser.d.ts");
deleteFile("../dist/umd/fetch.browser.js");

// ES2015
deleteFile("../dist/es2015/fetch.d.ts");
deleteFile("../dist/es2015/fetch.js");
renameFile("../dist/es2015/fetch.browser.d.ts", "../dist/es2015/fetch.d.ts");
renameFile("../dist/es2015/fetch.browser.js", "../dist/es2015/fetch.js");

// package.json
copyFile("./package.json", "../dist/package.json");
copyFile("../README.md", "../dist/README.md");
