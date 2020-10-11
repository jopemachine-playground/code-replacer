const matchAll = require('./matchAll')
const { replaceAll } = require('./util')
const optionManager = require('./optionManager')
const { InvalidRightReferenceError, ERROR_CONSTANT } = require('./error')

const handleSpecialCharacter = (str) => {
  // TODO: Need to handle more special characters here
  str = replaceAll(str, '\\', '\\\\')
  str = replaceAll(str, '(', '\\(')
  str = replaceAll(str, ')', '\\)')
  str = replaceAll(str, '.', '\\.')
  str = replaceAll(str, '?', '\\?')
  str = replaceAll(str, '!', '\\!')
  str = replaceAll(str, '$', '\\$')
  str = replaceAll(str, '^', '\\^')
  str = replaceAll(str, '{', '\\{')
  str = replaceAll(str, '}', '\\}')
  str = replaceAll(str, '[', '\\[')
  str = replaceAll(str, ']', '\\]')
  str = replaceAll(str, '|', '\\|')
  str = replaceAll(str, '/', '\\/')

  return str
}

const changeTemplateStringToGroupKeys = (string, hasEscaped) => {
  const findGroupKeyReg = hasEscaped
    ? /\\\$\\\[(?<groupKey>[\d\w]*)\\\]/
    : /\$\[(?<groupKey>[\d\w]*)\]/
  const findGroupKeyRegExp = new RegExp(findGroupKeyReg)
  const groupKeysInLValue = matchAll(string, findGroupKeyRegExp)

  for (const groupKeyInfo of groupKeysInLValue) {
    const groupKey = groupKeyInfo[1]
    const groupKeyReg = hasEscaped ? `\\$\\[${groupKey}\\]` : `$[${groupKey}]`
    string = replaceAll(
      string,
      groupKeyReg,
      `(?<${groupKey}>[\\d\\w]*)`
    )
  }

  return string
}

const handleTemplateRValue = ({ csvTbl, csvLineIdx, templateRValue }) => {
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

const handleTemplateLValue = (templateLValue) => {
  const isReg = optionManager.getInstance()['no-escape']
  if (isReg) {
    return changeTemplateStringToGroupKeys(templateLValue, false)
  } else {
    return changeTemplateStringToGroupKeys(
      handleSpecialCharacter(templateLValue),
      true
    )
  }
}

module.exports = {
  handleTemplateLValue,
  handleTemplateRValue
}
