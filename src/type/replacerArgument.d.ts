export interface ReplacerArgument {
  srcFileName: string;
  srcFileLines: string[];
  csvTbl: any;
  templateLValue?: string;
  templateRValue?: string;
  excludeRegValue?: string;
  startLinePatt?: string;
  endLinePatt?: string;
}
