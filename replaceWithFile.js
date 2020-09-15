const fs = require('fs');
const replaceString = require('replace-string');
const path = require('path');

module.exports = function ({ targetFile: target, replaceListFile }) {
  console.log("** target file: " + targetFile);
  console.log("** replaceList file: " + replaceListFile);

  const replaceObj = {};

  const propertyLines = fs.readFileSync(replaceListFile).toString().split("\n");

  for (let propertyLine of propertyLines) {
    const [key, ...value] = propertyLine.split("=");
    replaceObj[key] = value.join("=");
  }

  const [targetFileName, ...targetPathArr] = target.split(path.sep);
  const targetPath = targetPathArr.join(path.sep);

  const srcFileLines = fs.readFileSync(targetFile).toString().split("\n");
  const resultLines = [];

  for (let srcLine of srcFileLines) {
    for (let key of Object.keys(replaceObj)) {
      const reg = new RegExp(key);
      if (reg.test(srcLine)) {
        resultLines.push(replaceString(srcLine, key, replaceObj[key]));
      }
    }
  }

  const dstFilePath = targetPath + path.sep + "__oneline-replacer__." + targetFileName;

  fs.writeFileSync(dstFilePath, "\ufeff" + resultLines.join("\n"), {
    encoding: "utf8",
  });

}