#!/usr/bin/env node

const handleOptions = (commandArguments) => {
  const optionManager = require('./optionManager')
  optionManager.getInstance().verbose = commandArguments.verbose
  optionManager.getInstance().once = commandArguments.once
  optionManager.getInstance().conf = commandArguments.conf
  optionManager.getInstance().debug = commandArguments.debug
  optionManager.getInstance().overwrite = commandArguments.overwrite
  optionManager.getInstance()['no-escape'] = commandArguments.noEscape
}

module.exports = (commandArguments) => {
  const fs = require('fs')
  const replaceWithFileExec = require('./replaceWithFile')
  const replaceWithDirExec = require('./replaceWithDir')
  const { err } = require('./util')
  const usageLog = require('./usageLog.json')
  const _ = require('lodash')

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

    fs.writeFileSync('usageLog.json', '\ufeff' + JSON.stringify(usageLog, null, 2), { encoding: 'utf8' })
  } else {
    err()
  }
}
