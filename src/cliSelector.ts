import utils from './util';
import modSelector from './modSelector';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
import constant from './constant';
import fs from 'fs';
import { CommandArguments } from './type/commandArgument';

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

const fetchLog = ({ keyName }: { keyName: string }) => {
  const logs: string[] = [];
  const usageLogJson: JSON = require('../usageLog.json');

  let displayCnt: number = 0;
  const maxDisplayCnt: number = constant.CLI_SELCTOR_MAX_DISPLAYING_LOG;
  const keys: string[] = Object.keys(usageLogJson).reverse();

  for (const usageLogKey of keys) {
    if (usageLogJson[usageLogKey][keyName] && !logs.includes(usageLogJson[usageLogKey][keyName]) && (displayCnt < maxDisplayCnt)) {
      logs.push(usageLogJson[usageLogKey][keyName]);
      displayCnt++;
    }
  }

  return logs;
};

const receiveCSVOption = async () => {
  const csvUsageLogs = fetchLog({ keyName: 'csv' });
  let csvFilePath = -1;
  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'csvOpt',
        message: chalk.dim('Would you like to use csv option?')
      }
    ])
    .then(async (ynOutput) => {
      if (!ynOutput.csvOpt) return;
      await inquirer
        .prompt([
          {
            type: 'list',
            name: 'csvOpt',
            message: chalk.dim('Choose options'),
            choices: [
              ...csvUsageLogs,
              constant.CLI_SELECTOR_STR.TYPE_INPUT,
              constant.CLI_SELECTOR_STR.FILE_DIR
            ]
          }
        ]).then(async (listSelect) => {
          if (listSelect.csvOpt === constant.CLI_SELECTOR_STR.FILE_DIR) {
            await inquirer
              .prompt([
                {
                  type: 'file-tree-selection',
                  name: 'file',
                  message: chalk.dim('Choose csv file from file directory'),
                  transformer: (input) => {
                    const name = input.split(path.sep).pop();
                    if (name[0] === '.') {
                      return chalk.grey(name);
                    }
                    return name;
                  },
                  validate: (input) => {
                    return fs.lstatSync(input).isFile();
                  }
                }
              ])
              .then((fileSelectionOutput) => {
                csvFilePath = fileSelectionOutput.file;
              });
          } else if (listSelect.csvOpt === constant.CLI_SELECTOR_STR.TYPE_INPUT) {
            await inquirer
              .prompt([
                {
                  type: 'input',
                  name: 'csvFilePathInput',
                  message: chalk.dim('Please enter the path of the csv file.')
                }
              ])
              .then((fileSelectionOutput) => {
                csvFilePath = fileSelectionOutput.csvFilePathInput;
              });
          } else {
            csvFilePath = listSelect.csvOpt;
          }
        });
    });
  return csvFilePath;
};

