import matchAll from './matchAll'
import utils from './util'
import optionManager from './optionManager'

const changeLRefKeyToGroupKeys = (string: string, hasEscaped: boolean) => {
  const findLRefKeyReg: RegExp = hasEscaped
    ? /\\\$\\\[(?<lRefKey>[\d\w]*)\\\]/
    : /\$\[(?<lRefKey>[\d\w]*)\]/
  const findLRefKeyRegExp: RegExp = new RegExp(findLRefKeyReg)
  const LReftKeysInLValue: Generator<RegExpExecArray, void, unknown> = matchAll(
    string,
    findLRefKeyRegExp
  );

  for (const LRefKeyInfo of LReftKeysInLValue) {
    const lRefKey: string = LRefKeyInfo[1]
    const lRefKeyReg: string = hasEscaped ? `\\$\\[${lRefKey}\\]` : `$[${lRefKey}]`
    string = utils.replaceAll(
      string,
      lRefKeyReg,
      `(?<${lRefKey}>[\\d\\w]*)`
    )
  }

  return string
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
  return utils.replaceAll(matchingStr, `(?<${lRefKey}>)`, groupKeyMatchingStr);
};

const handleLRefKeyInTemplateRValue = ({
  replaceObj,
  matchingStr,
  lRefKey,
  groupKeyMatching,
  rvalue
}: {
  replaceObj: Object;
  matchingStr: string;
  lRefKey: string;
  groupKeyMatching: RegExpMatchArray
  rvalue: string;
}) => {
  if (replaceObj[matchingStr]) {
    return utils.replaceAll(
      replaceObj[matchingStr],
      `$[${lRefKey}]`,
      groupKeyMatching.groups![lRefKey]
    );
  } else {
    // TODO: Need to remote old key here!!!!

    return utils.replaceAll(
      rvalue,
      `$[${lRefKey}]`,
      groupKeyMatching.groups![lRefKey]
    );
  }
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