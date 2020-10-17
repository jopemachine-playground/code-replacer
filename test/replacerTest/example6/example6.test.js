const path = require('path');
const parseSourceFile = require('../../../parseSourceFile');
const { readCsv } = require('../../../util')
const optionManager = require('../../../optionManager');
const ReplacerTest = require('../../util')

describe("Example 6 test", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true;
  })

  test("Example 6 replacer test.", async () => {
    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile :`${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '(?<first>[0-9]{3})(?<second>[0-9]{4})(?<third>[0-9]{4})',
      templateRValue: '$[first]-$[second]-$[third]',
    };

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`010-1144-3343
011-1144-3663
019-1444-3663
010-1444-3993`
    }).test()

    expect(testPassedOrErrorLine).toBe(true);
  });
});
