import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import debuggingInfoArr from './debuggingInfo'
import utils from './util'
import optionManager from './optionManager'

const csvParse = async ({
  replaceListFile,
  srcFileName,
}: {
  replaceListFile: string | number;
  srcFileName: string | number;
}) => {
  if (!replaceListFile) {
    replaceListFile = utils.findReplaceListFile(`.${path.sep}rlist.csv`, srcFileName as string)
  } else if (fs.lstatSync(replaceListFile as string).isDirectory()) {
    replaceListFile = utils.findReplaceListFile(replaceListFile as string, srcFileName as string)
  }

  utils.funcExecByFlag(!optionManager.getInstance().verboseOpt! && replaceListFile !== -1, () =>
    console.log(
      chalk.dim(
        chalk.italic('** replaceList file: ' + path.resolve(replaceListFile as string))
      )
    )
  )

  utils.funcExecByFlag(optionManager.getInstance().debugOpt! && replaceListFile !== -1, () =>
    debuggingInfoArr.getInstance().append(
      '** replaceList file: ' + path.resolve(replaceListFile as string)
    )
  )

  if (replaceListFile !== -1) {
    return await utils.readCsv(replaceListFile as string)
  }

  return -1
}

export default csvParse;