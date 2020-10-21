export interface ReplacerArgument {
  srcFileName: string;
  srcFileLines: string[];
  csvTbl: any;
  template: string;
  excludeRegValue?: string;
  startLine?: string;
  endLine?: string;
}
