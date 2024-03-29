const path = require('path')
const parseSourceFile = require('../../../src/sourceFileParser').default
const { readCsv } = require('../../../src/util').default
const ReplacerTest = require('../../util')
const optionManager = require('../../../src/cli/optionManager').default

describe('Example 8 test, boolean flags and other options test', () => {
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

  test('Example 8-4 startLine test.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist2.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}',
      startLine: '  <title>login</title>'
    }

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

  <!-- Login -->
  <link rel="stylesheet" href="./css/bootstrap.min.css">

</head>`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })

  test('Example 8-5 startLine and endLine test.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist2.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index2.html` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}',
      startLine: '  <title>login</title>',
      endLine: '<!-- login -->'
    }

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

  test('Example 8-6 multiple startLine and endLine.', async () => {
    const args = {
      csvTbl: await readCsv(`${__dirname}${path.sep}rlist3.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}index3` })).srcFileLines,
      templateLValue: '${source}',
      templateRValue: '${value}',
      startLine: '## start',
      endLine: '## end'
    }

    const testPassedOrErrorLine = new ReplacerTest({
      replaceArgs: args,
      expectedResult:
`## start

html2
javascript2
php2

## end

html
javascript
php

## start

html2
javascript2
php2

## end

html
javascript
php

## start

html2
javascript2
php2`
    }).test()

    expect(testPassedOrErrorLine).toBe(true)
  })
})
