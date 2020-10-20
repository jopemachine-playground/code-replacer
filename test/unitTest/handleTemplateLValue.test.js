const { handleLRefKeyInTemplateLValue, handleSpecialCharEscapeInTemplateLValue } = require('../../src/template')
const optionManager = require('../../src/optionManager').default

describe('handleLRefKeyInTemplateLValue', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false
  })

  test('With escape', () => {
    const { escaped, str } = handleSpecialCharEscapeInTemplateLValue('$[key1] ${source}${index} $[key2]')
    const result = handleLRefKeyInTemplateLValue({ templateLValue: str, escaped })
    expect(result).toBe('(?<key1>[\\d\\w]*) \\$\\{source\\}\\$\\{index\\} (?<key2>[\\d\\w]*)')
  })
})

describe('Handle template', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true
  })

  test('With no-escape', () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]'
    const result = handleLRefKeyInTemplateLValue({ templateLValue: templateLValue, escaped: false })
    expect(result).toBe('(?<key1>[\\\d\\\w]*) ${source}${index} (?<key2>[\\\d\\\w]*)')
  })
})
