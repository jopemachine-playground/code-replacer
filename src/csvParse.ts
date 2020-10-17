import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import debuggingInfoArr from './debuggingInfo'
import utils from './util'
import optionManager from './optionManager'

export default async ({
  replaceListFile,
  srcFileName,
  templateLValue,
  templateRValue
}) => {
  if (!replaceListFile) {
    replaceListFile = utils.findReplaceListFile(`.${path.sep}rlist.csv`, srcFileName)
  } else if (fs.lstatSync(replaceListFile).isDirectory()) {
    replaceListFile = utils.findReplaceListFile(replaceListFile, srcFileName)
  }

  utils.funcExecByFlag(!optionManager.getInstance().verboseOpt && replaceListFile !== -1, () =>
    console.log(
      chalk.dim(
        chalk.italic('** replaceList file: ' + path.resolve(replaceListFile))
      )
    )
  )

  utils.funcExecByFlag(optionManager.getInstance().debugOpt && replaceListFile !== -1, () =>
    debuggingInfoArr.getInstance().append(
      '** replaceList file: ' + path.resolve(replaceListFile)
    )
  )

  if (replaceListFile !== -1) {
    return await utils.readCsv(replaceListFile)
  } else if (replaceListFile === -1 && (!templateLValue || !templateRValue)) {
    console.log(
      chalk.red(
        "You should specify the valid 'template' value or the rlist file. \nPlease refer to README.md\nExit.."
      )
    )
    return -1
  }
}
