#!/usr/bin/env node

const meow = require('meow')
const path = require('path')
require('dotenv').config({ path: `${__dirname}${path.sep}.env` })
const _ = require('lodash')
const cliSelector = require('./cliSelector')
const { HELP_STRING } = require('./constant')

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
  src: {
    type: 'string',
    alias: 's',
    isRequired: (flags, input) => false
  },
  csv: {
    type: 'string',
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
  overwrite: {
    type: 'boolean',
    alias: 'w',
    isRequired: (flags, input) => false
  },
  excludeReg: {
    type: 'string',
    alias: 'x',
    isRequired: (flags, input) => false
  },
  'no-escape': {
    type: 'boolean',
    alias: 'n',
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

const meowCli = meow(HELP_STRING, { flags })

cliSelector(meowCli.input[0], meowCli.flags)
