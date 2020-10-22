const { Template } = require('../../src/template')
const ReplacingListDict = require('../../src/replacingListDict').default
const constant = require('../../src/constant').default

describe('Generating replacingListDict test', () => {
  test('Column variables should be appropriately replaced.', () => {
    const csvTbl = [
      { source: 'Some message..', value: 'some_msg' },
      { source: 'Blah blah..', value: 'blah_blah' }
    ]
    const templateLValue = '${source}'
    const templateRValue = 'i18n.t("${value}")'

    const template = new Template(`${templateLValue}${constant.TEMPLATE_SPLITER}${templateRValue}`)
    const replacingListDict = new ReplacingListDict(csvTbl, template)
    const keys = replacingListDict.replacingKeys
    expect(keys[0]).toBe('Some message..')
    expect(keys[1]).toBe('Blah blah..')
    expect(replacingListDict.get(keys[0])).toBe('i18n.t("some_msg")')
    expect(replacingListDict.get(keys[1])).toBe('i18n.t("blah_blah")')
  })

  test('Column variables should be appropriately replaced.', () => {
    const csvTbl = [
      { index: '1', source: 'example', id: 'id_1', class: 'class1' },
      { index: '2', source: 'example', id: 'id_2', class: 'class2' },
      { index: '3', source: 'example', id: 'id_3', class: 'class3' }
    ]
    const templateLValue = '${source}${index}'
    const templateRValue = '<div id="${id}" class="${class}" />'
    const template = new Template(`${templateLValue}${constant.TEMPLATE_SPLITER}${templateRValue}`)
    const replacingListDict = new ReplacingListDict(csvTbl, template)

    const keys = replacingListDict.replacingKeys
    expect(keys[0]).toBe('example1')
    expect(keys[1]).toBe('example2')
    expect(keys[2]).toBe('example3')
    expect(replacingListDict.get(keys[0])).toBe('<div id="id_1" class="class1" />')
    expect(replacingListDict.get(keys[1])).toBe('<div id="id_2" class="class2" />')
    expect(replacingListDict.get(keys[2])).toBe('<div id="id_3" class="class3" />')
  })

  test('Should be deleted', () => {
    const csvTbl = [
      { index: '1', source: 'example', id: 'id_1', class: 'class1' },
      { index: '2', source: 'example', id: 'id_2', class: 'class2' },
      { index: '3', source: 'example', id: 'id_3', class: 'class3' }
    ]
    const templateLValue = '${source}${index}'
    const templateRValue = ''
    const template = new Template(`${templateLValue}${constant.TEMPLATE_SPLITER}${templateRValue}`)
    const replacingListDict = new ReplacingListDict(csvTbl, template)

    const keys = replacingListDict.replacingKeys

    expect(keys[0]).toBe('example1')
    expect(keys[1]).toBe('example2')
    expect(keys[2]).toBe('example3')
    expect(replacingListDict.get(keys[0])).toBe('')
    expect(replacingListDict.get(keys[1])).toBe('')
    expect(replacingListDict.get(keys[2])).toBe('')
  })
})
