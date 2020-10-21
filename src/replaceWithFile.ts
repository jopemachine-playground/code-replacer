import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import parseSourceFile from './sourceFileParser';
import parseCSV from './csvParser';
import debuggingInfoArr from './debuggingInfo';
import { getReplacedCode } from './getReplacedCode';
import optionManager from './optionManager';
import constant from './constant';
import utils from './util';
import { CommandArguments } from './type/commandArgument';
import { Template } from './template';

export default async function ({
  src: srcFile,
  csv: replaceListFile,
  startLine,
  endLine,
  dst: dstFileName,
  template,
  excludeReg: excludeRegValue
}: CommandArguments) {

  const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
    srcFile,
  });

  const templateObj = new Template(template);

  const csvTbl = await parseCSV({
    replaceListFile: replaceListFile!,
    srcFileName,
    template: templateObj
  });

  if (csvTbl === -1) return;

  utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
    debuggingInfoArr.getInstance().append(`startLine: ${startLine}`)
  );
  utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
    debuggingInfoArr.getInstance().append(`endLine: ${endLine}`)
  );

  let resultLines: string[] | number = [];
  try {
    resultLines = getReplacedCode({
      srcFileName,
      srcFileLines,
      csvTbl,
      excludeRegValue,
      startLine,
      endLine,
      template: templateObj
    });
  } catch (err) {
    console.log(chalk.red(err.message));
    console.log("details:");
    console.log(err.name);
    console.log(err.stack);
    throw err;
  }

  if (resultLines === -1) return;

  const dstFilePath: string = optionManager.getInstance().overwriteOpt
    ? srcFile
    : dstFileName
    ? path.resolve(dstFileName)
    : srcFileName.startsWith(constant.REPLACED_PREPOSITION)
    ? srcFilePath + path.sep + srcFileName
    : srcFilePath + path.sep + constant.REPLACED_PREPOSITION + srcFileName;

  fs.writeFileSync(dstFilePath, '\ufeff' + (resultLines as string[]).join('\n'), {
    encoding: 'utf8'
  });

  const debugInfoStr: string = debuggingInfoArr.getInstance().toString();

  utils.logByFlag(optionManager.getInstance().verboseOpt!, debugInfoStr);

  utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
    fs.appendFileSync('DEBUG_INFO', '\ufeff' + debugInfoStr, {
      encoding: 'utf8'
    })
  );

  console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)));
}
