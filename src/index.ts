import meow from 'meow';
import path from 'path';
import _ from 'lodash';
import cliSelector from './cliSelector';
import constant from './constant';
import { CommandArguments } from './type/commandArgument';
import chalk from 'chalk';
require('dotenv').config({ path: `${__dirname}${path.sep}.env` });

const flags: meow.AnyFlags = {
  dir: {
    type: 'string',
    alias: 'd',
    isRequired: (_flags, input) => false
  },
  ext: {
    type: 'string',
    alias: 'e',
    isRequired: (_flags, input) => false
  },
  src: {
    type: 'string',
    alias: 's',
    isRequired: (_flags, input) => false
  },
  csv: {
    type: 'string',
    isRequired: (_flags, input) => false
  },
  verbose: {
    type: 'boolean',
    alias: 'v',
    isRequired: (_flags, input) => false
  },
  once: {
    type: 'boolean',
    alias: 'o',
    isRequired: (_flags, input) => false
  },
  startLine: {
    type: 'string',
    alias: 'sl',
    isRequired: (_flags, input) => false
  },
  endLine: {
    type: 'string',
    alias: 'el',
    isRequired: (_flags, input) => false
  },
  dst: {
    type: 'string',
    alias: 'ds',
    isRequired: (_flags, input) => false
  },
  conf: {
    type: 'boolean',
    alias: 'c',
    isRequired: (_flags, input) => false
  },
  template: {
    type: 'string',
    alias: 'tem',
    isRequired: (_flags, input) => false
  },
  debug: {
    type: 'boolean',
    isRequired: (_flags, input) => false
  },
  overwrite: {
    type: 'boolean',
    alias: 'w',
    isRequired: (_flags, input) => false
  },
  excludeReg: {
    type: 'string',
    alias: 'x',
    isRequired: (_flags, input) => false
  },
  'no-escape': {
    type: 'boolean',
    alias: 'n',
    isRequired: (_flags, input) => false
  }
};

_.map(Object.keys(flags), (flagKey: string) => {
  if (process.env[flagKey]) {
    if (process.env[flagKey] === 'true' || process.env[flagKey] === 'false') {
      console.log(chalk.blue(`Use ${flagKey} as the stored default value, ${process.env[flagKey]}.`));
      (flags[flagKey] as any).default = Boolean(process.env[flagKey]);
    } else (flags[flagKey] as any).default = process.env[flagKey];
  }
});

const meowCli: meow.Result<meow.AnyFlags> = meow(constant.HELP_STRING, { flags });

cliSelector(meowCli.input[0], meowCli.flags as unknown as CommandArguments);
