#!/usr/bin/env node

module.exports = (type, commandArguments) => {
  const replaceWithFileExec = require("./replaceWithFile");
  const replaceWithDirExec = require("./replaceWithDir");
  const { err } = require('./util');

  if (type) {
    switch (type) {
      case "dir":
        replaceWithDirExec(commandArguments);
        break;
      case "file":
        replaceWithFileExec(commandArguments);
        break;
      default:
        err();
        break;
    }
  } else {
    // To do : print help option
  }
};