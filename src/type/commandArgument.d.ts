export interface CommandArguments {
  verbose?: boolean;
  debug?: boolean;
  overwrite?: boolean;
  once?: boolean;
  conf?: boolean;
  startLine?: string;
  endLine?: string;
  template?: string;
  excludeReg?: string;
  src: string;
  dir?: string;
  csv?: string;
  ext?: string;
  dst?: string;
  ['no-escape']?: boolean;
}