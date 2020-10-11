const { handleTemplateLValue } = require("../template");
const optionManager = require('../optionManager');

describe("Handle template", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = false;
  })

  test("Not reg", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValue(templateLValue);
    expect(result).toBe("(?<key1>[\\\d\\\w]*) \\\$\\\{source\\\}\\\$\\\{index\\\} (?<key2>[\\\d\\\w]*)")
  });
});

describe("Handle template", () => {
  beforeAll(() => {
    optionManager.getInstance()['no-escape'] = true;
  })

  test("Reg", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValue(templateLValue);
    expect(result).toBe("(?<key1>[\\\d\\\w]*) ${source}${index} (?<key2>[\\\d\\\w]*)")
  });
});