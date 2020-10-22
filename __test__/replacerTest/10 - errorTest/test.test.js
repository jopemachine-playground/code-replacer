const path = require('path')
const parseSourceFile = require('../../../src/sourceFileParser').default
const utils = require('../../../src/util').default
const ReplacerTest = require('../../util')
const { Template } = require('../../../src/template')

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
        expectedResult: ''
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
        expectedResult: ''
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
        expectedResult: ''
      }).test()
    } catch (err) {
      expect(err.name).toBe('InvalidLeftReferenceError')
    }
  })

  test('Example 10-4 Duplicate key errors, (CSVParsingError)', async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      await utils.readCsv(`${__dirname}${path.sep}rlist.csv`, new Template('${value}->${source}'))
    } catch (err) {
      expect(err.name).toBe('CSVParsingError')
    }
  })

  test('Example 10-5 TemplateLValue has no csv col key, (TemplateHasNoCSVCOLKeyWithCSVError)', async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      await utils.readCsv(`${__dirname}${path.sep}rlist.csv`, new Template('${value2}->${source}'))
    } catch (err) {
      expect(err.name).toBe('TemplateHasNoCSVCOLKeyWithCSVError')
    }
  })

  test('Example 10-6 Source File not found, (FileNotFoundError)', async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      parseSourceFile({ srcFile: `${__dirname}${path.sep}msgAlert?.js` })
    } catch (err) {
      expect(err.name).toBe('FileNotFoundError')
    }
  })

  test('Example 10-7 CSV File not found, (FileNotFoundError)', async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      await utils.readCsv(`${__dirname}${path.sep}rlist?.csv`, new Template('${value2}->${source}'))
    } catch (err) {
      expect(err.name).toBe('FileNotFoundError')
    }
  })
})
