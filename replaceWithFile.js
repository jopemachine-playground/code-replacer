const fs = require('fs')
const path = require('path')
const boxen = require('boxen')
const StringBuffer = require('./stringBuffer')
const chalk = require('chalk')
const parseSourceFile = require('./parseSourceFile')
const replaceExecute = require('./replacer')

const {
  changeTemplateStringToGroupKeys,
  findReplaceListFile,
  logByFlag,
  funcExecByFlag,
  splitWithEscape
} = require('./util')

const debuggingInfoArr = new StringBuffer()

parseRList = ({
  replaceListFile,
  srcFileName,
  rlistSeparator,
  templateLValue,
  templateRValue,
  verboseOpt,
  debugOpt
}) => {
  const replaceObj = {}

  if (!replaceListFile) {
    replaceListFile = findReplaceListFile(`.${path.sep}rlist`, srcFileName)
  } else if (fs.lstatSync(replaceListFile).isDirectory()) {
    replaceListFile = findReplaceListFile(replaceListFile, srcFileName)
  }

  funcExecByFlag(!verboseOpt && replaceListFile !== -1, () =>
    console.log(
      chalk.dim(
        chalk.italic('** replaceList file: ' + path.resolve(replaceListFile))
      )
    )
  )

  funcExecByFlag(debugOpt && replaceListFile !== -1, () =>
    debuggingInfoArr.append(
      '** replaceList file: ' + path.resolve(replaceListFile)
    )
  )

  if (replaceListFile !== -1) {
    const propertyLines = fs
      .readFileSync(replaceListFile)
      .toString()
      .split('\n')

    for (const propertyLine of propertyLines) {
      if (!propertyLine.includes(rlistSeparator)) continue
      const [key, ...value] = propertyLine.split(rlistSeparator)

      replaceObj[key.trim().normalize()] = value.join(rlistSeparator).trim()
    }
  } else if (replaceListFile === -1 && (!templateLValue || !templateRValue)) {
    console.log(
      chalk.red(
        "You should specify the valid 'template' value or the rlist file. \nPlease refer to README.md\nExit.."
      )
    )
    return -1
  }

  return replaceObj
}

module.exports = async function ({
  src: srcFile,
  replaceList: replaceListFile,
  sep: rlistSeparator,
  verbose: verboseOpt,
  once: onceOpt,
  startLinePatt,
  endLinePatt,
  dst: dstFileName,
  conf: confOpt,
  template,
  excludeReg: excludeRegValue,
  debug: debugOpt,
  overwrite: overwriteOpt
}) {
  if (!rlistSeparator) rlistSeparator = '='
  let templateLValue, templateRValue
  if (template) {
    const templateVals = splitWithEscape(template, '->')
    templateLValue = templateVals[0]
    templateRValue = templateVals[1]
  }

  templateLValue = changeTemplateStringToGroupKeys(templateLValue)

  const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
    srcFile,
    verboseOpt,
    debugOpt
  })

  const replaceObj = parseRList({
    replaceListFile,
    srcFileName,
    rlistSeparator,
    templateLValue,
    templateRValue,
    verboseOpt,
    debugOpt
  })

  if (replaceObj === -1) return

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`startLinePatt: ${startLinePatt}`)
  )
  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`endLinePatt: ${endLinePatt}`)
  )

  const resultLines = replaceExecute({
    srcFileName,
    srcFileLines,
    replaceObj,
    templateLValue,
    templateRValue,
    excludeRegValue,
    replaceListFile,
    startLinePatt,
    endLinePatt,
    verboseOpt,
    confOpt,
    onceOpt
  })

  if (resultLines === -1) return

  const dstFilePath = overwriteOpt
    ? srcFile
    : dstFileName
      ? path.resolve(dstFileName)
      : srcFilePath + path.sep + '__replacer__.' + srcFileName

  fs.writeFileSync(dstFilePath, '\ufeff' + resultLines.join('\n'), {
    encoding: 'utf8'
  })

  const debugInfoStr = boxen(debuggingInfoArr.toString(), {
    padding: 1,
    margin: 1,
    borderStyle: 'double'
  })

  logByFlag(verboseOpt, debugInfoStr)

  funcExecByFlag(debugOpt, () =>
    fs.appendFileSync('DEBUG_INFO', '\ufeff' + debugInfoStr, {
      encoding: 'utf8'
    })
  )

  console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)))
}
