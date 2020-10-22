import chalk from 'chalk';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import csv from 'csv-parser';
import constant from './constant';
import { Template } from './template';
import { CSVParsingError, InvalidLeftTemplateError, TemplateHasNoCSVCOLKeyWithCSVError, FileNotFoundError, ERROR_CONSTANT } from './error';

export default {
  handleSpecialCharacter(str: string) {
    // TODO: Handle more special characters here if needed
    const spChars = [
      "\\",
      "(",
      ")",
      ".",
      "?",
      "!",
      "$",
      "^",
      "{",
      "}",
      "[",
      "]",
      "|",
      "/",
      "+",
      "*",
    ];

    for (const spChar of spChars) {
      str = this.replaceAll(str, spChar, `\\${spChar}`);
    }
    return str;
  },

  restoreTemplateSpliter(str: string, spliter: string) {
    return this.replaceAll(str, "\\" + spliter, spliter);
  },

  handleCSVColKey({ csvRecord, columnName, templateLValue, templateRValue }) {
    templateLValue = this.replaceAll(
      templateLValue,
      `\${${columnName}}`,
      csvRecord[columnName]
    );

    templateRValue = this.replaceAll(
      templateRValue!,
      `\${${columnName}}`,
      csvRecord[columnName]
    );

    return {
      templateLValue,
      templateRValue,
    };
  },

  isValidCSV(csvResult: object, template: Template) {
    let keyColKeyFound = false;
    for (const lvalueLeftRefKey of template.lvalueCsvColKeys) {
      if (Object.keys(csvResult[0]).includes(lvalueLeftRefKey)) {
        keyColKeyFound = true;

        const records = _.map(csvResult, (item) => {
          return item[lvalueLeftRefKey];
        });

        const hasDuplicate = _.uniq(records).length !== records.length;
        if (hasDuplicate) {
          return new CSVParsingError(ERROR_CONSTANT.CSV_DUPLICATE_KEY);
        }
      } else {
        console.log(
          `'${lvalueLeftRefKey}' is processed as "string" because csv doesn't include ${lvalueLeftRefKey} column..`
        );
      }
    }

    if (!keyColKeyFound) {
      return new TemplateHasNoCSVCOLKeyWithCSVError(
        ERROR_CONSTANT.TEMPLATE_HAS_NO_CSV_COL_KEY
      );
    }

    return true;
  },

  async readCsv(csvFilePath: string, template: Template | undefined) {
    const csvResult: object[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .on("error", () => {
          reject(new FileNotFoundError(ERROR_CONSTANT.CSV_NOT_FOUND));
        })
        .pipe(csv())
        .on("data", (data: any) => {
          csvResult.push(data);
        })
        .on("end", () => {
          if (template) {
            const validOrError = this.isValidCSV(csvResult, template);
            if (validOrError === true) {
              resolve(csvResult);
            } else {
              reject(validOrError);
            }
          } else {
            resolve(csvResult);
          }
        });
    });
  },

  funcExecByFlag(flag: boolean, funcExecIfFlagIsTrue: Function) {
    return flag && funcExecIfFlagIsTrue();
  },

  logByFlag(flag: boolean, logIfFlagIsTrue: string) {
    return flag && console.log(logIfFlagIsTrue);
  },

  createHighlightedLine(
    srcLine: string,
    previousMatchingIndex: number,
    matchingWord: string,
    afterMatchingIndex: number
  ) {
    return (
      srcLine.substr(0, previousMatchingIndex) +
      chalk.magentaBright(chalk.bgBlack(matchingWord)) +
      srcLine.substr(afterMatchingIndex, srcLine.length)
    ).trim();
  },

  getProperties(obj: object) {
    let result = "";
    for (const key of Object.keys(obj)) {
      result += `${key}=${obj[key]}
`;
    }
    return result;
  },

  printLines({
    srcFileName,
    lineIdx,
    sourceStr,
    replacedStr,
    srcFileLines,
    resultLines,
  }: {
    srcFileName: string;
    lineIdx: number;
    sourceStr: string;
    replacedStr: string;
    srcFileLines: string[];
    resultLines: string[];
  }) {
    let previousLine = "";
    let postLine = "";
    const lineIdxSpliter = "║";

    if (lineIdx - 2 >= 0) {
      previousLine =
        chalk.gray(`${lineIdx - 1} ${lineIdxSpliter}   `) +
        chalk.gray(resultLines[lineIdx - 2].trim());
    }

    if (lineIdx < srcFileLines.length) {
      postLine =
        chalk.gray(`${lineIdx + 1} ${lineIdxSpliter}   `) +
        chalk.gray(srcFileLines[lineIdx].trim());
    }

    const lineToPrint = `
${chalk.gray(constant.SINGLE_SPLIT_LINE)}

${chalk.gray(
  `# Line: ${chalk.yellow(lineIdx)}, in '${chalk.yellow(srcFileName)}'`
)}

