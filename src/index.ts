import meow from 'meow'
import path from 'path'
import _ from 'lodash'
import cliSelector from './cliSelector'
import constant from './constant'
import { CommandArguments } from './type/commandArgument'
require('dotenv').config({ path: `${__dirname}${path.sep}.env` })

const flags: meow.AnyFlags = {
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

_.map(Object.keys(flags), (flagKey: string) => {
  if (process.env[flagKey]) {
    if (process.env[flagKey] === 'true' || process.env[flagKey] === 'false') {
      console.log(`Use ${flagKey} as the stored default value, ${process.env[flagKey]}.`);
      (flags[flagKey] as any)['default'] = Boolean(process.env[flagKey])
    } else (flags[flagKey] as any)['default'] = process.env[flagKey]
  }
})

const meowCli: meow.Result<meow.AnyFlags> = meow(constant.HELP_STRING, { flags })

cliSelector(meowCli.input[0], meowCli.flags as unknown as CommandArguments)
