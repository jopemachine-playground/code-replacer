const util = require('../../../src/util').default
const path = require('path')

describe('Util functions', () => {
  test('getProperties', () => {
    const obj = {
      a: 'b',
      c: 'd'
    }
    expect(util.getProperties(obj)).toBe(
`a=b
c=d
`)
  })

  test('splitWithEscape test 1', () => {
    const str1 = 'abc->def'
    const str1Result = util.splitWithEscape(str1, '->')
    expect(str1Result[0]).toBe('abc')
    expect(str1Result[1]).toBe('def')
  })

  test('splitWithEscape test 2', () => {
    const str1 = 'abc///def'
    const str1Result = util.splitWithEscape(str1, '///')
    expect(str1Result[0]).toBe('abc')
    expect(str1Result[1]).toBe('def')
  })

  test('splitWithEscape test 3', () => {
    const str1 = 'abc,def'
    const str1Result = util.splitWithEscape(str1, ',')
    expect(str1Result[0]).toBe('abc')
    expect(str1Result[1]).toBe('def')
  })

  test('findReplaceListFile - 1', () => {
    const rlistPath = util.findReplaceListFile({
      rlistDir: __dirname,
      srcFileName: ''
    })
    const expectedPath = rlistPath.split(path.sep)
    expect(expectedPath[expectedPath.length - 1]).toBe('rlist.csv')
  })

  test('findReplaceListFile - 2', () => {
    const rlistPath = util.findReplaceListFile({
      rlistDir: __dirname,
      srcFileName: 'sample'
    })
    const expectedPath = rlistPath.split(path.sep)
    expect(expectedPath[expectedPath.length - 1]).toBe('rlist_sample.csv')
  })
})
