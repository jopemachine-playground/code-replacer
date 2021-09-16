const { getReplacedCode } = require('../src/getReplacedCode')
const constant = require('../src/config/constant').default
const { Template } = require('../src/template')

module.exports = class ReplacerTest {
  constructor ({ replaceArgs, expectedResult }) {
    this.args = replaceArgs
    this.args.template = new Template(
      replaceArgs.templateLValue +
        constant.TEMPLATE_SPLITER +
        replaceArgs.templateRValue
    )

    this.expectedResult = expectedResult
  }

  test () {
    const resultLines = getReplacedCode(this.args)
    const expectedLines = this.expectedResult.split('\n')
    for (let i = 0; i < expectedLines.length; i++) {
      if (resultLines[i] !== expectedLines[i]) {
        console.log(resultLines)
        return i + 1
      }
    }

    return true
  }
}
