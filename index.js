#!/usr/bin/env node

const meow = require("meow");
const exec = require("./exec");

const cli = meow(
  `
	Usage
	  $ replaceWithFile <file or directory> --args

    Options
      <dir required args>
      --dir, -d             specify target directory
      --ext                 specify target file's extension

      <file required args>
      --target              specify target file

      <common required args>
      --replaceListFile     specify replace properties file

	Examples
      $ oneline-replacer file target=./dmain.jsp replaceList=./rlist
      $ oneline-replacer dir dir=./ ext=jsp replaceList=./rlist
`,
  {
    flags: {
      dir: {
        type: "string",
        alias: "d",
        isRequired: (flags, input) => {
          if (input === "dir") return true;
          else return false;
        },
      },
      ext: {
        type: "string",
        alias: "e",
        isRequired: (flags, input) => {
          if (input === "dir") return true;
          else return false;
        },
      },
      target: {
        type: "string",
        alias: "t",
        isRequired: (flags, input) => {
          if (input === "file") return true;
          else return false;
        },
      },
      replaceList: {
        type: "string",
        alias: "r",
        isRequired: (flags, input) => {
          return true;
        },
      },
    },
  }
);

exec(cli.input[0], cli.flags);