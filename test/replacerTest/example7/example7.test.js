const path = require('path');
const parseSourceFile = require('../../../parseSourceFile');
const { readCsv } = require('../../../util')
const optionManager = require('../../../optionManager');
const ReplacerTest = require('../../util')

describe("Example 7 test, special character test", () => {
  test("Example 7 replacer test.", async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile :`${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}',
    };

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`hello, world!!
hello world??
hello, world..
hello@, world;;
hello_world##
hello(world)))
hello*world**
hello&world&&
hello^world^^
hello%world%%
hello+world++
hello-world-
hello, world~~`
    }).test()

    expect(testPassedOrErrorLine).toBe(true);
  });
});