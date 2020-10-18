import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import parseSourceFile from './parseSourceFile';
import parseCSV from './csvParse';
import debuggingInfoArr from './debuggingInfo';
import { replace } from './replacer';
import optionManager from './optionManager';
import constant from './constant';
import utils from './util';
import { CommandArguments } from './type/commandArgument';

export default async function ({
  src: srcFile,
  csv: replaceListFile,
  startLinePatt,
  endLinePatt,
  dst: dstFileName,
  template,
  excludeReg: excludeRegValue
}: CommandArguments) {
  let templateLValue: string | undefined, templateRValue: string | undefined;
  let hasTemplate: boolean = false;

  if (template) {
    const templateVals: string[] = utils.splitWithEscape(template, constant.TEMPLATE_SPLITER)
    templateLValue = templateVals[0]
    templateRValue = templateVals[1]
    hasTemplate = true
  }

  const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
    srcFile
  })

  const csvTbl = await parseCSV({
    replaceListFile: replaceListFile as string,
    srcFileName,
    hasTemplate
  })

  if (csvTbl === -1) return

  utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
    debuggingInfoArr.getInstance().append(`startLinePatt: ${startLinePatt}`)
  )
  utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
    debuggingInfoArr.getInstance().append(`endLinePatt: ${endLinePatt}`)
  )

  let resultLines: string[] | number = []
  try {
    resultLines = replace({
      srcFileName,
      srcFileLines,
      csvTbl,
      templateLValue,
      templateRValue,
      excludeRegValue,
      startLinePatt,
      endLinePatt
    })
  } catch (err) {
    console.log(chalk.red(err.message));
    console.log("details:");
    console.log(err.name);
    console.log(err.stack);
    throw err;
  }

  if (resultLines === -1) return

  const dstFilePath = optionManager.getInstance().overwriteOpt
    ? srcFile
    : dstFileName
    ? path.resolve(dstFileName)
    : srcFileName.startsWith("__replaced__.")
    ? srcFilePath + path.sep + srcFileName
    : srcFilePath + path.sep + "__replaced__." + srcFileName;

  fs.writeFileSync(dstFilePath, '\ufeff' + (resultLines as string[]).join('\n'), {
    encoding: 'utf8'
  })

  const debugInfoStr: string = debuggingInfoArr.getInstance().toString();

  utils.logByFlag(optionManager.getInstance().verboseOpt!, debugInfoStr)

  utils.funcExecByFlag(optionManager.getInstance().debugOpt!, () =>
    fs.appendFileSync('DEBUG_INFO', '\ufeff' + debugInfoStr, {
      encoding: 'utf8'
    })
  )

  console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)))
}
