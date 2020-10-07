#!/usr/bin/env node

const meow = require('meow')
const codeReplace = require('./codeReplace')
require('dotenv').config()
const _ = require('lodash')
const { setOptions, showDefaultOptions } = require('./util')

const flags = {
  dir: {
    type: 'string',
    alias: 'd',
    isRequired: (flags, input) => false
  },
  ext: {
    type: 'string',
    alias: 'e',
    isRequired: (flags, input) => false
  },
  target: {
    type: 'string',
    alias: 't',
    isRequired: (flags, input) => false
  },
  replaceList: {
    type: 'string',
    alias: 'l',
    isRequired: (flags, input) => false
  },
  verbose: {
    type: 'boolean',
    alias: 'v',
    isRequired: (flags, input) => false
  },
  once: {
    type: 'boolean',
    alias: 'o',
    isRequired: (flags, input) => false
  },
  startLinePatt: {
    type: 'string',
    alias: 'slp',
    isRequired: (flags, input) => false
  },
  endLinePatt: {
    type: 'string',
    alias: 'elp',
    isRequired: (flags, input) => false
  },
  dst: {
    type: 'string',
    alias: 'ds',
    isRequired: (flags, input) => false
  },
  conf: {
    type: 'boolean',
    alias: 'c',
    isRequired: (flags, input) => false
  },
  template: {
    type: 'string',
    alias: 'tem',
    isRequired: (flags, input) => false
  },
  debug: {
    type: 'boolean',
    isRequired: (flags, input) => false
  },
  sep: {
    type: 'string',
    alias: 's',
    isRequired: (flags, input) => false
  },
  overwrite: {
    type: 'boolean',
    alias: 'w',
    isRequired: (flags, input) => false
  },
  excludeReg: {
    type: 'string',
    alias: 'x',
    isRequired: (flags, input) => false
  }
}

_.map(Object.keys(flags), (flagKey) => {
  if (process.env[flagKey]) {
    if (process.env[flagKey] === 'true' || process.env[flagKey] === 'false') {
      flags[flagKey].default = Boolean(process.env[flagKey])
    } else flags[flagKey].default = process.env[flagKey]
  }
})

const cli = meow(
  `
    Outline

        Replace string pattern values for specific files or files with specific extensions.

    Usage

        $ code-replacer <...args>

    Required arguments

        <required args>

            --dir, -d                     specify target directory
            --ext, -e                     specify target file's extension. 
                                          (Use this with dir to target multiple files)

            --target, -t                  specify target file. 
                                          when target and dir are given, 
                                          target the files corresponding to the name in the target directory.
                                          (no need to ext)

            --replaceList, -l             specify replace properties file, 
                                          default value is './rlist'
                                          name './rlist_{fileName}',
                                          if you want to apply different rlist files per file

        <optional argument>

            --dst, -dst                   specify the name of the output file. 
                                          default value is '__replace__.{originalFileName}'.

            --verbose, -v                 print all information about the text replaced in console.
                                          default is 'false'
            
            --debug                       outputs debugging information to the 'DEBUG_INFO' file

            --once, -o                    even if there are multiple substitution values in a line,
                                          they are replaced only once.

            --startLinePatt, -slp         apply replace from that line.

            --endLinePatt, -elp           specify end line pattern.

            --conf, -c                    check the string values that you want to replace on each line.

            --template, -tem              specify template string.
                                          see README.md for more detail usage.

            --sep, -s                     specify rlist's spliter. 
                                          default value is '='
            
            --overwrite, -o               overwrite existing file.

            --excludeReg, -x              specify the regular expression of the line
                                          to be excluded from the replace.

    Examples

        $ code-replacer --target=./abc.java --replaceList=./rlist
        $ code-replacer --dir=./ ext=java --replaceList=./rlist


    See README.md for more details.
`,
  { flags }
)

switch (cli.input[0]) {
  case 's':
  case 'set':
    setOptions(cli.flags)
    break
  case 'd':
  case 'default':
    showDefaultOptions()
    break
  default:
    codeReplace(cli.flags)
    break
}
