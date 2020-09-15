#!/usr/bin/env node

const argvHandler = require('./argumentHandler');
const replaceWithFileExec = require('./replaceWithFile');
const replaceWithDirExec = require('./replaceWithDir');

const type = process.argv[2];
const commandArguments = process.argv.slice(3);

if (process.argv.length > 1) {
  switch (type) {
    case "dir":
      replaceWithDirExec(argvHandler(commandArguments));
      break;
    case "file":
      replaceWithFileExec(argvHandler(commandArguments));
      break;
  }
} else {
  // To do : print help option
}