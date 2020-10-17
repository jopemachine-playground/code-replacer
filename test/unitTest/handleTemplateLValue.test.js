const { handleTemplateLValuesLRefKey, handleTemplateLValuesSpecialCharEscape } = require("../../template");
const optionManager = require('../../optionManager');

describe("handleTemplateLValuesLRefKey", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false;
  })

  test("With escape", () => {
    const { escaped, str } = handleTemplateLValuesSpecialCharEscape('$[key1] ${source}${index} $[key2]');
    const result = handleTemplateLValuesLRefKey({ templateLValue: str, escaped });
    expect(result).toBe("(?<key1>[\\d\\w]*) \\$\\{source\\}\\$\\{index\\} (?<key2>[\\d\\w]*)")
  });
});

describe("Handle template", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true;
  })

  test("With no-escape", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValuesLRefKey({ templateLValue: templateLValue, escaped: false });
    expect(result).toBe("(?<key1>[\\\d\\\w]*) ${source}${index} (?<key2>[\\\d\\\w]*)")
  });
});