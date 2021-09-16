import envPathsGenerator from 'env-paths';
import path from 'path';
import fse from 'fs-extra';

const envPaths = envPathsGenerator('code-replacer');

export const usageLogPath = path.resolve(envPaths.log, 'usageLog.json');

export const readUsageLog = () => {
  if (fse.existsSync(usageLogPath)) {
    return fse.readFileSync(usageLogPath);
  } else {
    return {};
  }
};