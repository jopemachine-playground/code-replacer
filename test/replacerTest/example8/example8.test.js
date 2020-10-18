const path = require('path')
const parseSourceFile = require('../../../src/parseSourceFile').default
const { readCsv } = require('../../../src/util').default
const ReplacerTest = require('../../util')
const optionManager = require('../../../src/optionManager').default

describe('Example 8 test, flags test', () => {
  test('Example 8-1 onceOpt test.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}'
    }

    optionManager.getInstance().onceOpt = true

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`_abc def
_abcdef`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 8-2 excludeReg test.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}',
      excludeRegValue: '.*abcdef.*'
    }

    optionManager.getInstance().onceOpt = false

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`_abc _def
abcdef`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
