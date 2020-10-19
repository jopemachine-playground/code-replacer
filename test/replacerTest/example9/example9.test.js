/* eslint-disable no-unused-vars */
const path = require('path')
const parseSourceFile = require('../../../src/parseSourceFile').default
const { readCsv } = require('../../../src/util').default
const ReplacerTest = require('../../util')
const optionManager = require('../../../src/optionManager').default

describe('Example 9-1 test, complex special character handling', () => {
  test('Example 9-1-1 test', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: 'ABC${source}cAC',
      templateRValue: '${value}'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
'${value}${value}'
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 9-1-2 test', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: 'ABC ${source}DEF',
      templateRValue: '${value}'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`fewf
ABC adafwifeifndDEF
kkef
[\\d\\w]+
[\\d\\w]+
[\\d\\w]+if`

    }).test()
    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 9-1-3 test', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: '[\\d\\w]+${source}',
      templateRValue: 'abc'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`ABC adafwifeifnoDEF
ABC adafwifeifndDEF
ABC [.*]+DEF
ABC dqfeDEF
[\\d\\w]+
abc`

    }).test()
    expect(testPassedOrErrorLine).toBe(true)
  })
})

describe('Example 9-2 test, complex special character handling with no-escape option', () => {
  test('Example 9-2-1 test', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index.html` })).srcFileLines,
      templateLValue: 'ABC${source}cAC',
      templateRValue: '${value}'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
'${value}${value}'
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 9-2-2 test', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: 'ABC ${source}DEF',
      templateRValue: '${value}'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`fewf
ABC adafwifeifndDEF
kkef
[\\d\\w]+
[\\d\\w]+
[\\d\\w]+if`

    }).test()
    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 9-2-3 test', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: '[\\d\\w]+${source}',
      templateRValue: 'abc'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`ABC adafwifeifnoDEF
ABC adafwifeifndDEF
ABC [.*]+DEF
ABC dqfeDEF
[\\d\\w]+
abc`

    }).test()
    expect(testPassedOrErrorLine).toBe(true)
  })
})

describe('Example 9-3 test, template spliter escaping', () => {
  test('Example 9-3-1 test', async () => {
    // optionManager.getInstance()['no-escape'] = true

    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index3.html` })).srcFileLines,
      templateLValue: '\\->',
      templateRValue: '<-'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`fewf<-febfbfd
<-<-<-<-<-<-<-`

    }).test()
    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 9-3-2 test', async () => {
    // optionManager.getInstance()['no-escape'] = true

    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index3.html` })).srcFileLines,
      templateLValue: '\\->\\->\\->\\->\\->\\->\\->',
      templateRValue: '<-'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`fewf->febfbfd
<-`

    }).test()
    expect(testPassedOrErrorLine).toBe(true)
  })
})
