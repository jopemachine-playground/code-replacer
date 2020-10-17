const path = require('path');
const parseSourceFile = require('../../../parseSourceFile');
const { readCsv } = require('../../../util')
const optionManager = require('../../../optionManager');
const ReplacerTest = require('../../util')

describe("Example 5 test", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true;
  })

  test("Example 5-1 replacer test.", async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile :`${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '<div id="id${index}" class="([\\d\\w]+)" />',
      templateRValue: '<div id="id${index}" class="${class}" />',
    };

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`<div id="id1" class="class1" />
<div id="id3" class="class3" />
<div id="id5" class="class5" />
<div id="id9" class="class9" />`
    }).test()

    expect(testPassedOrErrorLine).toBe(true);
  });

  test("Example 5-2 replacer test.", async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile :`${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '<div id="id${index}" class="([\\d\\w]+)" />',
      templateRValue: '<div class="${class}" id="id${index}" />',
    };

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`<div class="class1" id="id1" />
<div class="class3" id="id3" />
<div class="class5" id="id5" />
<div class="class9" id="id9" />`
    }).test()

    expect(testPassedOrErrorLine).toBe(true);
  });
});
