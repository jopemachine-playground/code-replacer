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

  test('Example 8-3 excludeReg test.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist2.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}',
      excludeRegValue: '.*<!--.*'
    }

    optionManager.getInstance().onceOpt = false

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`<!DOCTYPE html>
<html lang="kr">
<head>
  <meta charset="utf-8">
  <meta name="description" content="Chatting web program Login page">
  <meta name="keywords" content="Web Programming Term Project, Chatting">
  <!-- login -->
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />

  <title>Login</title>

  <!-- login -->
  <link rel="stylesheet" href="./css/bootstrap.min.css">

</head>`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
