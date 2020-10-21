const path = require('path')
const parseSourceFile = require('../../../src/sourceFileParser').default
const utils = require('../../../src/util').default
const ReplacerTest = require('../../util')

describe('Example 10 error test', () => {
  test('Example 10-1 csv has no column key, (CreatingReplacingObjError)', async () => {
    const args = {
      csvTbl: await utils.readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}msgAlert.js` })).srcFileLines,
      templateLValue: '"${source2}"',
      templateRValue: 'i18n.t("${value}")'
    }

    try {
      new ReplacerTest({
        replaceArgs: args,
        expectedResult: 'a'
      }).test()
    } catch (err) {
      expect(err.name).toBe('CreatingReplacingObjError')
    }
  })

  test('Example 10-2 templateLeftValue empty, (InvalidLeftTemplateError)', async () => {
    const args = {
      csvTbl: await utils.readCsv(`${__dirname}${path.sep}rlist.csv`),
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}msgAlert.js` })).srcFileLines,
      templateLValue: '',
      templateRValue: 'i18n.t("${value}")'
    }

    try {
      new ReplacerTest({
        replaceArgs: args,
        expectedResult: 'a'
      }).test()
    } catch (err) {
      expect(err.name).toBe('InvalidLeftTemplateError')
    }
  })

  test('Example 10-3 Invalid right reference, (InvalidLeftReferenceError)', async () => {
    const args = {
      csvTbl: [],
      srcFileLines: (parseSourceFile({ srcFile: `${__dirname}${path.sep}msgAlert.js` })).srcFileLines,
      templateLValue: '$[key]..',
      templateRValue: '$[key2]'
    }

    try {
      new ReplacerTest({
        replaceArgs: args,
        expectedResult: 'a'
      }).test()
    } catch (err) {
      expect(err.name).toBe('InvalidLeftReferenceError')
    }
  })
})
