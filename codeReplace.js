#!/usr/bin/env node
const fs = require('fs')
const replaceWithFileExec = require('./replaceWithFile')
const replaceWithDirExec = require('./replaceWithDir')
const usageLog = require('./usageLog.json')
const _ = require('lodash')
const { HELP_STRING } = require('./constant')

const handleOptions = (commandArguments) => {
  const optionManager = require('./optionManager')
  optionManager.getInstance().verboseOpt = commandArguments.verboseOpt
  optionManager.getInstance().onceOpt = commandArguments.onceOpt
  optionManager.getInstance().confOpt = commandArguments.confOpt
  optionManager.getInstance().debugOpt = commandArguments.debugOpt
  optionManager.getInstance().overwriteOpt = commandArguments.overwriteOpt
  optionManager.getInstance()['no-escape'] = commandArguments['no-escape']
}

module.exports = (commandArguments) => {
  handleOptions(commandArguments)

  if (
    commandArguments.dir &&
    (commandArguments.src || commandArguments.ext)
  ) {
    replaceWithDirExec(commandArguments)
  } else if (commandArguments.src) {
    replaceWithFileExec(commandArguments)
    usageLog[new Date().getTime()] = commandArguments

    if (Object.keys(usageLog).length > 10) {
      const oldest = _.min(Object.keys(usageLog).map(Number))
      delete usageLog[oldest]
    }

    fs.writeFileSync(
      'usageLog.json',
      '\ufeff' + JSON.stringify(usageLog, null, 2),
      { encoding: 'utf8' }
    )
  } else {
    console.log(HELP_STRING)
  }
}
