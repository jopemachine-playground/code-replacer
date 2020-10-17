const path = require('path')
const parseSourceFile = require('../../../src/parseSourceFile').default
const utils = require('../../../src/util').default
const ReplacerTest = require('../../util')

describe('Example 1 basic test', () => {
  test('Example 1 replacer test.', async () => {
    const args = {
      csvTbl: await utils.readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}msgAlert.js` })).srcFileLines,
      templateLValue: '"${source}"',
      templateRValue: 'i18n.t("${value}")'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`alert(i18n.t("some_msg"));
alert(i18n.t("blah_blah"));`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
