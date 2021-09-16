import fse from 'fs-extra';
import replaceWithFileExec from '../replaceWithFile';
import replaceWithDirExec from '../replaceWithDir';
import _ from 'lodash';
import constant from '../config/constant';
import { CommandArguments } from '../type/commandArgument';
import optionManager from './optionManager';
import { readUsageLog, usageLogPath } from '../config/path';

const handleOptions = (commandArguments: CommandArguments) => {
  optionManager.getInstance().verboseOpt = commandArguments.verbose;
  optionManager.getInstance().onceOpt = commandArguments.once;
  optionManager.getInstance().confOpt = commandArguments.conf;
  optionManager.getInstance().printOpt = commandArguments.print;
  optionManager.getInstance().overwriteOpt = commandArguments.overwrite;
  optionManager.getInstance()['no-escape'] = commandArguments['no-escape'];
};

export default (commandArguments: CommandArguments) => {
  handleOptions(commandArguments);
  const usageLog = readUsageLog();

  if (
    commandArguments.dir
  ) {
    replaceWithDirExec(commandArguments);
  } else if (commandArguments.src) {
    replaceWithFileExec(commandArguments);
    usageLog[new Date().getTime()] = commandArguments;

    if (Object.keys(usageLog).length > constant.MAX_LOG_CNT) {
      const oldest: number | undefined = _.min(Object.keys(usageLog).map(Number));
      oldest && delete usageLog[oldest];
    }

    fse.writeFileSync(
      usageLogPath,
      '\ufeff' + JSON.stringify(usageLog, null, 2),
      { encoding: 'utf8' }
    );
  } else {
    console.log(constant.HELP_STRING);
  }
};
