const fs = require('fs')
const path = require('path')
const boxen = require('boxen')
const StringBuffer = require('./stringBuffer')
const chalk = require('chalk')
const parseSourceFile = require('./parseSourceFile')
const replaceExecute = require('./replacer')
const parseCSV = require('./csvParse')

const {
  changeTemplateStringToGroupKeys,
  logByFlag,
  funcExecByFlag,
  splitWithEscape
} = require('./util')

const debuggingInfoArr = new StringBuffer()

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
  overwrite: overwriteOpt
}) {
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
    debuggingInfoArr.append(`startLinePatt: ${startLinePatt}`)
  )
  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append(`endLinePatt: ${endLinePatt}`)
  )

  const resultLines = replaceExecute({
    srcFileName,
    srcFileLines,
    csvTbl,
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
