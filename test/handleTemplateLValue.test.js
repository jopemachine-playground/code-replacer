const handleTemplateLValue = require("../template");

describe("Handle template", () => {
  test("Not reg", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValue(false, templateLValue)
    expect(result).toBe("(?<key1>[\\\d\\\w]*) \\\$\\\{source\\\}\\\$\\\{index\\\} (?<key2>[\\\d\\\w]*)")
  });

  test("Reg", () => {
    const templateLValue = '$[key1] ${source}${index} $[key2]';
    const result = handleTemplateLValue(true, templateLValue)
    expect(result).toBe("(?<key1>[\\\d\\\w]*) ${source}${index} (?<key2>[\\\d\\\w]*)")
  });
});
