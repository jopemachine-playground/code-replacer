const StringBuffer = require('../../src/stringBuffer').default

describe('StringBuffer test', () => {
  test('StringBuffer test', () => {
    const sb = new StringBuffer()
    sb.append('a')
    sb.append('a')
    sb.append('b')
    sb.append('c')
    console.log(sb.toString())
    expect(sb.toString()).toBe(
`a
a
b
c`)
  })
})
