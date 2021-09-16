const utils = require('../../src/util').default
const constant = require('../../src/config/constant').default

describe('printLines test', () => {
  test('printLines format test', () => {
    const str = utils.printLines({
      srcFileName: 'abc',
      lineIdx: 4,
      sourceStr: 'hi there.',
      replacedStr: 'hello',
      srcFileLines: ['abc', 'def', 'eff', 'f2gf'],
      resultLines: ['abc', 'def', 'eff', 'f2gf']
    })

    // ** Results is as follows.
    // ──────────────────────────────────────────────────────────────────────────────────────────

    // # Line: 4, in 'abc'

    // 3 ║   eff
    // 4 ║   hi there.
    // 4 ║   hello
    const results = str.split('\n')

    expect(results[0]).toBe('')
    expect(results[1].includes('─')).toBe(true)
    expect(results[2]).toBe('')
    expect(results[3].includes('Line: ')).toBe(true)
    expect(results[4]).toBe('')
    expect(results[5].includes(constant.LINENUM_AREA_SPLITER)).toBe(true)
    expect(results[6].includes(constant.LINENUM_AREA_SPLITER)).toBe(true)
    expect(results[7].includes(constant.LINENUM_AREA_SPLITER)).toBe(true)
  })
})
