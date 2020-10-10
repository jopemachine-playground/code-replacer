const fs = require('fs')
const path = require('path')
const boxen = require('boxen')
const chalk = require('chalk')
const parseSourceFile = require('./parseSourceFile')
const parseCSV = require('./csvParse')
const debuggingInfoArr = require('./debuggingInfo')
const { replace } = require('./replacer')

const {
  logByFlag,
  funcExecByFlag,
  splitWithEscape
} = require('./util')

module.exports = async function ({
  src: srcFile,
  csv: replaceListFile,
  verbose: verboseOpt,
  once: onceOpt,
  startLinePatt,
  endLinePatt,
  dst: dstFileName,
  conf: confOpt,
  template,
  excludeReg: excludeRegValue,
  debug: debugOpt,
  overwrite: overwriteOpt,
  'no-escape': noEscapeOpt
}) {
  let templateLValue, templateRValue
  if (template) {
    const templateVals = splitWithEscape(template, '->')
    templateLValue = templateVals[0]
    templateRValue = templateVals[1]
  }

  const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
    srcFile,
    verboseOpt,
    debugOpt
  })

  const csvTbl = await parseCSV({
    replaceListFile,
    srcFileName,
    templateLValue,
    templateRValue,
    verboseOpt,
    debugOpt
  })

  if (csvTbl === -1) return

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.getInstance().append(`startLinePatt: ${startLinePatt}`)
  )
  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.getInstance().append(`endLinePatt: ${endLinePatt}`)
  )

  const resultLines = replace({
    srcFileName,
    srcFileLines,
    csvTbl,
    templateLValue,
    templateRValue,
    excludeRegValue,
    startLinePatt,
    endLinePatt,
    verboseOpt,
    confOpt,
    onceOpt,
    noEscapeOpt
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

  const debugInfoStr = boxen(debuggingInfoArr.getInstance().toString(), {
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
