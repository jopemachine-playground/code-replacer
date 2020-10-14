const { setOptions, showDefaultOptions } = require('./util')
const codeReplace = require('./codeReplace')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('inquirer-file-tree-selection-prompt')
const STRING_CONSTANT = require('./constant').cliSelectorString
const { TEMPLATE_SPLITER, CLI_SELCTOR_MAX_DISPLAYING_LOG } = require('./constant')
const fs = require('fs')

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

const fetchLog = ({ keyName }) => {
  const logs = []
  const usageLogJson = require('./usageLog.json')

  let displayCnt = 0
  const maxDisplayCnt = CLI_SELCTOR_MAX_DISPLAYING_LOG
  for (const usageLogKey of Object.keys(usageLogJson)) {
    usageLogJson[usageLogKey][keyName] && (displayCnt++ < maxDisplayCnt) &&
    logs.push(usageLogJson[usageLogKey][keyName])
  }

  return logs
}

const receiveCSVOption = async () => {
  const csvUsageLogs = fetchLog({ keyName: 'csv' })
  let csvFilePath = -1
  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'csvOpt',
        message: chalk.dim('Would you like to use csv option?')
      }
    ])
    .then(async (ynOutput) => {
      if (!ynOutput.csvOpt) return
      await inquirer
        .prompt([
          {
            type: 'list',
            name: 'csvOpt',
            message: chalk.dim('Choose options'),
            choices: [
              ...csvUsageLogs,
              STRING_CONSTANT.TYPE_INPUT,
              STRING_CONSTANT.FILE_DIR
            ]
          }
        ]).then(async (listSelect) => {
          if (listSelect.csvOpt === STRING_CONSTANT.FILE_DIR) {
            await inquirer
              .prompt([
                {
                  type: 'file-tree-selection',
                  name: 'file',
                  message: chalk.dim('Choose csv file from file directory'),
                  transformer: (input) => {
                    const name = input.split(path.sep).pop()
                    if (name[0] === '.') {
                      return chalk.grey(name)
                    }
                    return name
                  },
                  validate: (input) => {
                    return fs.lstatSync(input).isFile()
                  }
                }
              ])
              .then((fileSelectionOutput) => {
                csvFilePath = fileSelectionOutput.file
              })
          } else if (listSelect.csvOpt === STRING_CONSTANT.TYPE_INPUT) {
            await inquirer
              .prompt([
                {
                  type: 'input',
                  name: 'csvFilePathInput',
                  message: chalk.dim('Please enter the path of the csv file.')
                }
              ])
              .then((fileSelectionOutput) => {
                csvFilePath = fileSelectionOutput.csvFilePathInput
              })
          } else {
            csvFilePath = listSelect.csvOpt
          }
        })
    })
  return csvFilePath
}

const receiveSrcOption = async () => {
  const srcUsageLogs = fetchLog({ keyName: 'src' })
  let srcFilePath = -1
  let dir = -1
  let ext = -1

  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'srcOpt',
        message: chalk.dim('Select Src option.'),
        choices: [
          STRING_CONSTANT.SELECT_SRC,
          STRING_CONSTANT.SELECT_DIR
        ]
      }]).then(async (isSrcOrDirOpt) => {
      if (isSrcOrDirOpt.srcOpt === STRING_CONSTANT.SELECT_SRC) {
        await inquirer
          .prompt([
            {
              type: 'list',
              name: 'src',
              message: chalk.dim('Choose src file by below options'),
              choices: [
                ...srcUsageLogs,
                STRING_CONSTANT.TYPE_INPUT,
                STRING_CONSTANT.FILE_DIR
              ]
            }]).then(async (srcOpt) => {
            if (srcOpt.src === STRING_CONSTANT.FILE_DIR) {
              await inquirer
                .prompt([
                  {
                    type: 'file-tree-selection',
                    name: 'file',
                    message: chalk.dim('Choose src file'),
                    transformer: (input) => {
                      const name = input.split(path.sep).pop()
                      if (name[0] === '.') {
                        return chalk.grey(name)
                      }
                      return name
                    },
                    validate: (input) => {
                      return fs.lstatSync(input).isFile()
                    }
                  }
                ]).then((fileSelectionOutput) => {
                  srcFilePath = fileSelectionOutput.file
                })
            } else if (srcOpt.src === STRING_CONSTANT.TYPE_INPUT) {
              await inquirer
                .prompt([
                  {
                    type: 'input',
                    name: 'srcManual',
                    message: chalk.dim("Enter src file's path"),
                    validate: (input) => {
                      return fs.lstatSync(input).isFile()
                    }
                  }
                ]).then(async (srcManualOutput) => {
                  srcFilePath = srcManualOutput.srcManual
                })
            } else {
              srcFilePath = srcOpt.src
            }
          })
      } else if (isSrcOrDirOpt.srcOpt === STRING_CONSTANT.SELECT_DIR) {
        await inquirer
          .prompt([
            {
              type: 'file-tree-selection',
              name: 'dir',
              message: chalk.dim('Choose a directory you want to target'),
              transformer: (input) => {
                const name = input.split(path.sep).pop()
                if (name[0] === '.') {
                  return chalk.grey(name)
                }
                return name
              },
              validate: (input) => {
                return fs.lstatSync(input).isDirectory()
              }
            }
          ]).then(async (dirOpt) => {
            dir = dirOpt.dir
            await inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'methodToTarget',
                  message: chalk.dim('Select how you want to specify the target file.'),
                  choices: [
                    STRING_CONSTANT.SELECT_BY_EXT,
                    STRING_CONSTANT.SELECT_BY_FILENAME
                  ]
                }]).then(async (opt) => {
                if (opt.methodToTarget === STRING_CONSTANT.SELECT_BY_EXT) {
                  await inquirer
                    .prompt([
                      {
                        type: 'input',
                        name: 'ext',
                        message: chalk.dim("Enter src file's path"),
                        validate: (input) => {
                          return fs.lstatSync(input).isFile()
                        }
                      }
                    ]).then(async (select) => {
                      ext = select.ext
                    })
                } else if (opt.methodToTarget === STRING_CONSTANT.SELECT_BY_FILENAME) {
                  await inquirer
                    .prompt([
                      {
                        type: 'input',
                        name: 'fileName',
                        message: chalk.dim("Enter file name's regexp")
                      }
                    ]).then(async (select) => {
                      srcFilePath = select.fileName
                    })
                }
              })
          })
      }
    })
  return {
    srcFilePath,
    dir,
    ext
  }
}

