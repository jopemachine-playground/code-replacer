import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import utils from './util';
import optionManager from './cli/optionManager';
import { Template } from './template';

const csvParse = async ({
  replaceListFile,
  srcFileName,
  srcFilePath,
  template
}: {
  replaceListFile: string | number;
  srcFileName: string | number;
  srcFilePath: string;
  template: Template;
}) => {
  if (!replaceListFile) {
    replaceListFile = utils.findReplaceListFile({
      rlistDir: `${srcFilePath}${path.sep}rlist.csv`,
      srcFileName: srcFileName as string
    });
  } else if (fs.lstatSync(replaceListFile as string).isDirectory()) {
    replaceListFile = utils.findReplaceListFile({
      rlistDir: replaceListFile as string,
      srcFileName: srcFileName as string
    });
  }

  utils.funcExecByFlag(
    !optionManager.getInstance().verboseOpt! && replaceListFile !== -1,
    () =>
      console.log(
        chalk.dim(
          chalk.italic(
            "** csv file: " + path.resolve(replaceListFile as string)
          )
        )
      )
  );

  if (replaceListFile !== -1) {
    return utils.readCsv(replaceListFile as string, template);
  }

  return [];
};

export default csvParse;