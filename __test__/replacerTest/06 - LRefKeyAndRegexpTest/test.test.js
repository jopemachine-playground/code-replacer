const path = require('path')
const parseSourceFile = require('../../../src/sourceFileParser').default
const optionManager = require('../../../src/cli/optionManager').default
const ReplacerTest = require('../../util')

describe('Example 6, Left reference key and regexp test', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true
  })

  test('Example 6 replacer test with regex and group key', async () => {
    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: '(?<first>[0-9]{3})(?<second>[0-9]{4})(?<third>[0-9]{4})',
      templateRValue: '$[first]-$[second]-$[third]'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`010-1144-3343
011-1144-3663
019-1444-3663
010-1444-3993`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
