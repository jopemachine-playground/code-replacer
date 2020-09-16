const fs = require('fs');
const path = require('path');
const replaceWithFile = require('./replaceWithFile');

module.exports = function ({
  dir: targetDir,
  ext: targetExt,
  replaceListFile,
}) {
  const filesInTargetDir = fs.readdirSync(targetDir);
  for (let fileName of filesInTargetDir) {
    const fileExt = fileName.split(".").reverse()[0];
    if (fileExt == targetExt) {
        console.log(`${filesInTargetDir}${path.sep}${fileName}`);
      replaceWithFile({
        target: `${targetDir}${path.sep}${fileName}`,
        replaceListFile,
      });
    }
  }
};