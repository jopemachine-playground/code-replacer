const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { readCsv } = require('./util')
const debuggingInfoArr = require('./debuggingInfo')
const { findReplaceListFile, funcExecByFlag } = require('./util')
const optionManager = require('./optionManager')

module.exports = async ({
  replaceListFile,
  srcFileName,
  templateLValue,
  templateRValue
}) => {
  let csvTbl = []

  if (!replaceListFile) {
    replaceListFile = findReplaceListFile(`.${path.sep}rlist.csv`, srcFileName)
  } else if (fs.lstatSync(replaceListFile).isDirectory()) {
    replaceListFile = findReplaceListFile(replaceListFile, srcFileName)
  }

  funcExecByFlag(!optionManager.getInstance().verboseOpt && replaceListFile !== -1, () =>
    console.log(
      chalk.dim(
        chalk.italic('** replaceList file: ' + path.resolve(replaceListFile))
      )
    )
  )

  funcExecByFlag(optionManager.getInstance().debugOpt && replaceListFile !== -1, () =>
    debuggingInfoArr.getInstance().append(
      '** replaceList file: ' + path.resolve(replaceListFile)
    )
  )

  if (replaceListFile !== -1) {
    csvTbl = await readCsv(replaceListFile)
  } else if (replaceListFile === -1 && (!templateLValue || !templateRValue)) {
    console.log(
      chalk.red(
        "You should specify the valid 'template' value or the rlist file. \nPlease refer to README.md\nExit.."
      )
    )
    return -1
  }

  return csvTbl
}