const receiveSrcOption = async () => {
  const srcUsageLogs = fetchLog({ keyName: 'src' });
  let srcFilePath: number | string = -1;
  let dir: number | string = -1;
  let ext: number | string = -1;

  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'srcOpt',
        message: chalk.dim('Select Src option.'),
        choices: [
          constant.CLI_SELECTOR_STR.SELECT_SRC,
          constant.CLI_SELECTOR_STR.SELECT_DIR
        ]
      }]).then(async (isSrcOrDirOpt) => {
      if (isSrcOrDirOpt.srcOpt === constant.CLI_SELECTOR_STR.SELECT_SRC) {
        await inquirer
          .prompt([
            {
              type: 'list',
              name: 'src',
              message: chalk.dim('Choose src file by below options'),
              choices: [
                ...srcUsageLogs,
                constant.CLI_SELECTOR_STR.TYPE_INPUT,
                constant.CLI_SELECTOR_STR.FILE_DIR
              ]
            }]).then(async (srcOpt) => {
            if (srcOpt.src === constant.CLI_SELECTOR_STR.FILE_DIR) {
              await inquirer
                .prompt([
                  {
                    type: 'file-tree-selection',
                    name: 'file',
                    message: chalk.dim('Choose src file'),
                    transformer: (input) => {
                      const name = input.split(path.sep).pop();
                      if (name[0] === '.') {
                        return chalk.grey(name);
                      }
                      return name;
                    },
                    validate: (input) => {
                      return fs.lstatSync(input).isFile();
                    }
                  }
                ]).then((fileSelectionOutput) => {
                  srcFilePath = fileSelectionOutput.file;
                });
            } else if (srcOpt.src === constant.CLI_SELECTOR_STR.TYPE_INPUT) {
              await inquirer
                .prompt([
                  {
                    type: 'input',
                    name: 'srcManual',
                    message: chalk.dim("Enter src file's path"),
                    validate: (input) => {
                      return fs.lstatSync(input).isFile();
                    }
                  }
                ]).then(async (srcManualOutput) => {
                  srcFilePath = srcManualOutput.srcManual;
                });
            } else {
              srcFilePath = srcOpt.src;
            }
          });
      } else if (isSrcOrDirOpt.srcOpt === constant.CLI_SELECTOR_STR.SELECT_DIR) {
        await inquirer
          .prompt([
            {
              type: 'file-tree-selection',
              name: 'dir',
              message: chalk.dim('Choose a directory you want to target'),
              transformer: (input) => {
                const name = input.split(path.sep).pop();
                if (name[0] === '.') {
                  return chalk.grey(name);
                }
                return name;
              },
              validate: (input) => {
                return fs.lstatSync(input).isDirectory();
              }
            }
          ]).then(async (dirOpt) => {
            dir = dirOpt.dir;
            await inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'methodToTarget',
                  message: chalk.dim('Select how you want to specify the target file.'),
                  choices: [
                    constant.CLI_SELECTOR_STR.SELECT_BY_EXT,
                    constant.CLI_SELECTOR_STR.SELECT_BY_FILENAME
                  ]
                }]).then(async (opt) => {
                if (opt.methodToTarget === constant.CLI_SELECTOR_STR.SELECT_BY_EXT) {
                  await inquirer
                    .prompt([
                      {
                        type: 'input',
                        name: 'ext',
                        message: chalk.dim("Enter src file's path"),
                        validate: (input) => {
                          return fs.lstatSync(input).isFile();
                        }
                      }
                    ]).then(async (select) => {
                      ext = select.ext;
                    });
                } else if (opt.methodToTarget === constant.CLI_SELECTOR_STR.SELECT_BY_FILENAME) {
                  await inquirer
                    .prompt([
                      {
                        type: 'input',
                        name: 'fileName',
                        message: chalk.dim("Enter file name's regexp")
                      }
                    ]).then(async (select) => {
                      srcFilePath = select.fileName;
                    });
                }
              });
          });
      }
    });
  return {
    srcFilePath,
    dir,
    ext
  };
};

const receiveTemplateOption = async () => {
  let template: number | string = -1;
  const templateUsageLogs = fetchLog({ keyName: "template" });

  await inquirer
    .prompt([
      {
        type: "list",
        name: "template",
        message: chalk.dim("Choose template"),
        choices: [
          ...templateUsageLogs,
          constant.CLI_SELECTOR_STR.ENTER_TEMPLATE,
        ],
      },
    ])
    .then(async (templateOutput) => {
      if (
        templateOutput.template === constant.CLI_SELECTOR_STR.ENTER_TEMPLATE
      ) {
        await inquirer
          .prompt([
            {
              type: "input",
              name: "templateManual",
              message: chalk.dim("Enter template value"),
              validate: (input) => {
                return input.includes(constant.TEMPLATE_SPLITER);
              },
            },
          ])
          .then(async (templateManualOutput) => {
            template = templateManualOutput.templateManual;
          });
      } else {
        template = templateOutput.template;
      }
    });
  return template;
};

