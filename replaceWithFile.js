const fs = require("fs");
const path = require("path");
const boxen = require("boxen");
const StringBuffer = require("./stringBuffer");
const chalk = require("chalk");
const matchAll = require("./stringReplace");
const yn = require("yn");
const readlineSync = require("readline-sync");
const _ = require("lodash");

const {
  printLines,
  handleSpecialCharacter,
  findReplaceListFile,
  createHighlightedLine,
  logByFlag,
  funcExecByFlag,
  splitWithEscape,
} = require("./util");

const debuggingInfoArr = new StringBuffer();

parseRList = ({
  replaceListFile,
  targetFileName,
  rlistSeparator,
  regValue,
  verboseOpt,
  debugOpt,
}) => {
  const replaceObj = {};

  if (!replaceListFile) {
    replaceListFile = findReplaceListFile(targetFileName);
  }

  funcExecByFlag(!verboseOpt && replaceListFile !== -1, () =>
    console.log("** replaceList file: " + path.resolve(replaceListFile))
  );

  funcExecByFlag(debugOpt && replaceListFile !== -1, () =>
    debuggingInfoArr.append(
      "** replaceList file: " + path.resolve(replaceListFile)
    )
  );

  if (replaceListFile !== -1) {
    const propertyLines = fs
      .readFileSync(replaceListFile)
      .toString()
      .split("\n");

    for (let propertyLine of propertyLines) {
      if (!propertyLine.includes(rlistSeparator)) continue;
      const [key, ...value] = propertyLine.split(rlistSeparator);
      // hack!!!!
      // const temp = value.join(rlistSeparator).trim().normalize();

      // replaceObj[key.trim().normalize()] = value
      //   .join(rlistSeparator)
      //   .trim()
      //   .substring(1, temp.length - 1);
      replaceObj[key.trim().normalize()] = value.join(rlistSeparator).trim();
    }
  } else if (replaceListFile === -1 && !regValue) {
    console.log(
      chalk.red(
        "You should specify the 'reg' value or the rlist file. \nPlease refer to README.md\nExit.."
      )
    );
    return;
  }

  return replaceObj;
};

parseTargetFile = ({ targetFile, verboseOpt, debugOpt }) => {
  const absPath = path.resolve(targetFile);
  const [targetFileName, ...targetPathArr] = absPath.split(path.sep).reverse();
  logByFlag(!verboseOpt, "** target file: " + path.resolve(targetFile));

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append("** target file: " + path.resolve(targetFile))
  );

  const srcFileLines = fs.readFileSync(targetFile).toString().split("\n");

  const targetPath = targetPathArr.reverse().join(path.sep);

  return {
    srcFileLines,
    targetFileName,
    targetPath,
  };
};

getReplacingKeys = ({ replaceObj, replaceListFile, regValue, verboseOpt }) => {
  const keys = Object.keys(replaceObj);

  // sort by length -> prioritize and map keys with long values first.
  keys.sort(function (a, b) {
    return b.length - a.length || b.localeCompare(a);
  });

  logByFlag(verboseOpt, "keys:");
  logByFlag(verboseOpt, keys);

  if (regValue && !replaceListFile) {
    // handle ${source}, ${value}
    let regRValue;
    const [regValueKey, ...regValueValue] = regValue.split("=");
    regRValue = regValueValue.join("=").trim().normalize();

    for (let key of keys) {
      key = regValueKey.replace("${source}", key);
      regRValue = regRValue.replace("${value}", replaceObj[key]);
      replaceObj[key] = regRValue;
    }
  }

  if (regValue && !replaceListFile) {
    // handle grouping value
    const [regValueKey, regValueValue] = splitWithEscape(regValue, "=");
    keys.push(regValueKey);
  }

  return keys;
};

