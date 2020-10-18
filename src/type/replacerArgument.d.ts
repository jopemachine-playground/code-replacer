export interface ReplacerArgument {
  srcFileName: string;
  srcFileLines: string[];
  csvTbl: any;
  templateLValue?: string;
  templateRValue?: string;
  excludeRegValue?: string;
  startLine?: string;
  endLine?: string;
}
