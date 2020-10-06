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
  template,
  verboseOpt,
  debugOpt,
}) => {
  const replaceObj = {};

  if (!replaceListFile) {
    replaceListFile = findReplaceListFile(`.${path.sep}rlist`, targetFileName);
  } else if (fs.lstatSync(replaceListFile).isDirectory()) {
    replaceListFile = findReplaceListFile(replaceListFile, targetFileName);
  }

  funcExecByFlag(!verboseOpt && replaceListFile !== -1, () =>
    console.log(
      chalk.dim(
        chalk.italic("** replaceList file: " + path.resolve(replaceListFile))
      )
    )
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

      replaceObj[key.trim().normalize()] = value.join(rlistSeparator).trim();
    }
  } else if (replaceListFile === -1 && !template) {
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
  logByFlag(
    !verboseOpt,
    chalk.dim(chalk.italic("** target file: " + path.resolve(targetFile)))
  );

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

getReplacingKeys = ({ replaceObj, replaceListFile, template, verboseOpt }) => {
  const keys = Object.keys(replaceObj);

  // sort by length -> prioritize and map keys with long values first.
  keys.sort(function (a, b) {
    return b.length - a.length || b.localeCompare(a);
  });

  logByFlag(verboseOpt, "keys:");
  logByFlag(verboseOpt, keys);

  if (template) {
    let [regLValue, regRValue] = splitWithEscape(template, "=");

    regRValue = regRValue.trim().normalize();

    for (let key of keys) {
      key = regLValue.replace("${source}", key);
      replaceObj[key] = regRValue.replace("${value}", replaceObj[key]);
    }

    if (!replaceListFile) {
      // assume to replace using group regular expressions only
      keys.push(regLValue);
    }
  }

  return keys;
};

getMatchingPoints = ({ srcLine, template, replacingKeys }) => {
  let matchingPoints = [];
  let matchingPtCnt = 0;

  for (let replacingKey of replacingKeys) {
    const replacingKeyReg = new RegExp(handleSpecialCharacter(replacingKey));
    const replacingKeyMatchingPts = matchAll(srcLine, replacingKeyReg);

    for (let replacingKeyMatchingPt of replacingKeyMatchingPts) {
      let existingMatchingPtIdx = -1;

      for (
        let matchingPtIdx = 0;
        matchingPtIdx < matchingPoints.length;
        matchingPtIdx++
      ) {
        const cands = matchingPoints[matchingPtIdx];
        const replacingKeyMatchingStr = replacingKeyMatchingPt[0];

        for (let candIdx = 0; candIdx < cands.length; candIdx++) {
          const candStr = cands[candIdx][0];
          if (
            replacingKeyMatchingStr === candStr ||
            (!replacingKeyMatchingStr.includes(candStr) &&
              !candStr.includes(replacingKeyMatchingStr))
          ) {
            continue;
          }

          // Should be same matching point.
          if (
            candStr.length - replacingKeyMatchingStr.length >=
            cands[candIdx].index - replacingKeyMatchingPt.index
          ) {
            existingMatchingPtIdx = matchingPtIdx;
            break;
          }
        }
      }

      if (existingMatchingPtIdx === -1) {
        matchingPoints[matchingPtCnt++] = [replacingKeyMatchingPt];
      } else {
        matchingPoints[existingMatchingPtIdx].push(replacingKeyMatchingPt);
      }
    }
  }

  for (
    let matchingPtIdx = 0;
    matchingPtIdx < matchingPoints.length;
    matchingPtIdx++
  ) {
    const cands = matchingPoints[matchingPtIdx];
    cands["leastIdx"] = Number.MAX_SAFE_INTEGER;

    for (let candIdx = 0; candIdx < cands.length; candIdx++) {
      if (cands["leastIdx"] > cands[candIdx].index) {
        cands["leastIdx"] = cands[candIdx].index;
      }
    }
  }

  // Sort matching points to match in asc order
  matchingPoints.sort((lPt, rPt) => {
    return lPt.leastIdx - rPt.leastIdx
  });

  return {
    matchingPoints,
    matchingPtCnt,
  };
};

displayConsoleMsg = ({ srcLine, matchingInfo, replaceObj, confOpt, verboseOpt, targetFileName, lineIdx, srcFileLines, resultLines }) => {
  let matchingStr = matchingInfo[0];

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
    printLines(
      targetFileName,
      lineIdx,
      sourceStr,
      replacedStr,
      srcFileLines,
      resultLines
    )
  );

  logByFlag(
    confOpt,
    chalk.dim(
      chalk.italic(
        "## Press enter to replace the string or 'n' to skip this word or 's' to skip this file."
      )
    )
  );
};

