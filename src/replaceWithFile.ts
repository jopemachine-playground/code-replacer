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
  let templateLValue, templateRValue
  if (template) {
    const templateVals = utils.splitWithEscape(template, constant.TEMPLATE_SPLITER)
    templateLValue = templateVals[0]
    templateRValue = templateVals[1]
  }

  const { srcFileLines, srcFileName, srcFilePath } = parseSourceFile({
    srcFile
  })

  const csvTbl = await parseCSV({
    replaceListFile,
    srcFileName,
    templateLValue,
    templateRValue
  })

  if (csvTbl === -1) return

  utils.funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    debuggingInfoArr.getInstance().append(`startLinePatt: ${startLinePatt}`)
  )
  utils.funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    debuggingInfoArr.getInstance().append(`endLinePatt: ${endLinePatt}`)
  )

  let resultLines = []
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
    // switch (typeof err) {
    //   case 'InvalidLeftReferenceError':
    //   case 'InvalidLeftTemplateError':
    //   case 'InvalidRightReferenceError':
    //   case 'CreatingReplacingObjError':
    //     console.log(chalk.red(err))
    //     break
    //   default:
    //     throw (err)
    // }
    console.log(chalk.red(err.message));
    console.log("details:");
    console.log(err.name);
    console.log(err.stack);
    return
  }

  // if (resultLines === -1) return

  const dstFilePath = optionManager.getInstance().overwriteOpt
    ? srcFile
    : dstFileName
      ? path.resolve(dstFileName)
      : srcFilePath + path.sep + '__replacer__.' + srcFileName

  fs.writeFileSync(dstFilePath, '\ufeff' + resultLines.join('\n'), {
    encoding: 'utf8'
  })

  const debugInfoStr = debuggingInfoArr.getInstance().toString();

  utils.logByFlag(optionManager.getInstance().verboseOpt, debugInfoStr)

  utils.funcExecByFlag(optionManager.getInstance().debugOpt, () =>
    fs.appendFileSync('DEBUG_INFO', '\ufeff' + debugInfoStr, {
      encoding: 'utf8'
    })
  )

  console.log(chalk.italic(chalk.white(`\nGenerated '${dstFilePath}'\n`)))
}
