const { setOptions, showDefaultOptions } = require('./util')
const codeReplace = require('./codeReplace')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const inquirerFileTreeSelection = require('inquirer-file-tree-selection-prompt')
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

const receiveCSVOption = async () => {
  let csvFilePath = -1
  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'csvOpt',
        message: chalk.dim('Would you like to use csv?')
      }
    ])
    .then(async (ynOutput) => {
      if (!ynOutput.csvOpt) return
      await inquirer
        .prompt([
          {
            type: 'file-tree-selection',
            name: 'file',
            message: chalk.dim('Choose csv file'),
            transformer: (input) => {
              const name = input.split(path.sep).pop()
              if (name[0] === '.') {
                return chalk.grey(name)
              }
              return name
            }
          }
        ])
        .then((fileSelectionOutput) => {
          csvFilePath = fileSelectionOutput.file
        })
    })
  return csvFilePath
}

const receiveSrcOption = async () => {
  let srcFilePath = -1
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
        }
      }
    ])
    .then((fileSelectionOutput) => {
      srcFilePath = fileSelectionOutput.file
    })
  return srcFilePath
}

const ENTER_TEMPLATE = chalk.yellow('Enter template')

const receiveTemplateOption = async () => {
  let template = -1

  const templateUsageLogs = []
  const usageLogJson = require('./usageLog.json')

  let displayCnt = 0
  const maxDisplayCnt = 5
  for (const usageLogKey of Object.keys(usageLogJson)) {
    usageLogJson[usageLogKey].template && (displayCnt++ < maxDisplayCnt) &&
      templateUsageLogs.push(usageLogJson[usageLogKey].template)
  }

  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'template',
        message: chalk.dim('Choose template'),
        choices: [
          ...templateUsageLogs,
          ENTER_TEMPLATE
        ]
      }
    ])
    .then(async (templateOutput) => {
      if (templateOutput.template === ENTER_TEMPLATE) {
        await inquirer
          .prompt([
            {
              type: 'input',
              name: 'templateManual',
              message: chalk.dim('Enter template value'),
              validate: (input) => {
                return input.includes('->')
              }
            }
          ]).then(async (templateManualOutput) => {
            template = templateManualOutput.templateManual
          })
      } else {
        template = templateOutput.template
      }
    })
  return template
}

const receiveFlagOptions = async () => {
  let verboseOpt
  let debugOpt
  let overwriteOpt
  let onceOpt

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
          }
        ],
        validate: function (answer) {
          return true
        }
      }
    ]).then(async answer => {
      debugOpt = answer.flags.includes('debug')
      verboseOpt = answer.flags.includes('verbose')
      overwriteOpt = answer.flags.includes('overwrite')
      onceOpt = answer.flags.includes('once')
    })

  return {
    verboseOpt,
    debugOpt,
    overwriteOpt,
    onceOpt
  }
}

const receiveExcludeRegOption = async () => {
  let excludeReg = -1
  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'excludeRegOpt',
        message: chalk.dim('Would you like to use exclude Reg?')
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
  return excludeReg
}

module.exports = async (input, flags) => {
  switch (input) {
    case 'sel':
    case 'select': {
      const flags = {}
      flags.src = await receiveSrcOption()
      flags.csv = await receiveCSVOption()
      flags.template = await receiveTemplateOption()
      flags.excludeReg = await receiveExcludeRegOption()
      const { verbose, debug, overwrite, once } = await receiveFlagOptions()
      flags.verbose = verbose
      flags.debug = debug
      flags.overwrite = overwrite
      flags.once = once
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
