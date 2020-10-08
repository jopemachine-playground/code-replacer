#!/usr/bin/env node

module.exports = (commandArguments) => {
  const replaceWithFileExec = require('./replaceWithFile')
  const replaceWithDirExec = require('./replaceWithDir')
  const { err } = require('./util')

  if (
    commandArguments.dir &&
    (commandArguments.src || commandArguments.ext)
  ) {
    replaceWithDirExec(commandArguments)
  } else if (commandArguments.src) {
    replaceWithFileExec(commandArguments)
  } else {
    err()
  }
}
