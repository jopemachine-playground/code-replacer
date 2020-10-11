const fs = require('fs')
const path = require('path')
const boxen = require('boxen')
const chalk = require('chalk')
const parseSourceFile = require('./parseSourceFile')
const parseCSV = require('./csvParse')
const debuggingInfoArr = require('./debuggingInfo')
const { replace } = require('./replacer')
const optionManager = require('./optionManager')
const { TEMPLATE_SPLITER } = require('./constant')
const {
  InvalidLeftReferenceError,
  InvalidRightReferenceError,
  CreatingReplacingObjError
} = require('./error')

const {
  logByFlag,
  funcExecByFlag,
  splitWithEscape
} = require('./util')

module.exports = async function ({
  src: srcFile,
  csv: replaceListFile,
  startLinePatt,
  endLinePatt,
  dst: dstFileName,
  template,
  excludeReg: excludeRegValue
}) {
  let templateLValue, templateRValue
  if (template) {
    const templateVals = splitWithEscape(template, TEMPLATE_SPLITER)
    templateLValue = templateVals[0]
    templateRValue = templateVals[1]
  }

  const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
    srcFile
  })

  const csvTbl = await parseCSV({
    replaceListFile,
    srcFileName,
    templateLValue,
    templateRValue
  })

  if (csvTbl === -1) return

  funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    debuggingInfoArr.getInstance().append(`startLinePatt: ${startLinePatt}`)
  )
  funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    debuggingInfoArr.getInstance().append(`endLinePatt: ${endLinePatt}`)
  )

  let resultLines = []
  try {
    resultLines = replace({
      srcFileName,
      srcFileLines,
      csvTbl,
      templateLValue,
      templateRValue,
      excludeRegValue,
      startLinePatt,
      endLinePatt
    })
  } catch (err) {
    if (err instanceof InvalidRightReferenceError) {
      console.log(chalk.red(err))
    } else if (err instanceof InvalidLeftReferenceError) {
      console.log(chalk.red(err))
    } else if (err instanceof CreatingReplacingObjError) {
      console.log(chalk.red(err))
    } else {
      console.log(err)
    }
    return
  }

  if (resultLines === -1) return

  const dstFilePath = optionManager.getInstance().overwriteOpt
    ? srcFile
    : dstFileName
      ? path.resolve(dstFileName)
      : srcFilePath + path.sep + '__replacer__.' + srcFileName

  fs.writeFileSync(dstFilePath, '\ufeff' + resultLines.join('\n'), {
    encoding: 'utf8'
  })

  const debugInfoStr = boxen(debuggingInfoArr.getInstance().toString(), {
    padding: 1,
    margin: 1,
    borderStyle: 'double'
  })

  logByFlag(optionManager.getInstance().verboseOpt, debugInfoStr)

  funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    fs.appendFileSync('DEBUG_INFO', '\ufeff' + debugInfoStr, {
      encoding: 'utf8'
    })
  )

  console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)))
}
