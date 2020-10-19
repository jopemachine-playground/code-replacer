import chalk from "chalk";
import matchAll from "./matchAll";
import yn from "yn";
import readlineSync from "readline-sync";
import debuggingInfoArr from "./debuggingInfo";
import optionManager from "./optionManager";
import {
  handleTemplateLValuesLRefKey,
  handleTemplateLValuesSpecialCharEscape,
} from "./template";
import {
  CreatingReplacingObjError,
  InvalidLeftTemplateError,
  InvalidRightReferenceError,
  ERROR_CONSTANT,
} from "./error";

import utils from "./util";
import { MatchingPoints } from "./type/matchingPoints";
import { ReplacerArgument } from "./type/replacerArgument";
import util from "./util";
import { MatchingPoint } from "./type/matchingPoint";
import constant from "./constant";

const displayConsoleMsg = ({
  lineIdx,
  matchingInfo,
  replaceObj,
  resultLines,
  srcFileLines,
  srcFileName,
  srcLine,
}: {
  lineIdx: number;
  matchingInfo: any;
  replaceObj: any;
  resultLines: string[];
  srcFileLines: string[];
  srcFileName: string;
  srcLine: string;
}) => {
  const matchingStr: string = matchingInfo[0];

  const sourceStr: string = utils.createHighlightedLine(
    srcLine,
    matchingInfo.index,
    matchingStr,
    matchingInfo.index + matchingStr.length
  );
  const replacedStr: string = utils.createHighlightedLine(
    srcLine,
    matchingInfo.index,
    replaceObj[matchingStr],
    matchingInfo.index + matchingStr.length
  );

  utils.funcExecByFlag(
    optionManager.getInstance().confOpt! ||
      optionManager.getInstance().verboseOpt!,
    () =>
      utils.printLines(
        srcFileName,
        lineIdx,
        sourceStr,
        replacedStr,
        srcFileLines,
        resultLines
      )
  );

  utils.logByFlag(
    optionManager.getInstance().confOpt!,
    chalk.dim(
      chalk.italic(
        "## Press enter to replace the string or 'n' to skip this word or 's' to skip this file."
      )
    )
  );
};

const applyCSVTable = ({
  csvTbl,
  templateLValue,
  templateRValue,
}: {
  csvTbl: any;
  templateLValue: string;
  templateRValue: string;
}) => {
  const replaceObj: Object = {};
  templateRValue = templateRValue.trim().normalize();

  if (csvTbl.length > 0) {
    const csvColumnNames: string[] = Object.keys(csvTbl[0]);
    for (const csvRecord of csvTbl) {
      let key: string = templateLValue;
      let value: string = templateRValue!;

      for (const columnName of csvColumnNames) {
        const trimmedColumnName: string = columnName.trim();
        const result = util.handleCSVColKey({
          csvRecord,
          columnName: trimmedColumnName,
          templateLValue: key,
          templateRValue: value,
        });
        key = result.templateLValue;
        value = result.templateRValue;
      }

      if (replaceObj[key]) {
        throw new CreatingReplacingObjError(
          ERROR_CONSTANT.DUPLICATE_KEY(key, replaceObj[key])
        );
      }
      replaceObj[key] = value;
    }
  }

  return replaceObj;
};

