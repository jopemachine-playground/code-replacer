const path = require('path')
const parseSourceFile = require('../../../src/parseSourceFile').default
const { readCsv } = require('../../../src/util').default
const optionManager = require('../../../src/optionManager').default
const ReplacerTest = require('../../util')

describe('Example 4, csv column key and left reference key test', () => {
  test('Example 4-1 replacer test.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.js` })).srcFileLines,
      templateLValue: ('$[key1] ${source}${index} $[key2]'),
      templateRValue: '$[key2] ${index}${source} $[key1]'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`grg 1example greg
fewf 2example abc
ghth 3example ffegg`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 4-2 replacer test.', async () => {
    optionManager.getInstance()['no-escape'] = true

    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.js` })).srcFileLines,
      templateLValue: ('(?<front>[\\d\\w? ]*) ${source}${index} (?<rear>[\\d\\w]+)'),
      templateRValue: '$[rear] ${index}${source} $[front]'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`grg 1example fwef ? ? ? ? ewfewgr gtrghtrg wqdq f ew ff greg
fewf 2example abc
ghth 3example ffegg`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
