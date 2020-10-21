const path = require('path')
const parseSourceFile = require('../../../src/sourceFileParser').default
const utils = require('../../../src/util').default
const ReplacerTest = require('../../util')

describe('Example 1 basic test', () => {
  test('Example 1-1 replacer test with csv column key', async () => {
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

  test('Example 1-2 constant matching', async () => {
    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}msgAlert.js` })).srcFileLines,
      templateLValue: 'Some message..',
      templateRValue: 'some_msg'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`alert("some_msg");
alert("Blah blah..");`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
