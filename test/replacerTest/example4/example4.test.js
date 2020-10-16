const path = require('path');
const parseSourceFile = require('../../../parseSourceFile');
const { readCsv } = require('../../../util')
const ReplacerTest = require('../../util')

describe("Example 4 test", () => {
  test("Example 4 replacer test.", async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile :`${__dirname}${path.sep}index.js` })).srcFileLines,
      templateLValue: "$[key1] ${source}${index} $[key2]",
      templateRValue: '$[key2] ${index}${source} $[key1]',
    };

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`grg 1example greg
fewf 2example abc
ghth 3example ffegg`
    }).test()

    expect(testPassedOrErrorLine).toBe(true);
  });
});
