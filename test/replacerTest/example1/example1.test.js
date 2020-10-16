const path = require('path');
const parseSourceFile = require('../../../parseSourceFile');
const { replace } = require("../../../replacer");
const { readCsv } = require('../../../util')

describe("Example 1 test", () => {
  test("Example 1 replacer test.", async () => {
    const templateLValue = "\"${source}\"";
    const templateRValue = 'i18n.t("${value}")';
    const csvTbl = await readCsv(`${__dirname}${path.sep}rlist.csv`);

    const srcFileInfo = parseSourceFile({
      srcFile :`${__dirname}${path.sep}msgAlert.js`
    });

    const args = {
      csvTbl,
      srcFileLines: srcFileInfo.srcFileLines,
      srcFileName: `msgAlert.js`,
      templateLValue,
      templateRValue,
    };

    const resultLines = replace(args);

    expect(resultLines[0]).toBe(`alert(i18n.t("some_msg"));`);
    expect(resultLines[1]).toBe(`alert(i18n.t("blah_blah"));`);
  });
});
