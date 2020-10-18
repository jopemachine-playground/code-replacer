import matchAll from './matchAll'
import utils from './util'
import optionManager from './optionManager'
import { InvalidRightReferenceError, ERROR_CONSTANT } from './error'

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

// Not used
const handleTemplateRValuesCSVColKey = ({ csvTbl, csvLineIdx, templateRValue }) => {
  let value: string = templateRValue;
  const findCSVColumnVariableReg: RegExp = new RegExp(
    /\$\{(?<columnName>[\d\w]*)\}/
  );
  const csvColumnVars: Generator<RegExpExecArray, void, unknown> = matchAll(
    templateRValue,
    findCSVColumnVariableReg
  );
  for (const csvColumnVar of csvColumnVars) {
    const columnName: string = csvColumnVar.groups!.columnName;
    if (!csvTbl[0][columnName]) {
      throw new InvalidRightReferenceError(
        ERROR_CONSTANT.WRONG_COLUMN_R_Template
      );
    }

    value = utils.replaceAll(
      value,
      `\${${columnName}}`,
      csvTbl[csvLineIdx][columnName]
    );
  }

  return value;
}

const handleTemplateLValuesLRefKey = ({
  templateLValue,
  escaped,
}: {
  templateLValue: string;
  escaped: boolean;
}) => {
  return changeLRefKeyToGroupKeys(templateLValue, escaped);
};

const handleTemplateLValuesSpecialCharEscape = (templateLValue: string) => {
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

export {
  handleTemplateLValuesLRefKey,
  handleTemplateLValuesSpecialCharEscape,
  handleTemplateRValuesCSVColKey
}
