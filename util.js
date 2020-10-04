const chalk = require("chalk");
const fs = require("fs");
const _ = require("lodash");

module.exports = {
  err: function () {
    console.log("Wrong usage. \nCheck the correct usage.");
    process.exit();
  },

  funcExecByFlag: function (flag, funcExecIfFlagIsTrue, funcExecIfFlagIsFalse) {
    return _.cond([
      [_.matches({ flag: true }), () => funcExecIfFlagIsTrue()],
      [
        _.matches({ flag: false }),
        () => {
          funcExecIfFlagIsFalse && funcExecIfFlagIsFalse();
        },
      ],
    ])({
      flag,
      funcExecIfFlagIsTrue,
      funcExecIfFlagIsFalse,
    });
  },

  logByFlag: function (flag, logIfFlagIsTrue, logIfFlagIsFalse) {
    module.exports.funcExecByFlag(
      flag,
      () => console.log(logIfFlagIsTrue),
      () => logIfFlagIsFalse && console.log(logIfFlagIsFalse)
    );
  },

  createHighlightedLine: function (
    srcLine,
    previousMatchingIndex,
    matchingWord,
    afterMatchingIndex
  ) {
    return (
      srcLine.substr(0, previousMatchingIndex) +
      chalk.magentaBright(chalk.bgBlack(matchingWord)) +
      srcLine.substr(afterMatchingIndex, srcLine.length)
    ).trim();
  },

  getProperties: function (object) {
    let result = "";
    for (let key of Object.keys(object)) {
      result += `${key}=${object[key]}
`;
    }
    return result;
  },

  printLines: function (
    lineIdx,
    sourceStr,
    replacedStr,
    srcFileLines,
    resultLines
  ) {
    let previousLine = '', postLine = '';

    if (lineIdx - 2 >= 0) {
      previousLine =
        chalk.gray(`${lineIdx - 1}    `) +
        chalk.gray(resultLines[lineIdx - 2].trim());
    }

    if (lineIdx < srcFileLines.length + 1) {
      postLine =
        chalk.gray(`${lineIdx + 1}    `) +
        chalk.gray(srcFileLines[lineIdx].trim());
    }

    console.log(`
${chalk.gray(
  "------------------------------------------------------------------------------------------"
)}

${chalk.gray(`# Line: ${lineIdx}`)}

${previousLine}
${chalk.blueBright(`${lineIdx}    `) + chalk.blueBright(sourceStr)}
${chalk.greenBright(`${lineIdx}    `) + chalk.greenBright(replacedStr)}
${postLine}
`);
  },

  handleSpecialCharacter: function (key) {
    // TODO: Need to handle more special characters here
    let result = key.replace("(", "\\(");
    result = result.replace(")", "\\)");
    return result;
  },

  findReplaceListFile: function (targetFileName) {
    if (fs.existsSync(`./rlistDir/rlist_${targetFileName}`)) {
      return `./rlistDir/rlist_${targetFileName}`;
    } else if (
      fs.existsSync(`./rlistDir/rlist_${targetFileName.split(".")[0]}`)
    ) {
      return `./rlistDir/rlist_${targetFileName.split(".")[0]}`;
    } else if (fs.existsSync("./rlist")) {
      return "./rlist";
    } else {
      return -1;
    }
  },

  splitWithEscape(string, spliter) {
    let prevChar = '';
    let matching = false;

    let frontStrBuf = '';
    let backStrBuf = '';

    for (let i = 0; i < string.length; i++) {
      let char = string.charAt(i);

      // handle escape
      if (prevChar == '\\') {
        prevChar = char;
        frontStrBuf += char;
        continue;
      }

      if (char === spliter) {
        matching = true;
        continue;
      }

      !matching && (frontStrBuf += char);
      matching && (backStrBuf += char);
      prevChar = char;
    }

    return [frontStrBuf, backStrBuf];
  }
};
