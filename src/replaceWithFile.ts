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
  excludeReg: excludeRegValue,
}: CommandArguments) {
  try {
    const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
      srcFile,
    });

    const templateObj = new Template(template);

    const csvTbl = await parseCSV({
      replaceListFile: replaceListFile!,
      srcFileName,
      srcFilePath,
      template: templateObj,
    });

    if (csvTbl === -1) return;

    const resultLines: (string[] | number) = getReplacedCode({
      srcFileName,
      srcFileLines,
      excludeRegValue,
      startLine,
      endLine,
      csvTbl: csvTbl as object[],
      template: templateObj,
    });

    if (resultLines === -1) return;

    const dstFilePath: string = optionManager.getInstance().overwriteOpt
      ? srcFile
      : dstFileName
      ? path.resolve(dstFileName)
      : srcFileName.startsWith(constant.REPLACED_PREPOSITION)
      ? srcFilePath + path.sep + srcFileName
      : srcFilePath + path.sep + constant.REPLACED_PREPOSITION + srcFileName;

    fs.writeFileSync(
      dstFilePath,
      "\ufeff" + (resultLines as string[]).join("\n"),
      {
        encoding: "utf8",
      }
    );

    const debugInfoStr: string = chalk.greenBright(debuggingInfoArr.getInstance().toString());

    utils.logByFlag(
      optionManager.getInstance().printOpt! &&
        !optionManager.getInstance().verboseOpt!,
      debugInfoStr
    );

    console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)));
  } catch (err) {
    console.error(chalk.red(err.message));
    console.error(chalk.whiteBright("** Details:"));
    throw err;
  }
}
