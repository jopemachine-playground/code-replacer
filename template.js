const matchAll = require('./matchAll')
const { replaceAll } = require('./util')

handleSpecialCharacter = (str) => {
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

changeTemplateStringToGroupKeys = (string, hasEscaped) => {
  const findGroupKeyReg = hasEscaped
    ? /\\\$\\\[(?<groupKey>[\d\w]*)\\\]/
    : /\$\[(?<groupKey>[\d\w]*)\]/
  const findGroupKeyRegExp = new RegExp(findGroupKeyReg)
  const groupKeysInLValue = matchAll(string, findGroupKeyRegExp)

  for (const groupKeyInfo of groupKeysInLValue) {
    const groupKey = groupKeyInfo[1]
    const groupKeyReg = hasEscaped ? `\\$\\[${groupKey}\\]` : `$[${groupKey}]`
    string = module.exports.replaceAll(
      string,
      groupKeyReg,
      `(?<${groupKey}>[\\d\\w]*)`
    )
  }

  return string
}

module.exports = (isReg, templateLValue) => {
  if (isReg) {
    return changeTemplateStringToGroupKeys(templateLValue, false)
  } else {
    return changeTemplateStringToGroupKeys(
      handleSpecialCharacter(templateLValue),
      true
    )
  }
}
