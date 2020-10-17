#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import replaceWithFileExec from './replaceWithFile'
import replaceWithDirExec from './replaceWithDir'
import _ from 'lodash'
import constant from './constant'
import { CommandArguments } from './type/commandArgument'
import optionManager from './optionManager'
import './type/json'
import usageLog from '../usageLog.json'

const handleOptions = (commandArguments: CommandArguments) => {
  optionManager.getInstance().verboseOpt = commandArguments.verbose
  optionManager.getInstance().onceOpt = commandArguments.once
  optionManager.getInstance().confOpt = commandArguments.conf
  optionManager.getInstance().debugOpt = commandArguments.debug
  optionManager.getInstance().overwriteOpt = commandArguments.overwrite
  optionManager.getInstance()['no-escape'] = commandArguments['no-escape']
}

export default (commandArguments: CommandArguments) => {
  handleOptions(commandArguments)

  if (
    commandArguments.dir &&
    (commandArguments.src || commandArguments.ext)
  ) {
    replaceWithDirExec(commandArguments)
  } else if (commandArguments.src) {
    replaceWithFileExec(commandArguments)
    usageLog[new Date().getTime()] = commandArguments

    if (Object.keys(usageLog).length > constant.MAX_LOG_CNT) {
      const oldest = _.min(Object.keys(usageLog).map(Number))
      delete usageLog[oldest!]
    }

    fs.writeFileSync(
      `${__dirname}${path.sep}usageLog.json`,
      '\ufeff' + JSON.stringify(usageLog, null, 2),
      { encoding: 'utf8' }
    )
  } else {
    console.log(constant.HELP_STRING)
  }
}
