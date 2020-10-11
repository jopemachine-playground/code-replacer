const { handleTemplateLValue } = require("../template");
const optionManager = require('../optionManager');

describe("handleTemplateLValue", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false;
  })

  test("With escape", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValue(templateLValue);
    expect(result).toBe("(?<key1>[\\\d\\\w]*) \\\$\\\{source\\\}\\\$\\\{index\\\} (?<key2>[\\\d\\\w]*)")
  });
});

describe("Handle template", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true;
  })

  test("With no-escape", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValue(templateLValue);
    expect(result).toBe("(?<key1>[\\\d\\\w]*) ${source}${index} (?<key2>[\\\d\\\w]*)")
  });
});