replaceExecute = ({
  srcFileLines,
  replaceObj,
  regValue,
  replaceListFile,
  startLinePatt,
  endLinePatt,
  verboseOpt,
  confOpt,
  onceOpt,
}) => {
  const resultLines = [];

  let lineIdx = 1;
  let blockingReplaceFlag = startLinePatt ? true : false;

  const replacingKeys = getReplacingKeys({
    replaceObj,
    replaceListFile,
    regValue,
    verboseOpt,
  });

  for (let srcLine of srcFileLines) {
    // handle blocking replace
    funcExecByFlag(
      blockingReplaceFlag &&
        startLinePatt &&
        srcLine.trim() === startLinePatt.trim(),
      () => {
        funcExecByFlag(debugOpt, () =>
          debuggingInfoArr.append(
            `Encountered startLinePatt on line ${lineIdx}`
          )
        );
        blockingReplaceFlag = false;
      }
    );

    funcExecByFlag(
      !blockingReplaceFlag &&
        endLinePatt &&
        srcLine.trim() === endLinePatt.trim(),
      () => {
        funcExecByFlag(debugOpt, () =>
          debuggingInfoArr.append(`Encountered endLinePatt on line ${lineIdx}`)
        );
        blockingReplaceFlag = true;
      }
    );

    if (!blockingReplaceFlag) {
      let matchingPoints = [];
      for (let key of replacingKeys) {
        const reg = new RegExp(regValue ? key : handleSpecialCharacter(key));
        const regGenerator = matchAll(srcLine, reg);
        matchingPoints = [...matchingPoints, ...regGenerator];
      }

      // Proceed with the place from the previous item.
      matchingPoints.sort(function (a, b) {
        return a.index - b.index;
      });

      let replaceFlag = false;
      let previousKey = "";

      for (let matchingInfo of matchingPoints) {
        let matchingStr = matchingInfo[0];

        if (replaceFlag) {
          for (let item of matchingPoints) {
            item.index += replaceObj[previousKey].length - previousKey.length;
          }
          replaceFlag = false;
        }

        // Need more test
        if (regValue && !replaceListFile) {
          // handle grouping value
          const [regLValue, regRValue] = splitWithEscape(regValue, "=");
          const findGroupKeyReg = new RegExp(/\$\{(?<groupKey>\w*)\}/);
          const groupKeys = matchAll(regRValue, findGroupKeyReg);

          for (let groupKeyInfo of groupKeys) {
            const groupKey = groupKeyInfo[1];
            const findMatchingStringReg = new RegExp(regLValue);
            const groupKeyMatching = srcLine.match(findMatchingStringReg);
            const groupKeyMatchingStr = groupKeyMatching.groups[groupKey];

            matchingStr = matchingStr.replace(`(?<${groupKey}>)`, groupKeyMatchingStr);

            replaceObj[matchingStr] = regRValue.replace(
              `\${${groupKey}}`,
              groupKeyMatching.groups[groupKey]
            );
          }
        }

        const sourceStr = createHighlightedLine(
          srcLine,
          matchingInfo.index,
          matchingStr,
          matchingInfo.index + matchingStr.length
        );
        const replacedStr = createHighlightedLine(
          srcLine,
          matchingInfo.index,
          replaceObj[matchingStr],
          matchingInfo.index + matchingStr.length
        );

        funcExecByFlag(confOpt || verboseOpt, () =>
          printLines(lineIdx, sourceStr, replacedStr, srcFileLines, resultLines)
        );

        logByFlag(
          confOpt,
          chalk.gray(
            "## Press enter to replace the string or 'n' or 's' to skip"
          )
        );

        let input = "y";
        confOpt && (input = readlineSync.prompt());

        if (yn(input) === "false" || input === "s") {
          // skip
          logByFlag(confOpt || verboseOpt, chalk.red("\nskip.."));
        } else {
          // replace string
          replaceFlag = true;
          previousKey = matchingStr;
          logByFlag(confOpt || verboseOpt, chalk.yellow("\nreplace.."));
          srcLine =
            srcLine.substr(0, matchingInfo.index) +
            replaceObj[matchingStr] +
            srcLine.substr(matchingInfo.index + matchingStr.length, srcLine.length);

          if (onceOpt) break;
        }
      }

      lineIdx++;
      resultLines.push(srcLine);
    }
  }

  return resultLines;
};

module.exports = async function ({
  target: targetFile,
  replaceList: replaceListFile,
  sep: rlistSeparator,
  verbose: verboseOpt,
  once: onceOpt,
  startLinePatt,
  endLinePatt,
  dst: dstFileName,
  conf: confOpt,
  reg: regValue,
  debug: debugOpt,
}) {
  const { srcFileLines, targetFileName, targetPath } = parseTargetFile({
    targetFile,
    verboseOpt,
    debugOpt,
  });

  const replaceObj = parseRList({
    replaceListFile,
    targetFileName,
    rlistSeparator,
    regValue,
    verboseOpt,
    debugOpt,
  });

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`startLinePatt: ${startLinePatt}`)
  );
  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`endLinePatt: ${endLinePatt}`)
  );

  const resultLines = replaceExecute({
    srcFileLines,
    replaceObj,
    regValue,
    replaceListFile,
    startLinePatt,
    endLinePatt,
    verboseOpt,
    confOpt,
    onceOpt,
  });

  const dstFilePath = dstFileName
    ? path.resolve(dstFileName)
    : targetPath + path.sep + "__replacer__." + targetFileName;

  fs.writeFileSync(dstFilePath, "\ufeff" + resultLines.join("\n"), {
    encoding: "utf8",
  });

  const debugInfoStr = boxen(debuggingInfoArr.toString(), {
    padding: 1,
    margin: 1,
    borderStyle: "double",
  });

  logByFlag(verboseOpt, debugInfoStr);

  funcExecByFlag(debugOpt, () =>
    fs.appendFileSync("DEBUG_INFO", "\ufeff" + debugInfoStr, {
      encoding: "utf8",
    })
  );

  console.log(`Generated '${dstFilePath}'\n`);
};
