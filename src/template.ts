import matchAll from './matchAll';
import utils from './util';
import optionManager from './optionManager';
import constant from './constant';
import { ERROR_CONSTANT, InvalidLeftTemplateError } from './error';
import ReplacingListDict from './replacingListDict';

const changeLRefKeyToGroupKeys = (str: string, hasEscaped: boolean) => {
  const findLRefKeyReg: RegExp = hasEscaped
    ? /\\\$\\\[(?<lRefKey>[\d\w]*)\\\]/
    : /\$\[(?<lRefKey>[\d\w]*)\]/;
  const findLRefKeyRegExp: RegExp = new RegExp(findLRefKeyReg);
  const LReftKeysInLValue: Generator<RegExpExecArray, void, unknown> = matchAll(
    str,
    findLRefKeyRegExp
  );

  // Avoid duplicate group keys
  const cntFrequency: Map<string, number> = new Map();

  for (const LRefKeyInfo of LReftKeysInLValue) {
    const lRefKey: string = LRefKeyInfo[1];

    if (cntFrequency.has(lRefKey)) {
      cntFrequency.set(lRefKey, cntFrequency.get(lRefKey)! + 1);
    } else {
      cntFrequency.set(lRefKey, 1);
    }

    const lRefKeyReg: string = hasEscaped ? `\\$\\[${lRefKey}\\]` : `$[${lRefKey}]`;

    str = str.replace(
      lRefKeyReg,
      `(?<${lRefKey}_${cntFrequency.get(lRefKey)}>[\\d\\w]*)`
    );
  }

  return str;
};

class Template {
  public lvalue: string;
  public rvalue: string;

  public lvalueLeftRefKeys: string[] = [];
  public rvalueLeftRefKeys: string[] = [];
  public lvalueCsvColKeys: string[] = [];
  public rvalueCsvColKeys: string[] = [];

  constructor (template: string) {
    const result = utils.splitWithEscape(template, constant.TEMPLATE_SPLITER);
    this.lvalue = result[0];
    this.rvalue = result[1];

    if (this.lvalue === "") {
      throw new InvalidLeftTemplateError(ERROR_CONSTANT.LEFT_TEMPLATE_EMPTY);
    }

    this.lvalue = utils.restoreTemplateSpliter(
      this.lvalue,
      constant.TEMPLATE_SPLITER
    );

    this.rvalue = this.rvalue.trim().normalize();

    const cntFrequency: Map<string, number> = new Map();

    const findLRefKey: RegExp = new RegExp(/\$\[(?<lRefKey>[\d\w]+)\]/);
    const lRefKeysInLValue: Generator<RegExpExecArray, void, unknown> = matchAll(
      this.lvalue,
      findLRefKey
    );

    for (const lRefKeyRegExpExecArray of lRefKeysInLValue) {
      const lRefKey: string = lRefKeyRegExpExecArray[1];
      if (cntFrequency.has(lRefKey)) {
        cntFrequency.set(lRefKey, cntFrequency.get(lRefKey)! + 1);
      } else {
        cntFrequency.set(lRefKey, 1);
      }

      this.lvalueLeftRefKeys.push(lRefKey + "_" + cntFrequency.get(lRefKey));
    }

    const lRefKeysInRValue: Generator<RegExpExecArray, void, unknown> = matchAll(
      this.rvalue,
      findLRefKey
    );

    for (const lRefKey of lRefKeysInRValue) {
      this.rvalueLeftRefKeys.push(lRefKey[1]);
    }

    const findCsvKey: RegExp = new RegExp(/\$\{(?<lRefKey>[\d\w]+)\}/);

    const lvalueCsvColKeys: Generator<RegExpExecArray, void, unknown> = matchAll(
      this.lvalue,
      findCsvKey
    );

    for (const lRefKey of lvalueCsvColKeys) {
      this.lvalueCsvColKeys.push(lRefKey[1]);
    }

    const rvalueCsvColKeys: Generator<RegExpExecArray, void, unknown> = matchAll(
      this.rvalue,
      findCsvKey
    );

    for (const lRefKey of rvalueCsvColKeys) {
      this.rvalueCsvColKeys.push(lRefKey[1]);
    }
  }

  // public getTemplateLValueGroupKeyForm (escaped: boolean) {
  //   return changeLRefKeyToGroupKeys(this, escaped);
  // }
}

const handleLRefKeyInTemplateLValue = ({
  templateLValue,
}: {
  templateLValue: string;
}) => {
  if (optionManager.getInstance()['no-escape']) {
    return changeLRefKeyToGroupKeys(templateLValue, false);
  } else {
    return changeLRefKeyToGroupKeys(templateLValue, true);
  }
};

const handleSpecialCharEscapeInTemplateLValue = (templateLValue: string) => {
  if (optionManager.getInstance()['no-escape']) {
    return templateLValue;
  } else {
    return utils.handleSpecialCharacter(templateLValue);
  }
};

const handleGroupKeysInTemplateLValue = ({
  lRefKey,
  matchingStr,
  groupKeyMatchingStr,
}: {
  lRefKey: string
  matchingStr: string
  groupKeyMatchingStr: string
}) => {
  let index = 1;
  while (matchingStr.includes(`(?<${lRefKey}_${index}>)`)) {
    matchingStr = matchingStr.replace(`(?<${lRefKey}_${index}>)`, groupKeyMatchingStr);
    index++;
  }
  return matchingStr;
};

const handleLRefKeyInTemplateRValue = ({
  replacingListDict,
  matchingStr,
  lRefKey,
  groupKeyMatching,
  rvalue
}: {
  replacingListDict: ReplacingListDict;
  matchingStr: string;
  lRefKey: string;
  groupKeyMatching: RegExpMatchArray
  rvalue: string;
}) => {
  let result: string = replacingListDict.has(matchingStr) ? replacingListDict.get(matchingStr)! : rvalue;

  if (result.includes(`$[${lRefKey}]`)) {
    result = utils.replaceAll(
      result,
      `$[${lRefKey}]`,
      // always first matching when duplicate group key name exists
      groupKeyMatching.groups![lRefKey]
        ? groupKeyMatching.groups![lRefKey]
        : groupKeyMatching.groups![lRefKey + "_1"]
    );
  }

  return result;
};

export {
  handleLRefKeyInTemplateLValue,
  handleLRefKeyInTemplateRValue,
  handleSpecialCharEscapeInTemplateLValue,
  handleGroupKeysInTemplateLValue,
  Template
};