const addMatchingPoint = ({
  srcLine,
  replacingKey,
  matchingPoints,
}: {
  srcLine: string;
  replacingKey: string;
  matchingPoints: MatchingPoints;
}) => {
  // reg of replacingKey is already processed
  const { escaped, str: escapedKey } = handleTemplateLValuesSpecialCharEscape(
    replacingKey
  );
  const regKey: string = handleTemplateLValuesLRefKey({
    escaped,
    templateLValue: escapedKey,
  });
  const replacingKeyReg: RegExp = new RegExp(regKey);
  const replacingKeyMatchingPts: Generator<
    RegExpExecArray,
    void,
    unknown
  > = matchAll(srcLine, replacingKeyReg);

  for (const replacingKeyMatchingPt of replacingKeyMatchingPts) {
    let existingMatchingPtIdx: number = -1;

    for (
      let matchingPtIdx: number = 0;
      matchingPtIdx < matchingPoints.length;
      matchingPtIdx++
    ) {
      const cands: MatchingPoint = matchingPoints[matchingPtIdx];
      const replacingKeyMatchingStr: string = replacingKeyMatchingPt[0];
      const longestStrInMatchingPt: string = cands[0][0];

      if (
        replacingKeyMatchingStr === longestStrInMatchingPt ||
        !longestStrInMatchingPt.includes(replacingKeyMatchingStr)
      ) {
        continue;
      }

      // Should be same matching point.
      if (
        longestStrInMatchingPt.length >
        replacingKeyMatchingPt.index - cands[0].index
      ) {
        existingMatchingPtIdx = matchingPtIdx;
        break;
      }
    }

    matchingPoints.replacingKey = replacingKey;
    if (existingMatchingPtIdx === -1) {
      matchingPoints[matchingPoints.length] = [replacingKeyMatchingPt];
    } else {
      matchingPoints[existingMatchingPtIdx].push(replacingKeyMatchingPt);
    }
  }

  return matchingPoints;
};

const sortMatchingPoints = ({ matchingPoints }) => {
  for (
    let matchingPtIdx: number = 0;
    matchingPtIdx < matchingPoints.length;
    matchingPtIdx++
  ) {
    const cands: MatchingPoint = matchingPoints[matchingPtIdx];
    cands.leastIdx = Number.MAX_SAFE_INTEGER;

    for (let candIdx = 0; candIdx < cands.length; candIdx++) {
      if (cands.leastIdx > cands[candIdx].index) {
        cands.leastIdx = cands[candIdx].index;
      }
    }
  }

  // Sort matching points to match in asc order
  matchingPoints.sort((lPt, rPt) => {
    return lPt.leastIdx - rPt.leastIdx;
  });

  return matchingPoints;
};

const getMatchingPoints = ({
  srcLine,
  replacingKeys,
}: {
  srcLine: string;
  replacingKeys: string[];
}) => {
  let matchingPoints: MatchingPoints = [];

  for (const replacingKey of replacingKeys) {
    matchingPoints = addMatchingPoint({
      srcLine,
      replacingKey,
      matchingPoints,
    });
  }
  matchingPoints = sortMatchingPoints({ matchingPoints });

  return matchingPoints;
};

const getMatchingPointsWithOnlyTemplate = ({
  srcLine,
  templateLValue,
}: {
  srcLine: string;
  templateLValue: string;
}) => {
  let matchingPoints: MatchingPoints = [];

  addMatchingPoint({
    srcLine,
    replacingKey: templateLValue,
    matchingPoints,
  });
  matchingPoints = sortMatchingPoints({ matchingPoints });

  return matchingPoints;
};

const getReplacedString = ({
  replaceObj,
  matchingStr,
  templateRValue,
}: {
  replaceObj: any;
  matchingStr: string;
  templateRValue: string;
}) => {
  const noEscapeOpt: boolean | undefined = optionManager.getInstance()[
    "no-escape"
  ];

  // exactly match :: use regexp and insert new item
  // not exactly match, but match in regexp :: use regexp and dont insert one
  if (noEscapeOpt && !replaceObj[matchingStr]) {
    for (const key of Object.keys(replaceObj)) {
      if (new RegExp(key).test(matchingStr)) {
        return replaceObj[key];
      }
    }
  }
  if (!replaceObj[matchingStr]) return templateRValue;
  return replaceObj[matchingStr];
};

