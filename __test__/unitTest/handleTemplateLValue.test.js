const { handleLRefKeyInTemplateLValue, handleSpecialCharEscapeInTemplateLValue } = require('../../src/template')
const optionManager = require('../../src/optionManager').default

describe('handleLRefKeyInTemplateLValue', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false
  })

  test('handleLRefKeyInTemplateLValue with escape 1', () => {
    const str = handleSpecialCharEscapeInTemplateLValue('$[key1] ${source}${index} $[key2]')
    const result = handleLRefKeyInTemplateLValue({ templateLValue: str })
    expect(result).toBe('(?<key1_1>[\\d\\w]*) \\$\\{source\\}\\$\\{index\\} (?<key2_1>[\\d\\w]*)')
  })

  test('handleLRefKeyInTemplateLValue with escape 2', () => {
    const str = handleSpecialCharEscapeInTemplateLValue('$[key1] ${source}${index} $[key1]')
    const result = handleLRefKeyInTemplateLValue({ templateLValue: str })
    expect(result).toBe('(?<key1_1>[\\d\\w]*) \\$\\{source\\}\\$\\{index\\} (?<key1_2>[\\d\\w]*)')
  })
})

describe('Handle template', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true
  })

  test('With no-escape', () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]'
    const result = handleLRefKeyInTemplateLValue({ templateLValue: templateLValue })
    expect(result).toBe('(?<key1_1>[\\d\\w]*) ${source}${index} (?<key2_1>[\\d\\w]*)')
  })
})
