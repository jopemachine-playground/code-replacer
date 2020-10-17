import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import utils from './util'
import debuggingInfoArr from './debuggingInfo'
import optionManager from './optionManager'

export default ({ srcFile }: { srcFile: string }) => {
  const absPath = path.resolve(srcFile);
  const [srcFileName, ...srcFilePathArr] = absPath.split(path.sep).reverse();
  utils.logByFlag(
    !optionManager.getInstance().verboseOpt,
    chalk.dim(chalk.italic("** target file: " + path.resolve(srcFile)))
  );

  utils.funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    debuggingInfoArr
      .getInstance()
      .append("** target file: " + path.resolve(srcFile))
  );

  const srcFileLines = fs.readFileSync(srcFile).toString().split("\n");
  const srcFilePath = srcFilePathArr.reverse().join(path.sep);

  return {
    srcFileLines,
    srcFileName,
    srcFilePath,
  };
};
