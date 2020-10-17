const matchAll = require('./matchAll')
const { replaceAll, handleSpecialCharacter } = require('./util')
const optionManager = require('./optionManager')
const { InvalidRightReferenceError, ERROR_CONSTANT } = require('./error')

const changeLRefKeyToGroupKeys = (string, hasEscaped) => {
  const findLRefKeyReg = hasEscaped
    ? /\\\$\\\[(?<lRefKey>[\d\w]*)\\\]/
    : /\$\[(?<lRefKey>[\d\w]*)\]/
  const findLRefKeyRegExp = new RegExp(findLRefKeyReg)
  const LReftKeysInLValue = matchAll(string, findLRefKeyRegExp)

  for (const LRefKeyInfo of LReftKeysInLValue) {
    const lRefKey = LRefKeyInfo[1]
    const lRefKeyReg = hasEscaped ? `\\$\\[${lRefKey}\\]` : `$[${lRefKey}]`
    string = replaceAll(
      string,
      lRefKeyReg,
      `(?<${lRefKey}>[\\d\\w]*)`
    )
  }

  return string
}

// Not used
const handleTemplateRValuesCSVColKey = ({ csvTbl, csvLineIdx, templateRValue }) => {
  let value = templateRValue
  const findCSVColumnVariableReg = new RegExp(/\$\{(?<columnName>[\d\w]*)\}/)
  const csvColumnVars = matchAll(templateRValue, findCSVColumnVariableReg)
  for (const csvColumnVar of csvColumnVars) {
    const columnName = csvColumnVar.groups.columnName
    if (!csvTbl[0][columnName]) {
      throw new InvalidRightReferenceError(ERROR_CONSTANT.WRONG_COLUMN_R_Template)
    }

    value = replaceAll(
      value,
      `\${${columnName}}`,
      csvTbl[csvLineIdx][columnName]
    )
  }

  return value
}

const handleTemplateLValuesLRefKey = ({ templateLValue, escaped }) => {
  return changeLRefKeyToGroupKeys(templateLValue, escaped)
}

const handleTemplateLValuesSpecialCharEscape = (templateLValue) => {
  if (optionManager.getInstance()['no-escape']) {
    return {
      escaped: false,
      str: templateLValue
    }
  } else {
    return {
      escaped: true,
      str: handleSpecialCharacter(templateLValue)
    }
  }
}

module.exports = {
  handleTemplateLValuesLRefKey,
  handleTemplateLValuesSpecialCharEscape,
  handleTemplateRValuesCSVColKey
}
