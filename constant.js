const chalk = require('chalk')

module.exports = {
  TEMPLATE_SPLITER: '->',
  cliSelectorString: {
    FILE_DIR: chalk.yellow('Choose from file tree'),
    TYPE_INPUT: chalk.yellow('Type input'),
    ENTER_TEMPLATE: chalk.yellow('Enter template'),
    ENTER_EXCLUDE_KEY: chalk.yellow('Enter excludeKey')
  },
  CLI_SELCTOR_MAX_DISPLAYING_LOG: 5
}