const handleLRefKey = ({
  srcLine,
  lRefKey,
  regKey,
  replaceObj,
  matchingStr,
  rvalue,
}) => {
  const { escaped, str: escapedKey } = handleTemplateLValuesSpecialCharEscape(
    regKey
  );
  regKey = handleTemplateLValuesLRefKey({
    escaped,
    templateLValue: escapedKey,
  });

  const findMatchingStringReg: RegExp = new RegExp(regKey);

  const groupKeyMatching: RegExpMatchArray | null = srcLine.match(
    findMatchingStringReg
  );

  // continue to next case
  if (!groupKeyMatching || !groupKeyMatching.groups)
    return {
      matchingStr,
      replaceObj,
    };

  const groupKeyMatchingStr: string | undefined = groupKeyMatching.groups![
    lRefKey
  ];

  if (!groupKeyMatchingStr) {
    throw new InvalidRightReferenceError(ERROR_CONSTANT.NON_EXISTENT_GROUPKEY);
  }

  // 1. handle replacingKey's $[key] (transformed into group key)
  matchingStr = utils.replaceAll(
    matchingStr,
    `(?<${lRefKey}>)`,
    groupKeyMatchingStr
  );

  // 2. handle replacingObject's $[key]

  if (replaceObj[matchingStr]) {
    replaceObj[matchingStr] = utils.replaceAll(
      replaceObj[matchingStr],
      `$[${lRefKey}]`,
      groupKeyMatching.groups![lRefKey]
    );
  } else {
    // TODO: Need to remote old key here!!!!

    replaceObj[matchingStr] = utils.replaceAll(
      rvalue,
      `$[${lRefKey}]`,
      groupKeyMatching.groups![lRefKey]
    );
  }

  return {
    matchingStr,
    replaceObj,
  };
};

const replaceOneline = ({
  blockingReplaceFlag,
  csvTbl,
  endLine,
  excludeRegValue,
  lineIdx,
  replaceObj,
  replacingKeys,
  resultLines,
  srcFileLines,
  srcFileName,
  srcLine,
  startLine,
  templateLValue,
  templateRValue,
}: {
  blockingReplaceFlag: boolean;
  csvTbl: any;
  endLine: string | undefined;
  excludeRegValue: string | undefined;
  lineIdx: number;
  replaceObj: Object;
  replacingKeys: string[];
  resultLines: string[];
  srcFileLines: string[];
  srcFileName: string;
  srcLine: string;
  startLine: string | undefined;
  templateLValue: string;
  templateRValue: string;
}) => {
  if (excludeRegValue && srcLine.match(new RegExp(excludeRegValue))) {
    lineIdx++;
    return srcLine;
  }

  // handle blocking replace
  utils.funcExecByFlag(
    blockingReplaceFlag && !!startLine && srcLine.trim() === startLine.trim(),
    () => {
      utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
        debuggingInfoArr
          .getInstance()
          .append(`Encountered startLine on line ${lineIdx}`)
      );
      blockingReplaceFlag = false;
    }
  );

  utils.funcExecByFlag(
    !blockingReplaceFlag && !!endLine && srcLine.trim() === endLine.trim(),
    () => {
      utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
        debuggingInfoArr
          .getInstance()
          .append(`Encountered endLine on line ${lineIdx}`)
      );
      blockingReplaceFlag = true;
    }
  );

  if (!blockingReplaceFlag) {
    const hasOneToManyMatching = csvTbl.length < 1;
    const matchingPoints: MatchingPoints = hasOneToManyMatching
      ? getMatchingPointsWithOnlyTemplate({
          srcLine,
          templateLValue: templateLValue,
        })
      : getMatchingPoints({
          srcLine,
          replacingKeys,
        });

    for (
      let matchingPtIdx: number = 0;
      matchingPtIdx < matchingPoints.length;
      matchingPtIdx++
    ) {
      // Match the longest string first
      const matchingCandidates: MatchingPoint = matchingPoints[matchingPtIdx];

      for (
        let candidateIdx: number = 0;
        candidateIdx < matchingCandidates.length;
        candidateIdx++
      ) {
        const matchingInfo: RegExpExecArray = matchingCandidates[candidateIdx];
        let matchingStr: string = matchingInfo[0];

        // handle grouping value
        const findLRefKey: RegExp = new RegExp(/\$\[(?<lRefKey>[\d\w]*)\]/);
        const lRefKeys: Generator<RegExpExecArray, void, unknown> = matchAll(
          templateRValue,
          findLRefKey
        );
        const rvalue: string = hasOneToManyMatching
          ? templateRValue
          : replaceObj[matchingPoints.replacingKey!];

        for (const lRefKeyInfo of lRefKeys) {
          const lRefKey: string = lRefKeyInfo[1];
          if (hasOneToManyMatching) {
            const result = handleLRefKey({
              srcLine,
              lRefKey,
              regKey: templateLValue,
              replaceObj,
              matchingStr,
              rvalue,
            });
            matchingStr = result?.matchingStr;
            replaceObj = result?.replaceObj;
            continue;
          }

          const regKeys = Object.keys(replaceObj);

          for (let regKey of regKeys) {
            const result = handleLRefKey({
              srcLine,
              lRefKey,
              regKey,
              replaceObj,
              matchingStr,
              rvalue,
            });
            if (replaceObj !== result?.replaceObj) {
              matchingStr = result?.matchingStr;
              replaceObj = result?.replaceObj;
              break;
            }
          }
        }

        displayConsoleMsg({
          srcLine,
          matchingInfo,
          replaceObj,
          srcFileName,
          lineIdx,
          srcFileLines,
          resultLines,
        });

        let input: string = "y";
        optionManager.getInstance().confOpt && (input = readlineSync.prompt());

        if (yn(input) === false) {
          // skip this word. choose other candidate if you have a shorter string to replace.
          utils.logByFlag(
            optionManager.getInstance().confOpt! ||
              optionManager.getInstance().verboseOpt!,
            chalk.red("\nskip..")
          );
        } else if (input.startsWith("s")) {
          // skip this file.
          console.log(chalk.red(`\nskip '${srcFileName}'..`));
          return -1;
        } else {
          // replace string
          const replacedString: string = getReplacedString({
            replaceObj,
            matchingStr,
            templateRValue: templateRValue,
          });

          // push the index value of the other matching points.
          for (
            let otherPtsCandidateIdx = matchingPtIdx + 1;
            otherPtsCandidateIdx < matchingPoints.length;
            otherPtsCandidateIdx++
          ) {
            const otherPts: MatchingPoint =
              matchingPoints[otherPtsCandidateIdx];

            for (const candItem of otherPts) {
              candItem.index += replacedString.length - matchingStr.length;
            }
          }

          utils.logByFlag(
            optionManager.getInstance().confOpt! ||
              optionManager.getInstance().verboseOpt!,
            chalk.yellow("\nreplace..")
          );

          srcLine =
            srcLine.substr(0, matchingInfo.index) +
            replacedString +
            srcLine.substr(
              matchingInfo.index + matchingStr.length,
              srcLine.length
            );
          break;
        }
      }

      if (optionManager.getInstance().onceOpt) break;
    }

    lineIdx++;
    return srcLine;
  }
};

