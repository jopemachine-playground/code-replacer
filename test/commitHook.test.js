describe("Home Flow", () => {
  test("usageLog should be empty", () => {
    const usageLog = require('../usageLog.json');
    expect(Object.keys(usageLog).length).toBe(0);
  });
});