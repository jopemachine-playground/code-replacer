import chalk from "chalk";
import matchAll from "./matchAll";
import yn from "yn";
import readlineSync from "readline-sync";
import debuggingInfoArr from "./debuggingInfo";
import optionManager from "./optionManager";
import {
  handleSpecialCharEscapeInTemplateLValue,
  handleGroupKeysInTemplateLValue,
  handleLRefKeyInTemplateRValue,
  Template,
  handleLRefKeyInTemplateLValue
} from "./template";
import {
  CreatingReplacingObjError,
  InvalidLeftReferenceError,
  ERROR_CONSTANT,
} from "./error";

import utils from "./util";
import { MatchingPoints } from "./matchingPoints";
import { ReplacerArgument } from "./type/replacerArgument";
import { MatchingPoint } from "./type/matchingPoint";

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
      utils.printLines({
        srcFileName,
        lineIdx,
        sourceStr,
        replacedStr,
        srcFileLines,
        resultLines,
      })
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
  template: templateObj
}: {
  csvTbl: any;
  template: Template;
}) => {
  const replaceObj: object = {};

  if (csvTbl.length > 0) {
    const csvColumnNames: string[] = Object.keys(csvTbl[0]);
    for (const csvRecord of csvTbl) {
      let key: string = templateObj.lvalue;
      let value: string = templateObj.rvalue;

      for (const columnName of csvColumnNames) {
        const trimmedColumnName: string = columnName.trim();
        const result = utils.handleCSVColKey({
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

const getMatchingPoints = ({
  srcLine,
  replacingKeys,
  template
}: {
  srcLine: string;
  replacingKeys: string[];
  template: Template;
}) => {
  const matchingPoints: MatchingPoints = new MatchingPoints();

  for (const replacingKey of replacingKeys) {
    matchingPoints.addMatchingPoint({
      srcLine,
      replacingKey,
      template
    });
  }
  matchingPoints.sortMatchingPoints();

  return matchingPoints;
};

const getMatchingPointsWithOnlyTemplate = ({
  srcLine,
  templateLValue,
  template
}: {
  srcLine: string;
  templateLValue: string;
  template: Template;
}) => {
  const matchingPoints: MatchingPoints = new MatchingPoints();

  matchingPoints.addMatchingPoint({
    srcLine,
    replacingKey: templateLValue,
    template
  });
  matchingPoints.sortMatchingPoints();

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
      const regexMatch = new RegExp(key).test(matchingStr);
      if (regexMatch) {
        return replaceObj[key];
      }
    }
  }

  const exactMatch = replaceObj[matchingStr];
  const constantMatch = !replaceObj[matchingStr];
  if (constantMatch) return templateRValue;

  return exactMatch;
};


// Todo: Need to refactor function
const handleLRefKey = ({
  srcLine,
  lRefKey,
  regKey,
  replaceObj,
  matchingStr,
  rvalue,
  template
}: {
  srcLine: string;
  lRefKey: string;
  regKey: string;
  replaceObj: object;
  matchingStr: string;
  rvalue: string;
  template: Template;
}) => {
  regKey = handleLRefKeyInTemplateLValue({
    templateLValue: handleSpecialCharEscapeInTemplateLValue(regKey),
  });

  // regKey = template.getTemplateLValueGroupKeyForm(escaped);

  const findMatchingStringReg: RegExp = new RegExp(regKey);

  const groupKeyMatching: RegExpMatchArray | null = srcLine.match(
    findMatchingStringReg
  );

  // continue to next case
  if (!groupKeyMatching || !groupKeyMatching.groups) {
    return {
      continueFlag: true
    };
  }

  const groupKeyMatchingStr: string | undefined =
    groupKeyMatching.groups![lRefKey] || groupKeyMatching.groups![lRefKey + "_1"];

  if (!groupKeyMatchingStr) {
    throw new InvalidLeftReferenceError(ERROR_CONSTANT.NON_EXISTENT_GROUPKEY);
  }

  const newLValue = handleGroupKeysInTemplateLValue({
    matchingStr,
    lRefKey,
    groupKeyMatchingStr,
  });

  const newRValue = handleLRefKeyInTemplateRValue({
    replaceObj,
    matchingStr,
    lRefKey,
    groupKeyMatching,
    rvalue,
  });

  return {
    newLValue,
    newRValue,
  };
};

const replaceOneline = ({
  csvTbl,
  excludeRegValue,
  lineIdx,
  replaceObj,
  replacingKeys,
  resultLines,
  srcFileLines,
  srcFileName,
  srcLine,
  template: templateObj
}: {
  csvTbl: any;
  excludeRegValue: string | undefined;
  lineIdx: number;
  replaceObj: object;
  replacingKeys: string[];
  resultLines: string[];
  srcFileLines: string[];
  srcFileName: string;
  srcLine: string;
  template: Template
}) => {

  if (excludeRegValue && srcLine.match(new RegExp(excludeRegValue))) {
    lineIdx++;
    return srcLine;
  }

  const hasOneToManyMatching = csvTbl.length < 1;
  const matchingPoints: MatchingPoints = hasOneToManyMatching
    ? getMatchingPointsWithOnlyTemplate({
        srcLine,
        templateLValue: templateObj.lvalue,
        template: templateObj
      })
    : getMatchingPoints({
        srcLine,
        replacingKeys,
        template: templateObj
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
        templateObj.rvalue,
        findLRefKey
      );
      const rvalue: string = hasOneToManyMatching
        ? templateObj.rvalue
        : replaceObj[matchingPoints.replacingKey!];

      for (const lRefKeyInfo of lRefKeys) {
        const lRefKey: string = lRefKeyInfo[1];
        if (hasOneToManyMatching) {
          const result = handleLRefKey({
            srcLine,
            lRefKey,
            regKey: templateObj.lvalue,
            replaceObj,
            matchingStr,
            rvalue,
            template: templateObj
          });
          matchingStr = result.newLValue!;
          replaceObj[matchingStr] = result.newRValue;
          continue;
        }

        const replaceObjectsKey = Object.keys(replaceObj);
        for (const regKey of replaceObjectsKey) {
          const result = handleLRefKey({
            srcLine,
            lRefKey,
            regKey,
            replaceObj,
            matchingStr,
            rvalue,
            template: templateObj
          });

          if (result.continueFlag === true) {
            continue;
          } else {
            matchingStr = result.newLValue!;
            replaceObj[matchingStr] = result.newRValue;
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
        const replacedString: string = getReplacedString({
          replaceObj,
          matchingStr,
          templateRValue: templateObj.rvalue,
        });

        // push the index value of the other matching points.
        matchingPoints.pushIndex({
          matchingPtIdx,
          matchingStr,
          replacedString,
        });

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
};

const getReplacedCode = ({
  srcFileName,
  srcFileLines,
  csvTbl,
  template: templateObj,
  excludeRegValue,
  startLine,
  endLine,
}: ReplacerArgument) => {
  const resultLines: string[] = [];

  const replaceObj = applyCSVTable({
    csvTbl,
    template: templateObj
  });

  const replacingKeys: string[] = Object.keys(replaceObj);

  // sort by length -> prioritize and map keys with long values first.
  replacingKeys.sort((a, b) => {
    return b.length - a.length || b.localeCompare(a);
  });

  let lineIdx: number = 1;
  let blockingReplaceFlag: boolean = !!startLine;

  for (const srcLine of srcFileLines) {
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

    let resultLine: string | number = srcLine;
    if (!blockingReplaceFlag) {
      resultLine = replaceOneline({
        csvTbl,
        lineIdx,
        excludeRegValue,
        replaceObj,
        replacingKeys,
        resultLines,
        srcFileLines,
        srcFileName,
        srcLine,
        template: templateObj
      }) as string;
    }
    if (resultLine as unknown as number === -1) return -1;
    resultLines.push(resultLine as string);
    lineIdx++;
  }

  return resultLines;
};

export { getReplacedCode, applyCSVTable, getMatchingPoints };
