import { CreatingReplacingObjError, ERROR_CONSTANT } from "./error";
import { Template } from "./template";
import utils from './util';

export default class ReplacingListDict extends Map<string, string> {
  public replacingKeys: string[] = [];

  constructor(csvTbl: any, templateObj: Template) {
    super();
    if (csvTbl.length > 0) {
      const csvColumnNames: string[] = Object.keys(csvTbl[0]);
      for (const csvRecord of csvTbl) {
        let key: string = templateObj.lvalue;
        let value: string = templateObj.rvalue;

        for (const columnName of csvColumnNames) {
          const trimmedColumnName: string = columnName.trim();
          const result = utils.handleCSVColKey({
            csvRecord,
            columnName: trimmedColumnName,
            templateLValue: key,
            templateRValue: value,
          });
          key = result.templateLValue;
          value = result.templateRValue;
        }

        if (this.get(key)) {
          throw new CreatingReplacingObjError(
            ERROR_CONSTANT.DUPLICATE_KEY(key, this[key])
          );
        }
        this.set(key, value);
      }

      this.replacingKeys = [...this.keys()].sort((a: string, b: string) => {
        return b.length - a.length || a.localeCompare(b);
      });

    }
  }
}
