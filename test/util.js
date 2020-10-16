const { replace } = require("../replacer");

module.exports = class ReplacerTest {
  constructor({ replaceArgs, expectedResult }) {
    this.args = replaceArgs
    this.expectedResult = expectedResult
  }

  test() {
    const resultLines = replace(this.args);
    const expectedLines = this.expectedResult.split("\n");
    for (let i = 0; i < expectedLines.length; i++) {
      if (resultLines[i] !== expectedLines[i]) {
        console.log(resultLines);
        return i + 1;
      }
    }

    return true;
  }
}