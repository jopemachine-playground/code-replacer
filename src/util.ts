import chalk from 'chalk'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import csv from 'csv-parser'

export default {
  handleSpecialCharacter (str: string) {
    // TODO: Handle more special characters here if needed
    const spChars = [
      '\\',
      '(',
      ')',
      '.',
      '?',
      '!',
      '$',
      '^',
      '{',
      '}',
      '[',
      ']',
      '|',
      '/',
      '+',
      '*'
    ]

    for (const spChar of spChars) {
      str = this.replaceAll(str, spChar, `\\${spChar}`)
    }
    return str
  },

  handleCSVColKey ({ csvRecord, columnName, templateLValue, templateRValue }) {
    templateLValue = this.replaceAll(
      templateLValue,
      `\${${columnName}}`,
      csvRecord[columnName]
    );

    templateRValue = this.replaceAll(
      templateRValue!,
      `\${${columnName}}`,
      csvRecord[columnName]
    );

    return {
      templateLValue,
      templateRValue
    }
  },

  readCsv: async function (csvFilePath: string) {
    const csvResult: Object[] = []
    return new Promise((resolve, reject) => {
      try {
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (data: any) => csvResult.push(data))
          .on('end', () => {
            resolve(csvResult)
          })
      } catch (e) {
        reject(e)
      }
    })
  },

  funcExecByFlag: function (flag: boolean, funcExecIfFlagIsTrue: Function) {
    return flag && funcExecIfFlagIsTrue()
  },

  _funcExecByFlag: function (flag, funcExecIfFlagIsTrue, funcExecIfFlagIsFalse) {
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

  logByFlag: function (flag: boolean, logIfFlagIsTrue: string) {
    return flag && console.log(logIfFlagIsTrue)
  },

  _logByFlag: function (flag, logIfFlagIsTrue, logIfFlagIsFalse) {
    module.exports.funcExecByFlag(
      flag,
      () => console.log(logIfFlagIsTrue),
      () => logIfFlagIsFalse && console.log(logIfFlagIsFalse)
    )
  },

  createHighlightedLine: function (
    srcLine: string,
    previousMatchingIndex: number,
    matchingWord: string,
    afterMatchingIndex: number
  ) {
    return (
      srcLine.substr(0, previousMatchingIndex) +
      chalk.magentaBright(chalk.bgBlack(matchingWord)) +
      srcLine.substr(afterMatchingIndex, srcLine.length)
    ).trim()
  },

  getProperties: function (object: Object) {
    let result = ''
    for (const key of Object.keys(object)) {
      result += `${key}=${object[key]}
`
    }
    return result
  },

  printLines: function (
    srcFileName: string,
    lineIdx: number,
    sourceStr: string,
    replacedStr: string,
    srcFileLines: string[],
    resultLines: string[]
  ) {
    let previousLine = ''; let postLine = ''

    if (lineIdx - 2 >= 0) {
      previousLine =
        chalk.gray(`${lineIdx - 1}    `) +
        chalk.gray(resultLines[lineIdx - 2].trim())
    }

    if (lineIdx < srcFileLines.length) {
      postLine =
        chalk.gray(`${lineIdx + 1}    `) +
        chalk.gray(srcFileLines[lineIdx].trim())
    }

    console.log(`
${chalk.gray(
  '------------------------------------------------------------------------------------------'
)}

${chalk.gray(`# Line: ${chalk.yellow(lineIdx)}, in '${chalk.yellow(srcFileName)}'`)}

${previousLine}
${chalk.blueBright(`${lineIdx}    `) + chalk.blueBright(sourceStr)}
${chalk.greenBright(`${lineIdx}    `) + chalk.greenBright(replacedStr)}
${postLine}
`)
  },

  findReplaceListFile: function (rlistDir: string, srcFileName: string) {
    if (fs.existsSync(`${rlistDir}${path.sep}rlist_${srcFileName}.csv`)) {
      return `${rlistDir}${path.sep}rlist_${srcFileName}.csv`
    } else if (
      fs.existsSync(`${rlistDir}${path.sep}rlist_${srcFileName.split('.')[0]}.csv`)
    ) {
      return `${rlistDir}${path.sep}rlist_${srcFileName.split('.')[0]}.csv`
    } else if (fs.existsSync(`.${path.sep}rlist.csv`)) {
      return `.${path.sep}rlist.csv`
    } else {
      return -1
    }
  },

  splitWithEscape (string: string, spliter: string) {
    let prevChar = ''
    let matching = false

    let frontStrBuf = ''
    let backStrBuf = ''

    let spliterBuf = ''

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i)

      // handle escape
      if (!matching && prevChar === '\\') {
        prevChar = char
        frontStrBuf += char
        continue
      }

      if (!matching && char === spliter.charAt(0)) {
        spliterBuf = char
        for (
          let spliterIdx = i + 1;
          spliterIdx < i + spliter.length && spliterIdx < string.length;
          spliterIdx++
        ) {
          if (spliter.charAt(spliterBuf.length) === string.charAt(spliterIdx)) {
            spliterBuf += string.charAt(spliterIdx)
          } else {
            break
          }
        }
        if (spliterBuf === spliter) {
          matching = true
          i += spliterBuf.length - 1
          continue
        }
      }

      !matching && (frontStrBuf += char)
      matching && (backStrBuf += char)
      prevChar = char
    }

    return [frontStrBuf, backStrBuf]
  },

  setOptions (flags: Object) {
    fs.writeFileSync('.env', '\ufeff' + module.exports.getProperties(flags), {
      encoding: 'utf8'
    })

    console.log(chalk.whiteBright('🌈  The current setting value has been saved! 🌈'))
  },

  replaceAll (str: string, searchStr: string, replaceStr: string) {
    return str.split(searchStr).join(replaceStr)
  },

  showDefaultOptions () {
    const env = fs.readFileSync('.env', {
      encoding: 'utf8'
    })
    const defaultValues = env.split('\n')

    console.log(chalk.whiteBright('🌈  Current default setting is as follows. 🌈'))

    for (const devaultValue of defaultValues) {
      const [key, value] = devaultValue.split('=')
      if (!key || !value) continue
      console.log(chalk.blue(`${key.trim()}: ${value}`))
    }
  }
}
