import chalk from "chalk";
import matchAll from "./matchAll";
import yn from "yn";
import readlineSync from "readline-sync";
import debuggingInfoArr from "./debuggingInfo";
import optionManager from "./optionManager";
import {
  handleSpecialCharEscapeInTemplateLValue,
  handleGroupKeysInTemplateLValue,
  handleLRefKeyInTemplateLValue,
  handleLRefKeyInTemplateRValue,
  Template,
} from "./template";
import {
  InvalidLeftReferenceError,
  ERROR_CONSTANT,
} from "./error";

import utils from "./util";
import { MatchingPoints } from "./matchingPoints";
import { ReplacerArgument } from "./type/replacerArgument";
import { MatchingPoint } from "./type/matchingPoint";
import ReplacingListDict from "./replacingListDict";

const displayConsoleMsg = ({
  lineIdx,
  matchingInfo,
  replacingListDict,
  resultLines,
  srcFileLines,
  srcFileName,
  srcLine,
}: {
  lineIdx: number;
  matchingInfo: any;
  replacingListDict: ReplacingListDict;
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
    matchingInfo.index + matchingStr.length,
    "redBright"
  );
  const replacedStr: string = utils.createHighlightedLine(
    srcLine,
    matchingInfo.index,
    replacingListDict.get(matchingStr)!,
    matchingInfo.index + matchingStr.length,
    "green"
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
  replacingListDict,
  matchingStr,
  templateRValue,
}: {
  replacingListDict: ReplacingListDict;
  matchingStr: string;
  templateRValue: string;
}) => {
  const noEscapeOpt: boolean | undefined = optionManager.getInstance()[
    "no-escape"
  ];

  // exactly match :: use regexp and insert new item
  // not exactly match, but match in regexp :: use regexp and dont insert one
  if (noEscapeOpt && !replacingListDict.get(matchingStr)) {
    for (const key of replacingListDict.keys()) {
      const regexMatch = new RegExp(key).test(matchingStr);
      if (regexMatch) {
        return replacingListDict.get(key);
      }
    }
  }

  const exactMatch = replacingListDict.get(matchingStr);
  const constantMatch = !replacingListDict.get(matchingStr);
  if (constantMatch) return templateRValue;

  return exactMatch;
};


// Todo: Need to refactor function
const handleLRefKey = ({
  srcLine,
  lRefKey,
  replacingListDict,
  matchingStr,
  lvalue,
  rvalue,
  template
}: {
  srcLine: string;
  lRefKey: string;
  replacingListDict: ReplacingListDict;
  matchingStr: string;
  lvalue: string;
  rvalue: string;
  template: Template;
}) => {
  lvalue = handleLRefKeyInTemplateLValue({
    templateLValue: handleSpecialCharEscapeInTemplateLValue(lvalue),
  });

  // regKey = template.getTemplateLValueGroupKeyForm(escaped);

  const findMatchingStringReg: RegExp = new RegExp(lvalue);
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
    replacingListDict,
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
  replacingListDict,
  resultLines,
  srcFileLines,
  srcFileName,
  srcLine,
  template: templateObj
}: {
  csvTbl: any;
  excludeRegValue: string | undefined;
  lineIdx: number;
  replacingListDict: ReplacingListDict;
  resultLines: string[];
  srcFileLines: string[];
  srcFileName: string;
  srcLine: string;
  template: Template
}) => {

  if (excludeRegValue && srcLine.match(new RegExp(excludeRegValue))) {
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
        replacingKeys: replacingListDict.replacingKeys,
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
        : replacingListDict.get(matchingPoints.replacingKey!)!;

      const oldKeysToDelete: Set<string> = new Set();
      for (const lRefKeyInfo of lRefKeys) {
        const lRefKey: string = lRefKeyInfo[1];
        if (hasOneToManyMatching) {
          const result = handleLRefKey({
            srcLine,
            lRefKey,
            replacingListDict,
            matchingStr,
            template: templateObj,
            lvalue: templateObj.lvalue,
            rvalue,
          });
          matchingStr = result.newLValue!;
          replacingListDict.set(matchingStr, result.newRValue!);
          continue;
        }

        const replaceObjectsKey = replacingListDict.keys();
        for (const replaceObjectKey of replaceObjectsKey) {
          const result = handleLRefKey({
            srcLine,
            lRefKey,
            replacingListDict,
            matchingStr,
            template: templateObj,
            lvalue: replaceObjectKey,
            rvalue,
          });

          if (result.continueFlag === true) {
            continue;
          } else {
            matchingStr = result.newLValue!;
            replacingListDict.set(matchingStr, result.newRValue!);
            if (replaceObjectKey !== matchingStr) oldKeysToDelete.add(replaceObjectKey);
            break;
          }
        }
      }

      // Remove the keys that have been replaced and are not needed
      for (const oldKey of oldKeysToDelete) {
        replacingListDict.delete(oldKey);
      }

      displayConsoleMsg({
        srcLine,
        matchingInfo,
        replacingListDict,
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
          replacingListDict,
          matchingStr,
          templateRValue: templateObj.rvalue,
        })!;

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
  const replacingListDict: ReplacingListDict = new ReplacingListDict(
    csvTbl,
    templateObj
  );

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
        replacingListDict,
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

export { getReplacedCode, getMatchingPoints };
