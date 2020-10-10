#!/usr/bin/env node

module.exports = (commandArguments) => {
  const fs = require('fs')
  const replaceWithFileExec = require('./replaceWithFile')
  const replaceWithDirExec = require('./replaceWithDir')
  const { err } = require('./util')
  const usageLog = require('./usageLog.json')
  const _ = require('lodash')

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
