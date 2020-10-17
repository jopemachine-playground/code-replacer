const path = require('path')
const parseSourceFile = require('../../../src/parseSourceFile').default
const ReplacerTest = require('../../util')

describe('Example 2 basic left reference key test', () => {
  test('Example 2 replacer test.', async () => {
    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.js` })).srcFileLines,
      templateLValue: ('require("$[key]")'),
      templateRValue: 'import $[key] from "$[key]"'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`import abc from "abc";
import def from "def";
import ghi from "ghi";`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
