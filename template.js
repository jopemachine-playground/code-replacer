const matchAll = require('./matchAll')
const { replaceAll } = require('./util')
const optionManager = require('./optionManager')

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

module.exports = (templateLValue) => {
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
