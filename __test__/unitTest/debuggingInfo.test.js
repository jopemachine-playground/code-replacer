const debuggingInfo = require('../../src/config/debuggingInfo').default

describe('debuggingInfo test', () => {
  test('debuggingInfo test', () => {
    debuggingInfo.getInstance().append('abc')
    expect(debuggingInfo.getInstance().toString()).toBe('abc')
  })
})
