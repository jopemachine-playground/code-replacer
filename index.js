#!/usr/bin/env node

const meow = require("meow");
const exec = require("./exec");

const cli = meow(
  `
    Usage
      $ oneline-replacer <"file" or "directory"> --args
  
       Required arguments
         <"dir", required args>
         --dir, -d             specify target directory
         --ext, -e             specify target file's extension
  
         <"file", required args>
         --target, -t          specify target file
  
         <common required args>
         --replaceList, -r     specify replace properties file
  
    Examples
         $ oneline-replacer file --target=./abc.java --replaceList=./rlist
         $ oneline-replacer dir --dir=./ ext=java --replaceList=./rlist
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