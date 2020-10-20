import matchAll from './matchAll'
import utils from './util'
import optionManager from './optionManager'

const changeLRefKeyToGroupKeys = (str: string, hasEscaped: boolean) => {
  const findLRefKeyReg: RegExp = hasEscaped
    ? /\\\$\\\[(?<lRefKey>[\d\w]*)\\\]/
    : /\$\[(?<lRefKey>[\d\w]*)\]/
  const findLRefKeyRegExp: RegExp = new RegExp(findLRefKeyReg)
  const LReftKeysInLValue: Generator<RegExpExecArray, void, unknown> = matchAll(
    str,
    findLRefKeyRegExp
  );

  const cntFrequency: Map<string, number> = new Map;

  for (const LRefKeyInfo of LReftKeysInLValue) {
    const lRefKey: string = LRefKeyInfo[1]

    if (cntFrequency.has(lRefKey)) {
      cntFrequency.set(lRefKey, cntFrequency.get(lRefKey)! + 1);
    } else {
      cntFrequency.set(lRefKey, 1);
    }

    const lRefKeyReg: string = hasEscaped ? `\\$\\[${lRefKey}\\]` : `$[${lRefKey}]`

    str = str.replace(
      lRefKeyReg,
      `(?<${lRefKey}_${cntFrequency.get(lRefKey)}>[\\d\\w]*)`
    );
  }

  return str
}

const handleLRefKeyInTemplateLValue = ({
  templateLValue,
  escaped,
}: {
  templateLValue: string;
  escaped: boolean;
}) => {
  return changeLRefKeyToGroupKeys(templateLValue, escaped);
};

const handleSpecialCharEscapeInTemplateLValue = (templateLValue: string) => {
  if (optionManager.getInstance()['no-escape']) {
    return {
      escaped: false,
      str: templateLValue
    }
  } else {
    return {
      escaped: true,
      str: utils.handleSpecialCharacter(templateLValue)
    }
  }
}

const handleGroupKeysInTeamplateLValue = ({
  lRefKey,
  matchingStr,
  groupKeyMatchingStr,
}: {
  lRefKey: string
  matchingStr: string
  groupKeyMatchingStr: string
}) => {
  let index = 1;
  while (matchingStr.includes(`(?<${lRefKey}_${index}>)`)) {
    matchingStr = matchingStr.replace(`(?<${lRefKey}_${index}>)`, groupKeyMatchingStr);
    index++;
  }
  return matchingStr;
};

const handleLRefKeyInTemplateRValue = ({
  replaceObj,
  matchingStr,
  lRefKey,
  groupKeyMatching,
  rvalue
}: {
  replaceObj: object;
  matchingStr: string;
  lRefKey: string;
  groupKeyMatching: RegExpMatchArray
  rvalue: string;
}) => {
  let result: string = replaceObj[matchingStr] ? replaceObj[matchingStr] : rvalue;

  if (result.includes(`$[${lRefKey}]`)) {
    result = utils.replaceAll(
      result,
      `$[${lRefKey}]`,
      // always first matching
      groupKeyMatching.groups![lRefKey]
        ? groupKeyMatching.groups![lRefKey]
        : groupKeyMatching.groups![lRefKey + "_1"]
    );
  }

  return result;
};

export {
  handleLRefKeyInTemplateLValue,
  handleLRefKeyInTemplateRValue,
  handleSpecialCharEscapeInTemplateLValue,
  handleGroupKeysInTeamplateLValue,
}

// Not used
// const handleTemplateRValuesCSVColKey = ({ csvTbl, csvLineIdx, templateRValue }) => {
//   let value: string = templateRValue;
//   const findCSVColumnVariableReg: RegExp = new RegExp(
//     /\$\{(?<columnName>[\d\w]*)\}/
//   );
//   const csvColumnVars: Generator<RegExpExecArray, void, unknown> = matchAll(
//     templateRValue,
//     findCSVColumnVariableReg
//   );
//   for (const csvColumnVar of csvColumnVars) {
//     const columnName: string = csvColumnVar.groups!.columnName;
//     if (!csvTbl[0][columnName]) {
//       throw new InvalidRightReferenceError(
//         ERROR_CONSTANT.WRONG_COLUMN_R_Template
//       );
//     }

//     value = utils.replaceAll(
//       value,
//       `\${${columnName}}`,
//       csvTbl[csvLineIdx][columnName]
//     );
//   }

//   return value;
// }