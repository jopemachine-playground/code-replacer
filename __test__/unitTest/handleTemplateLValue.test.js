const {
  Template,
  handleSpecialCharEscapeInTemplateLValue
} = require('../../src/template')
const optionManager = require('../../src/optionManager').default

describe('handleLRefKeyInTemplateLValue', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false
  })

  test('handleLRefKeyInTemplateLValue with escape 1', () => {
    const template = new Template('$[key1] ${source}${index} $[key2]->')
    expect(template.lvalue).toBe('$[key1] ${source}${index} $[key2]')
    expect(template.rvalue).toBe('')

    const result = template.getGroupKeyForm(handleSpecialCharEscapeInTemplateLValue(template.lvalue))
    expect(result).toBe('(?<key1_1>[\\d\\w]*) \\$\\{source\\}\\$\\{index\\} (?<key2_1>[\\d\\w]*)')
  })

  test('handleLRefKeyInTemplateLValue with escape 2', () => {
    const template = new Template('$[key1] ${source}${index} $[key1]->')
    expect(template.lvalue).toBe('$[key1] ${source}${index} $[key1]')
    expect(template.rvalue).toBe('')

    const result = template.getGroupKeyForm(handleSpecialCharEscapeInTemplateLValue(template.lvalue))
    expect(result).toBe('(?<key1_1>[\\d\\w]*) \\$\\{source\\}\\$\\{index\\} (?<key1_2>[\\d\\w]*)')
  })
})

describe('Handle template', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true
  })

  test('With no-escape', () => {
    const template = new Template('$[key1] ${source}${index} $[key2]->')
    expect(template.lvalue).toBe('$[key1] ${source}${index} $[key2]')
    expect(template.rvalue).toBe('')

    const result = template.getGroupKeyForm(handleSpecialCharEscapeInTemplateLValue(template.lvalue))
    expect(result).toBe('(?<key1_1>[\\d\\w]*) ${source}${index} (?<key2_1>[\\d\\w]*)')
  })
})