replaceExecute = ({
  targetFileName,
  srcFileLines,
  replaceObj,
  template,
  excludeRegValue,
  replaceListFile,
  startLinePatt,
  endLinePatt,
  verboseOpt,
  confOpt,
  onceOpt,
}) => {
  const resultLines = [];
  const replacingKeys = getReplacingKeys({
    replaceObj,
    replaceListFile,
    template,
    verboseOpt,
  });

  let lineIdx = 1;
  let blockingReplaceFlag = startLinePatt ? true : false;

  for (let srcLine of srcFileLines) {
    if (excludeRegValue && srcLine.match(new RegExp(excludeRegValue))) {
      lineIdx++;
      resultLines.push(srcLine);
      continue;
    }

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
      const { matchingPoints, matchingPtCnt } = getMatchingPoints({ srcLine, template, replacingKeys });

      for (
        let matchingPtIdx = 0;
        matchingPtIdx < matchingPtCnt;
        matchingPtIdx++
      ) {
        // Match the longest string first
        const matchingCandidates = matchingPoints[matchingPtIdx];

        for (
          let candidateIdx = 0;
          candidateIdx < matchingCandidates.length;
          candidateIdx++
        ) {
          let matchingInfo = matchingCandidates[candidateIdx];
          let matchingStr = matchingInfo[0];

          // Need more test
          if (template && !replaceListFile) {
            // handle grouping value
            const [regLValue, regRValue] = splitWithEscape(template, "=");
            const findGroupKeyReg = new RegExp(/\$\{(?<groupKey>\w*)\}/);
            const groupKeys = matchAll(regRValue, findGroupKeyReg);

            for (let groupKeyInfo of groupKeys) {
              const groupKey = groupKeyInfo[1];
              const findMatchingStringReg = new RegExp(regLValue);
              const groupKeyMatching = srcLine.match(findMatchingStringReg);
              const groupKeyMatchingStr = groupKeyMatching.groups[groupKey];

              matchingStr = matchingStr.replace(
                `(?<${groupKey}>)`,
                groupKeyMatchingStr
              );

              replaceObj[matchingStr] = regRValue.replace(
                `\${${groupKey}}`,
                groupKeyMatching.groups[groupKey]
              );
            }
          }

          displayConsoleMsg ({ srcLine, matchingInfo, replaceObj, confOpt, verboseOpt, targetFileName, lineIdx, srcFileLines, resultLines });

          let input = "y";
          confOpt && (input = readlineSync.prompt());

          if (yn(input) === false) {
            // skip this word. choose other candidate if you have a shorter string to replace.
            logByFlag(confOpt || verboseOpt, chalk.red("\nskip.."));
          } else if (input.startsWith("s")) {
            // skip this file.
            console.log(chalk.red(`\nskip '${targetFileName}'..`));
            return -1;
          } else {
            // replace string

            // push the index value of the other matching points.
            for (
              let otherPtsCandidateIdx = matchingPtIdx + 1;
              otherPtsCandidateIdx < matchingPtCnt;
              otherPtsCandidateIdx++
            ) {
              const otherPts =
                matchingPoints[otherPtsCandidateIdx];

              for (let candItem of otherPts) {
                candItem.index +=
                  replaceObj[matchingStr].length - matchingStr.length;
              }
            }

            logByFlag(confOpt || verboseOpt, chalk.yellow("\nreplace.."));

            srcLine =
              srcLine.substr(0, matchingInfo.index) +
              replaceObj[matchingStr] +
              srcLine.substr(
                matchingInfo.index + matchingStr.length,
                srcLine.length
              );
            break;
          }
        }

        if (onceOpt) break;
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
  template,
  excludeReg: excludeRegValue,
  debug: debugOpt,
  overwrite: overwriteOpt,
}) {
  if (!rlistSeparator) rlistSeparator = '=';

  const { srcFileLines, targetFileName, targetPath } = parseTargetFile({
    targetFile,
    verboseOpt,
    debugOpt,
  });

  const replaceObj = parseRList({
    replaceListFile,
    targetFileName,
    rlistSeparator,
    template,
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
    targetFileName,
    srcFileLines,
    replaceObj,
    template,
    excludeRegValue,
    replaceListFile,
    startLinePatt,
    endLinePatt,
    verboseOpt,
    confOpt,
    onceOpt,
  });

  if (resultLines === -1) return;

  const dstFilePath = overwriteOpt
    ? targetFile
    : dstFileName
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

  console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)));
};
