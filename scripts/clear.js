const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const pathFrom = path.resolve(__dirname, '../dist');
if (fs.existsSync(pathFrom)) {
  rimraf.sync(pathFrom);
}
