const { getMatchingPoints } = require('../../src/getReplacedCode')
const optionManager = require('../../src/cli/optionManager').default
const {
  Template
} = require('../../src/template')

// Pre condition: Replacing keys are sorted by length.
describe('Should be matched', () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false
  })

  test('Should be matched', () => {
    const template = new Template('$[edf]->')
    const srcLine = 'greg example1 grg'
    const replacingKeys = ['greg example1 $[edf]', 'greg example3 $[edf]']
    const result = getMatchingPoints({ srcLine, replacingKeys, template })
    expect(result.length).toBe(1)
  })

  test('Should be matched', () => {
    const template = new Template('A->')
    const srcLine = 'greg example1 grg'
    const replacingKeys = ['greg example1', 'greg example3']
    const result = getMatchingPoints({ srcLine, replacingKeys, template })
    expect(result.length).toBe(1)
  })
})

describe('Should not be matched', () => {
  test('Should not be matched', () => {
    const template = new Template('$[edf]->')
    const srcLine = 'greg example1 grg'
    const replacingKeys = ['abc example1 $[edf]', 'def example3 $[edf]']
    const result = getMatchingPoints({ srcLine, replacingKeys, template })
    expect(result.length).toBe(0)
  })
})

describe('Should be matched - multiple matching', () => {
  test('Should be matched', () => {
    const template = new Template('A->')
    const srcLine = 'abcdefg'
    const replacingKeys = ['abcdefg', 'abcde', 'abcd', 'efg']
    const result = getMatchingPoints({ srcLine, replacingKeys, template })
    expect(result[0].length).toBe(4)
  })

  test('Should be matched - multiple matching', () => {
    const template = new Template('A->')
    const srcLine = 'abcdefg fefgg'
    const replacingKeys = ['abcdefg', 'abcde', 'fefgg', 'abcd', 'efg', 'fef']
    const result = getMatchingPoints({ srcLine, replacingKeys, template })

    expect(result[0].length).toBe(4)
    expect(result[1].length).toBe(3)
    expect(result.length).toBe(2)
  })
})
