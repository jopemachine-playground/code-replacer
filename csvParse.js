const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const csv = require('csv-parser')
const debuggingInfoArr = require('./debuggingInfo')
const { findReplaceListFile, funcExecByFlag } = require('./util')

module.exports = async ({
  replaceListFile,
  srcFileName,
  templateLValue,
  templateRValue,
  verboseOpt,
  debugOpt
}) => {
  let csvTbl = []

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

const readCsv = async (csvFilePath) => {
  const csvResult = []
  return new Promise((resolve, reject) => {
    try {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => csvResult.push(data))
        .on('end', () => {
          resolve(csvResult)
        })
    } catch (e) {
      reject(e)
    }
  })
}
