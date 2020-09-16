const fs = require('fs');
const path = require('path');
const replaceWithFile = require('./replaceWithFile');

module.exports = function ({
  dir: targetDir,
  ext: targetExt,
  replaceList: replaceListFile,
}) {
  const filesInTargetDir = fs.readdirSync(targetDir);
  for (let fileName of filesInTargetDir) {
    const fileExt = fileName.split(".").reverse()[0];
    if (fileExt == targetExt) {
      replaceWithFile({
        target: `${targetDir}${path.sep}${fileName}`,
        replaceListFile,
      });
    }
  }

  console.log("Jobs done.");
};