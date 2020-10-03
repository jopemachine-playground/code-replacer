const path = require('path');
const replaceWithFile = require('./replaceWithFile');
const recursive = require("recursive-readdir");

module.exports = async function (props) {
  recursive(path.resolve(props.dir), [], async (err, files) => {
    const targetFiles = files.map((filePath) => {
      const targetFileName = filePath.split(path.sep).reverse()[0];
      if (
        targetFileName.split(".")[1] === props.ext &&
        !targetFileName.startsWith("__replacer__.")
      )
        return filePath;
    });

    for (let targetFile of targetFiles) {
      if (!targetFile) continue;
      props["target"] = targetFile;
      await replaceWithFile(props);
    }
  });
};