const receiveFlagOptions = async () => {
  let verbose: boolean | undefined;
  let debug: boolean | undefined;
  let overwrite: boolean | undefined;
  let once: boolean | undefined;
  let conf: boolean | undefined;
  let noEscape: boolean | undefined;
  let startLine: string | undefined;
  let endLine: string | undefined;

  await inquirer
    .prompt([
      {
        type: 'checkbox',
        message: chalk.dim('Select the flags you want.'),
        name: 'flags',
        choices: [
          {
            name: 'verbose'
          },
          {
            name: 'debug'
          },
          {
            name: 'overwrite'
          },
          {
            name: 'once'
          },
          {
            name: 'conf'
          },
          {
            name: 'no-escape'
          },
          {
            name: 'startLine'
          },
          {
            name: 'endLine'
          }
        ],
        validate (answer) {
          return true;
        }
      }
    ]).then(async answer => {
      debug = answer.flags.includes('debug');
      verbose = answer.flags.includes('verbose');
      overwrite = answer.flags.includes('overwrite');
      once = answer.flags.includes('once');
      conf = answer.flags.includes('conf');
      noEscape = answer.flags.includes('no-escape');

      if (answer.flags.includes('startLine')) {
        await inquirer
          .prompt([
            {
              type: 'input',
              name: 'startLine',
              message: chalk.dim('Please enter startLine')
            }
          ])
          .then((startLineOutput) => {
            startLine = startLineOutput.startLine;
          });
      }
      if (answer.flags.includes('endLine')) {
        await inquirer
          .prompt([
            {
              type: 'input',
              name: 'endLine',
              message: chalk.dim('Please enter endLine')
            }
          ])
          .then((endLineOutput) => {
            endLine = endLineOutput.endLine;
          });
      }
    });

  return {
    verbose,
    debug,
    overwrite,
    once,
    conf,
    noEscape,
    startLine,
    endLine
  };
};

const receiveExcludeRegOption = async () => {
  let excludeReg: number | string = -1;
  const excludeRegUsageLogs = fetchLog({ keyName: 'excludeReg' });

  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'excludeRegYn',
        message: chalk.dim('Would you like to use excludeReg?')
      }]).then(async (yn) => {
      if (!yn.excludeRegYn) return;
      await inquirer
        .prompt([
          {
            type: 'list',
            name: 'excludeRegOpt',
            message: chalk.dim('Choose exclude key'),
            choices: [
              ...excludeRegUsageLogs,
              constant.CLI_SELECTOR_STR.ENTER_EXCLUDE_KEY
            ]
          }
        ])
        .then(async (ynOutput) => {
          if (!ynOutput.excludeRegOpt) return;
          await inquirer
            .prompt([
              {
                type: 'input',
                name: 'excludeReg',
                message: chalk.dim('Enter regular expressions for lines to exclude from substitution.')
              }
            ])
            .then((excludeOutput) => {
              excludeReg = excludeOutput.excludeReg;
            });
        });
    });
  return excludeReg;
};

export default async (input: string, args: CommandArguments) => {
  switch (input) {
    case 'sel':
    case 'select': {
      const { srcFilePath: src, ext, dir } = await receiveSrcOption();
      const csv = await receiveCSVOption();
      const template = await receiveTemplateOption();
      const excludeReg = await receiveExcludeRegOption();
      src !== -1 && (args.src = src as unknown as string);
      ext !== -1 && (args.ext = ext as unknown as string);
      dir !== -1 && (args.dir = dir as unknown as string);
      csv !== -1 && (args.csv = csv as unknown as string);
      template !== -1 && (args.template = template as unknown as string);
      excludeReg !== -1 && (args.excludeReg = excludeReg as unknown as string);
      const {
        verbose,
        debug,
        overwrite,
        once,
        conf,
        noEscape,
        startLine,
        endLine
      } = await receiveFlagOptions();
      args.verbose = verbose;
      args.debug = debug;
      args.overwrite = overwrite;
      args.once = once;
      args.conf = conf;
      args.startLine = startLine;
      args.endLine = endLine;
      args['no-escape'] = noEscape;
      console.log();
      modSelector(args);
      break;
    }
    case 'set':
      utils.setOptions(args);
      break;
    case 'd':
    case 'default':
      utils.showDefaultOptions();
      break;
    default:
      modSelector(args);
      break;
  }
};
