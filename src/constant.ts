import chalk from 'chalk';

export default {
  REPLACED_PREPOSITION: '__replaced__.',
  TEMPLATE_SPLITER: '->',
  CLI_SELECTOR_STR: {
    FILE_DIR: chalk.yellow('Choose from file tree.'),
    TYPE_INPUT: chalk.yellow('Type input.'),
    ENTER_TEMPLATE: chalk.yellow('Enter template.'),
    ENTER_EXCLUDE_KEY: chalk.yellow('Enter excludeKey.'),
    SELECT_SRC: chalk.yellow('Select one source file.'),
    SELECT_DIR: chalk.yellow('Select multiple files in target directory.'),
    SELECT_BY_EXT: chalk.yellow('Select files by extension of files.'),
    SELECT_BY_FILENAME: chalk.yellow('Select files by file name.')
  },
  MAX_LOG_CNT: 30,
  CLI_SELCTOR_MAX_DISPLAYING_LOG: 5,
  SINGLE_SPLIT_LINE: '──────────────────────────────────────────────────────────────────────────────────────────',
  DOUBLE_SPLIT_LINE: '══════════════════════════════════════════════════════════════════════════════════════════',
  HELP_STRING:
  `
    Outline

        Replace string pattern values for specific files or files with specific extensions.

    Usage

        $ code-replacer <...arguments>

    Required arguments

        <required argument>

            --src, -s                     specify target file.
                                          when target and dir are given,
                                          target the files corresponding to the name in the target directory.
                                          (no need to ext)

            --template, -t                specify template string.
                                          see README.md for more detail usage.


        <optional argument>

            --csv                         specify replace properties file,
                                          default value is './rlist.csv'
                                          name './rlist_{fileName}.csv',
                                          if you want to apply different rlist files per file

            --dir, -d                     specify target directory

            --ext, -e                     specify target file's extension.
                                          (Use this with dir to target multiple files)

            --dst, -dst                   specify the name of the output file.
                                          default value is '__replaced__.{originalFileName}'.

            --verbose, -v                 print all information about the text replaced in console.
                                          default is 'false'

            --debug                       outputs debugging information to the 'DEBUG_INFO' file

            --once, -o                    even if there are multiple substitution values in a line,
                                          they are replaced only once.

            --startLine, -sl              apply replace from that line.

            --endLine, -el                specify end line pattern.

            --conf, -c                    check the string values that you want to replace on each line.

            --overwrite, -o               overwrite existing file.

            --excludeReg, -x              specify the regular expression of the line
                                          to be excluded from the replace.

            --no-escape, -n               apply the left side of the template as a regular expression,
                                          therefore, special character literals should be escaped with this option.

    Examples

        $ code-replacer --target=./abc.java --csv=./rlist.csv
        $ code-replacer --dir=./ ext=java --csv=./rlist.csv


    See README.md for more details.
`
};
