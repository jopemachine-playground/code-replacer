import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import utils from './util';
import optionManager from './cli/optionManager';
import { FileNotFoundError, ERROR_CONSTANT } from './error';

export default ({ srcFile }: { srcFile: string }) => {
  const absPath: string = path.resolve(srcFile);
  const [srcFileName, ...srcFilePathArr] = absPath.split(path.sep).reverse();
  utils.logByFlag(
    !optionManager.getInstance().verboseOpt,
    chalk.dim(chalk.italic("** target file: " + path.resolve(srcFile)))
  );

  try {
    const srcFileLines: string[] = fs
      .readFileSync(srcFile)
      .toString()
      .split("\n");
    const srcFilePath: string = srcFilePathArr.reverse().join(path.sep);

    return {
      srcFileLines,
      srcFileName,
      srcFilePath,
    };
  } catch (err) {
    throw new FileNotFoundError(ERROR_CONSTANT.SRC_NOT_FOUND);
  }
};
