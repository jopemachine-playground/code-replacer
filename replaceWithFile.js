const fs = require('fs');
const replaceString = require('replace-string');
const path = require('path');

module.exports = function ({ target: targetFile, replaceListFile }) {
  console.log("** target file: " + targetFile);
  console.log("** replaceList file: " + replaceListFile);

  const replaceObj = {};

  const propertyLines = fs.readFileSync(replaceListFile).toString().split("\n");

  for (let propertyLine of propertyLines) {
    const [key, ...value] = propertyLine.split("=");
    replaceObj[key] = value.join("=").trim();
  }

  const absPath = path.resolve(targetFile);
  const [targetFileName, ...targetPathArr] = absPath.split(path.sep).reverse();

  const targetPath = targetPathArr.reverse().join(path.sep);

  const srcFileLines = fs.readFileSync(targetFile).toString().split("\n");
  const resultLines = [];

  for (let srcLine of srcFileLines) {
    let matching = false;
    for (let key of Object.keys(replaceObj)) {
      const reg = new RegExp(key);
      if (reg.test(srcLine)) {
        matching = true;
        resultLines.push(replaceString(srcLine, key, replaceObj[key]));
      }
    }

    if(!matching) {
      resultLines.push(srcLine);
    }
  }

  const dstFilePath = targetPath + path.sep + "__oneline-replacer__." + targetFileName;

  fs.writeFileSync(dstFilePath, "\ufeff" + resultLines.join("\n"), {
    encoding: "utf8",
  });
}