const chalk = require('chalk')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')

module.exports = {
  err: function () {
    console.log(chalk.yellow("See README.md or 'help' option for usage."))
    process.exit()
  },

  funcExecByFlag: function (flag, funcExecIfFlagIsTrue, funcExecIfFlagIsFalse) {
    return _.cond([
      [_.matches({ flag: true }), () => funcExecIfFlagIsTrue()],
      [
        _.matches({ flag: false }),
        () => {
          funcExecIfFlagIsFalse && funcExecIfFlagIsFalse()
        }
      ]
    ])({
      flag,
      funcExecIfFlagIsTrue,
      funcExecIfFlagIsFalse
    })
  },

  logByFlag: function (flag, logIfFlagIsTrue, logIfFlagIsFalse) {
    module.exports.funcExecByFlag(
      flag,
      () => console.log(logIfFlagIsTrue),
      () => logIfFlagIsFalse && console.log(logIfFlagIsFalse)
    )
  },

  createHighlightedLine: function (
    srcLine,
    previousMatchingIndex,
    matchingWord,
    afterMatchingIndex
  ) {
    return (
      srcLine.substr(0, previousMatchingIndex) +
      chalk.magentaBright(chalk.bgBlack(matchingWord)) +
      srcLine.substr(afterMatchingIndex, srcLine.length)
    ).trim()
  },

  getProperties: function (object) {
    let result = ''
    for (const key of Object.keys(object)) {
      result += `${key}=${object[key]}
`
    }
    return result
  },

  printLines: function (
    targetFileName,
    lineIdx,
    sourceStr,
    replacedStr,
    srcFileLines,
    resultLines
  ) {
    let previousLine = ''; let postLine = ''

    if (lineIdx - 2 >= 0) {
      previousLine =
        chalk.gray(`${lineIdx - 1}    `) +
        chalk.gray(resultLines[lineIdx - 2].trim())
    }

    if (lineIdx < srcFileLines.length + 1) {
      postLine =
        chalk.gray(`${lineIdx + 1}    `) +
        chalk.gray(srcFileLines[lineIdx].trim())
    }

    console.log(`
${chalk.gray(
  '------------------------------------------------------------------------------------------'
)}

${chalk.gray(`# Line: ${chalk.yellow(lineIdx)}, in '${chalk.yellow(targetFileName)}'`)}

${previousLine}
${chalk.blueBright(`${lineIdx}    `) + chalk.blueBright(sourceStr)}
${chalk.greenBright(`${lineIdx}    `) + chalk.greenBright(replacedStr)}
${postLine}
`)
  },

  handleSpecialCharacter: function (str) {
    // TODO: Need to handle more special characters here
    str = str.replace('\\', '\\\\')
    str = str.replace('(', '\\(')
    str = str.replace(')', '\\)')
    str = str.replace('.', '\\.')
    str = str.replace('?', '\\?')
    str = str.replace('!', '\\!')
    str = str.replace('$', '\\$')
    str = str.replace('^', '\\^')
    str = str.replace('{', '\\{')
    str = str.replace('}', '\\}')
    str = str.replace('[', '\\[')
    str = str.replace(']', '\\]')
    str = str.replace('|', '\\|')
    str = str.replace(']', '\\]')
    str = str.replace('/', '\\/')
    return str
  },

  findReplaceListFile: function (rlistDir, targetFileName) {
    if (fs.existsSync(`${rlistDir}${path.sep}rlist_${targetFileName}`)) {
      return `${rlistDir}${path.sep}rlist_${targetFileName}`
    } else if (
      fs.existsSync(`${rlistDir}${path.sep}rlist_${targetFileName.split('.')[0]}`)
    ) {
      return `${rlistDir}${path.sep}rlist_${targetFileName.split('.')[0]}`
    } else if (fs.existsSync(`.${path.sep}rlist`)) {
      return `.${path.sep}rlist`
    } else {
      return -1
    }
  },

  splitWithEscape (string, spliter) {
    let prevChar = ''
    let matching = false

    let frontStrBuf = ''
    let backStrBuf = ''

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i)

      // handle escape
      if (!matching && prevChar === '\\') {
        prevChar = char
        frontStrBuf += char
        continue
      }

      if (!matching && char === spliter) {
        matching = true
        continue
      }

      !matching && (frontStrBuf += char)
      matching && (backStrBuf += char)
      prevChar = char
    }

    return [frontStrBuf, backStrBuf]
  },

  setOptions (flags) {
    fs.writeFileSync('.env', '\ufeff' + module.exports.getProperties(flags), {
      encoding: 'utf8'
    })

    console.log(chalk.whiteBright('🌈 The current setting value has been saved!'))
  }
}
