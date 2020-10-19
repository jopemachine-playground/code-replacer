export interface CommandArguments {
  src: string;
  template: string;
  verbose?: boolean;
  debug?: boolean;
  overwrite?: boolean;
  once?: boolean;
  conf?: boolean;
  startLine?: string;
  endLine?: string;
  excludeReg?: string;
  dir?: string;
  csv?: string;
  ext?: string;
  dst?: string;
  ['no-escape']?: boolean;
}