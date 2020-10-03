const fs = require("fs");
const path = require("path");
const boxen = require("boxen");
const StringBuffer = require("./stringBuffer");
const chalk = require("chalk");
const matchAll = require("./stringReplace");
const readlineSync = require("readline-sync");

const {
  printLines,
  handleSpecialCharacter,
  findReplaceListFile,
  createHighlightedLine,
  logByFlag,
  funcExecByFlag,
} = require("./util");

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
  const replaceObj = {};

  const debuggingInfoArr = new StringBuffer();

  const absPath = path.resolve(targetFile);
  const [targetFileName, ...targetPathArr] = absPath.split(path.sep).reverse();

  if (!replaceListFile) {
    replaceListFile = findReplaceListFile(targetFileName);
    if (replaceListFile === -1) {
      console.log(
        "Cannot find any kind of rlist file.\nPlease refer to README.md"
      );
      return;
    }
  }

  logByFlag(!verboseOpt, "** target file: " + path.resolve(targetFile));
  logByFlag(
    !verboseOpt,
    "** replaceList file: " + path.resolve(replaceListFile)
  );

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append("** target file: " + path.resolve(targetFile))
  );
  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(
      "** replaceList file: " + path.resolve(replaceListFile)
    )
  );

  const propertyLines = fs.readFileSync(replaceListFile).toString().split("\n");

  for (let propertyLine of propertyLines) {
    if (!propertyLine.includes(rlistSeparator)) continue;
    const [key, ...value] = propertyLine.split(rlistSeparator);
    // hack!!!!
    const temp = value.join(rlistSeparator).trim().normalize();

    replaceObj[key.trim().normalize()] = value
      .join(rlistSeparator)
      .trim()
      .substring(1, temp.length - 1);
    // replaceObj[key.trim().normalize()] = value.join(rlistSeparator).trim();
  }

  const targetPath = targetPathArr.reverse().join(path.sep);

  const srcFileLines = fs.readFileSync(targetFile).toString().split("\n");
  const resultLines = [];

  let lineIdx = 1;
  let blockingReplace = startLinePatt ? true : false;

  const keys = Object.keys(replaceObj);

  // sort by length -> prioritize and map keys with long values first.
  keys.sort(function (a, b) {
    return b.length - a.length || b.localeCompare(a);
  });

  logByFlag(verboseOpt, "keys:");
  logByFlag(verboseOpt, keys);

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`startLinePatt: ${startLinePatt}`)
  );
  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`endLinePatt: ${endLinePatt}`)
  );

  for (let srcLine of srcFileLines) {
    // handle blocking replace
    if (
      blockingReplace &&
      startLinePatt &&
      srcLine.trim() === startLinePatt.trim()
    ) {
      funcExecByFlag(debugOpt, () =>
        debuggingInfoArr.append(`Encountered startLinePatt on line ${lineIdx}`)
      );
      blockingReplace = false;
    }
    if (
      !blockingReplace &&
      endLinePatt &&
      srcLine.trim() === endLinePatt.trim()
    ) {
      funcExecByFlag(debugOpt, () =>
        debuggingInfoArr.append(`Encountered endLinePatt on line ${lineIdx}`)
      );
      blockingReplace = true;
    }

    let regRValue;

    if (regValue) {
      // handle ${source}, ${value}
      const [regValueKey, ...regValueValue] = regValue.split("=");
      regRValue = regValueValue.join("=").normalize();

      key = regValueKey.replace("${source}", key);
      replaceObj[key] = regRValue.replace(
        "${value}",
        replaceObj[key]
      );
    }

    if (!blockingReplace) {
      try {
        let matchingPoints = [];
        for (let key of keys) {
          const regKey = regValue ? key : handleSpecialCharacter(key);
          const reg = new RegExp(regKey);
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
          const key = matchingInfo[0];

          if (replaceFlag) {
            for (let item of matchingPoints) {
              item.index += replaceObj[previousKey].length - previousKey.length;
            }
            replaceFlag = false;
          }

          const sourceStr = createHighlightedLine(
            srcLine,
            matchingInfo.index,
            key,
            matchingInfo.index + key.length
          );
          const replacedStr = createHighlightedLine(
            srcLine,
            matchingInfo.index,
            replaceObj[key],
            matchingInfo.index + key.length
          );

          funcExecByFlag(confOpt || verboseOpt, () =>
            printLines(
              lineIdx,
              sourceStr,
              replacedStr,
              srcFileLines,
              resultLines
            )
          );

          logByFlag(
            confOpt,
            chalk.gray(
              "## Press enter to replace the string or 'n' or 's' to skip"
            )
          );

          let input = "y";
          confOpt && (input = readlineSync.prompt());

          if (input === "n" || input === "no" || input === "s") {
            // skip
            logByFlag(confOpt || verboseOpt, chalk.red("\nskip.."));
          } else {
            if (regValue) {
              // handle grouping value
              const findGroupKeyReg = new RegExp(/${(?<groupKey>.*)}/);
              const groupKeys = matchAll(regRValue, findGroupKeyReg);

              for (let groupKeyMatching of groupKeys) {
                const groupKey = groupKeyMatching[0];
                replaceObj[key].replace(groupKey, matchingInfo.groups[groupKey]);
              }
            }

            // replace string
            replaceFlag = true;
            previousKey = key;
            logByFlag(confOpt || verboseOpt, chalk.yellow("\nreplace.."));
            srcLine =
              srcLine.substr(0, matchingInfo.index) +
              replaceObj[key] +
              srcLine.substr(matchingInfo.index + key.length, srcLine.length);

            if (onceOpt) break;
          }
        }
      } catch (e) {
        console.log("Regexp Error: " + e);
        continue;
      }

      lineIdx++;
      resultLines.push(srcLine);
    }
  }

  const dstFilePath = dstFileName
    ? dstFileName
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
