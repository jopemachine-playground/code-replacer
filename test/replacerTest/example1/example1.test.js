const path = require('path');
const parseSourceFile = require('../../../parseSourceFile');
const { readCsv } = require('../../../util')
const ReplacerTest = require('../../util')

describe("Example 1 basic test", () => {
  test("Example 1 replacer test.", async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile :`${__dirname}${path.sep}msgAlert.js` })).srcFileLines,
      templateLValue: '"${source}"',
      templateRValue: 'i18n.t("${value}")',
    };

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`alert(i18n.t("some_msg"));
alert(i18n.t("blah_blah"));`
    }).test()

    expect(testPassedOrErrorLine).toBe(true);
  });
});