${previousLine}
${
  chalk.blueBright(`${lineIdx} ${lineIdxSpliter}   `) +
  chalk.blueBright(sourceStr)
}
${
  chalk.greenBright(`${lineIdx} ${lineIdxSpliter}   `) +
  chalk.greenBright(replacedStr)
}
${postLine}
`;
    console.log(lineToPrint);
    return lineToPrint;
  },

  findReplaceListFile({
    rlistDir,
    srcFileName,
  }: {
    rlistDir: string;
    srcFileName: string;
  }) {
    // CSV is selected rlist_${sourceFileName}.csv of srcFile Path
    if (fs.existsSync(`${rlistDir}${path.sep}rlist_${srcFileName}.csv`)) {
      return `${rlistDir}${path.sep}rlist_${srcFileName}.csv`;
    }

    // CSV is selected rlist_${sourceFileName without ext}.csv of srcFile Path
    else if (
      fs.existsSync(
        `${rlistDir}${path.sep}rlist_${srcFileName.split(".")[0]}.csv`
      )
    ) {
      return `${rlistDir}${path.sep}rlist_${srcFileName.split(".")[0]}.csv`;
    }

    // CSV is selected rlist.csv of srcFile Path
    else if (fs.existsSync(`${rlistDir}${path.sep}rlist.csv`)) {
      return `${rlistDir}${path.sep}rlist.csv`;
    }

    // auto CSV file finding fails
    else {
      return -1;
    }
  },

  splitWithEscape(str: string, spliter: string) {
    let prevChar = "";
    let matching = false;

    let frontStrBuf = "";
    let backStrBuf = "";

    let spliterBuf = "";

    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);

      // handle escape
      if (!matching && prevChar === "\\") {
        prevChar = char;
        frontStrBuf += char;
        continue;
      }

      if (!matching && char === spliter.charAt(0)) {
        spliterBuf = char;
        for (
          let spliterIdx = i + 1;
          spliterIdx < i + spliter.length && spliterIdx < str.length;
          spliterIdx++
        ) {
          if (spliter.charAt(spliterBuf.length) === str.charAt(spliterIdx)) {
            spliterBuf += str.charAt(spliterIdx);
          } else {
            break;
          }
        }
        if (spliterBuf === spliter) {
          matching = true;
          i += spliterBuf.length - 1;
          continue;
        }
      }

      !matching && (frontStrBuf += char);
      matching && (backStrBuf += char);
      prevChar = char;
    }

    return [frontStrBuf, backStrBuf];
  },

  setOptions(flags: object) {
    fs.writeFileSync(".env", "\ufeff" + module.exports.getProperties(flags), {
      encoding: "utf8",
    });

    console.log(
      chalk.whiteBright("🌈  The current setting value has been saved! 🌈")
    );
  },

  replaceAll(str: string, searchStr: string, replaceStr: string) {
    return str.split(searchStr).join(replaceStr);
  },

  showDefaultOptions() {
    const env = fs.readFileSync(".env", {
      encoding: "utf8",
    });
    const defaultValues = env.split("\n");

    console.log(
      chalk.whiteBright("🌈  Current default setting is as follows. 🌈")
    );

    for (const devaultValue of defaultValues) {
      const [key, value] = devaultValue.split("=");
      if (!key || !value) continue;
      console.log(chalk.blue(`${key.trim()}: ${value}`));
    }
  },
};