const receiveTemplateOption = async () => {
  let template = -1
  const templateUsageLogs = fetchLog({ keyName: 'template' })

  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'templateYn',
        message: chalk.dim('Would you like to use template?')
      }
    ]).then(async (ynOutput) => {
      if (!ynOutput.templateYn) return
      await inquirer
        .prompt([
          {
            type: 'list',
            name: 'template',
            message: chalk.dim('Choose template'),
            choices: [
              ...templateUsageLogs,
              STRING_CONSTANT.ENTER_TEMPLATE
            ]
          }
        ])
        .then(async (templateOutput) => {
          if (templateOutput.template === STRING_CONSTANT.ENTER_TEMPLATE) {
            await inquirer
              .prompt([
                {
                  type: 'input',
                  name: 'templateManual',
                  message: chalk.dim('Enter template value'),
                  validate: (input) => {
                    return input.includes(TEMPLATE_SPLITER)
                  }
                }
              ]).then(async (templateManualOutput) => {
                template = templateManualOutput.templateManual
              })
          } else {
            template = templateOutput.template
          }
        })
    })
  return template
}

const receiveFlagOptions = async () => {
  let verbose,
    debug,
    overwrite,
    once,
    conf,
    noEscape,
    startLinePatt,
    endLinePatt

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
            name: 'startLinePatt'
          },
          {
            name: 'endLinePatt'
          }
        ],
        validate: function (answer) {
          return true
        }
      }
    ]).then(async answer => {
      debug = answer.flags.includes('debug')
      verbose = answer.flags.includes('verbose')
      overwrite = answer.flags.includes('overwrite')
      once = answer.flags.includes('once')
      conf = answer.flags.includes('conf')
      noEscape = answer.flags.includes('no-escape')

      if (answer.flags.includes('startLinePatt')) {
        await inquirer
          .prompt([
            {
              type: 'input',
              name: 'startLinePatt',
              message: chalk.dim('Please enter startLinePatt')
            }
          ])
          .then((startLinePattOutput) => {
            startLinePatt = startLinePattOutput.startLinePatt
          })
      }
      if (answer.flags.includes('endLinePatt')) {
        await inquirer
          .prompt([
            {
              type: 'input',
              name: 'endLinePatt',
              message: chalk.dim('Please enter endLinePatt')
            }
          ])
          .then((endLinePattOutput) => {
            endLinePatt = endLinePattOutput.endLinePatt
          })
      }
    })

  return {
    verbose,
    debug,
    overwrite,
    once,
    conf,
    noEscape,
    startLinePatt,
    endLinePatt
  }
}

const receiveExcludeRegOption = async () => {
  let excludeReg = -1
  const excludeRegUsageLogs = fetchLog({ keyName: 'excludeReg' })

  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'excludeRegYn',
        message: chalk.dim('Would you like to use excludeReg?')
      }]).then(async (yn) => {
      if (!yn.excludeRegYn) return
      await inquirer
        .prompt([
          {
            type: 'list',
            name: 'excludeRegOpt',
            message: chalk.dim('Choose exclude key'),
            choices: [
              ...excludeRegUsageLogs,
              STRING_CONSTANT.ENTER_EXCLUDE_KEY
            ]
          }
        ])
        .then(async (ynOutput) => {
          if (!ynOutput.excludeRegOpt) return
          await inquirer
            .prompt([
              {
                type: 'input',
                name: 'excludeReg',
                message: chalk.dim('Enter regular expressions for lines to exclude from substitution.')
              }
            ])
            .then((excludeOutput) => {
              excludeReg = excludeOutput.excludeReg
            })
        })
    })
  return excludeReg
}

module.exports = async (input, flags) => {
  switch (input) {
    case 'sel':
    case 'select': {
      const flags = {}
      const { srcFilePath: src, ext, dir } = await receiveSrcOption()
      const csv = await receiveCSVOption()
      const template = await receiveTemplateOption()
      const excludeReg = await receiveExcludeRegOption()
      src !== -1 && (flags.src = src)
      ext !== -1 && (flags.ext = ext)
      dir !== -1 && (flags.dir = dir)
      csv !== -1 && (flags.csv = csv)
      template !== -1 && (flags.template = template)
      excludeReg !== -1 && (flags.excludeReg = excludeReg)
      const {
        verbose,
        debug,
        overwrite,
        once,
        conf,
        noEscape,
        startLinePatt,
        endLinePatt
      } = await receiveFlagOptions()
      flags.verboseOpt = verbose
      flags.debugOpt = debug
      flags.overwriteOpt = overwrite
      flags.onceOpt = once
      flags.confOpt = conf
      flags.startLinePatt = startLinePatt
      flags.endLinePatt = endLinePatt
      flags['no-escape'] = noEscape
      console.log()
      codeReplace(flags)
      break
    }
    case 'set':
      setOptions(flags)
      break
    case 'd':
    case 'default':
      showDefaultOptions()
      break
    default:
      codeReplace(flags)
      break
  }
}