const replace = ({
  srcFileName,
  srcFileLines,
  csvTbl,
  templateLValue,
  templateRValue,
  excludeRegValue,
  startLine,
  endLine,
}: ReplacerArgument) => {
  const resultLines: string[] = [];

  if (templateLValue === "") {
    throw new InvalidLeftTemplateError(ERROR_CONSTANT.LEFT_TEMPLATE_EMPTY);
  }

  templateLValue = utils.restoreTemplateSpliter(
    templateLValue,
    constant.TEMPLATE_SPLITER
  );

  let replaceObj = applyCSVTable({
    csvTbl,
    templateLValue,
    templateRValue,
  });

  const replacingKeys: string[] = Object.keys(replaceObj);

  // sort by length -> prioritize and map keys with long values first.
  replacingKeys.sort(function (a, b) {
    return b.length - a.length || b.localeCompare(a);
  });

  let lineIdx: number = 1;
  let blockingReplaceFlag: boolean = !!startLine;

  for (let srcLine of srcFileLines) {
    const replacedLine = replaceOneline({
      blockingReplaceFlag,
      csvTbl,
      endLine,
      excludeRegValue,
      lineIdx,
      replaceObj,
      replacingKeys,
      resultLines,
      srcFileLines,
      srcFileName,
      srcLine,
      startLine,
      templateLValue,
      templateRValue,
    })
    if (replacedLine === -1) return -1;
    resultLines.push(replacedLine as string);
  }

  return resultLines;
};

export { replace, applyCSVTable, getMatchingPoints };
