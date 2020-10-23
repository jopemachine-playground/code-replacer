import { Template } from "../template";

export interface ReplacerArgument {
  srcFileName: string;
  srcFileLines: string[];
  csvTbl: object[];
  template: Template;
  excludeRegValue?: string;
  startLine?: string;
  endLine?: string;
}
