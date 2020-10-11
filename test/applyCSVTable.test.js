const { applyCSVTable } = require("../replacer");

describe("Apply CSV Table", () => {
  test("Column variables should be appropriately replaced.", () => {
    const csvTbl = [
      { source: "Some message..", value: "some_msg" },
      { source: "Blah blah..", value: "blah_blah" },
    ];
    const templateLValue = "${source}";
    const templateRValue = 'i18n.t("${value}")';
    const replaceObj = applyCSVTable({ csvTbl, templateLValue, templateRValue });
    const keys = Object.keys(replaceObj);
    expect(keys[0]).toBe("Some message..");
    expect(keys[1]).toBe("Blah blah..");
    expect(replaceObj[keys[0]]).toBe('i18n.t("some_msg")');
    expect(replaceObj[keys[1]]).toBe('i18n.t("blah_blah")');
  });

  test("Column variables should be appropriately replaced.", () => {
    const csvTbl = [
      { index: "1", source: "example", id: "id_1", class: "class1" },
      { index: "2", source: "example", id: "id_2", class: "class2" },
      { index: "3", source: "example", id: "id_3", class: "class3" },
    ];
    const templateLValue = "${source}${index}";
    const templateRValue = '<div id="${id}" class="${class}" />';
    const replaceObj = applyCSVTable({ csvTbl, templateLValue, templateRValue });
    const keys = Object.keys(replaceObj);
    expect(keys[0]).toBe("example1");
    expect(keys[1]).toBe("example2");
    expect(keys[2]).toBe("example3");
    expect(replaceObj[keys[0]]).toBe('<div id="id_1" class="class1" />');
    expect(replaceObj[keys[1]]).toBe('<div id="id_2" class="class2" />');
    expect(replaceObj[keys[2]]).toBe('<div id="id_3" class="class3" />');
  });

  test("Should be deleted", () => {
    const csvTbl = [
      { index: "1", source: "example", id: "id_1", class: "class1" },
      { index: "2", source: "example", id: "id_2", class: "class2" },
      { index: "3", source: "example", id: "id_3", class: "class3" },
    ];
    const templateLValue = "${source}${index}";
    const templateRValue = '';
    const replaceObj = applyCSVTable({ csvTbl, templateLValue, templateRValue });
    const keys = Object.keys(replaceObj);
    expect(keys[0]).toBe("example1");
    expect(keys[1]).toBe("example2");
    expect(keys[2]).toBe("example3");
    expect(replaceObj[keys[0]]).toBe("");
    expect(replaceObj[keys[1]]).toBe("");
    expect(replaceObj[keys[2]]).toBe("");
  });
});
