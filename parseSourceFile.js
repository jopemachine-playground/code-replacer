const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const {
  logByFlag,
  funcExecByFlag
} = require('./util')

module.exports = ({ srcFile, verboseOpt, debugOpt }) => {
  const absPath = path.resolve(srcFile)
  const [srcFileName, ...srcFilePathArr] = absPath.split(path.sep).reverse()
  logByFlag(
    !verboseOpt,
    chalk.dim(chalk.italic('** target file: ' + path.resolve(srcFile)))
  )

  funcExecByFlag(debugOpt, () =>
    debuggingInfoArr.append('** target file: ' + path.resolve(srcFile))
  )

  const srcFileLines = fs.readFileSync(srcFile).toString().split('\n')
  const srcFilePath = srcFilePathArr.reverse().join(path.sep)

  return {
    srcFileLines,
    srcFileName,
    srcFilePath
  }
}
