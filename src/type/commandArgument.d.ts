export interface CommandArguments {
  verbose?: boolean;
  debug?: boolean;
  overwrite?: boolean;
  once?: boolean;
  conf?: boolean;
  startLinePatt?: string;
  endLinePatt?: string;
  template?: string;
  excludeReg?: string;
  src: string;
  dir?: string;
  csv?: string;
  ext?: string;
  dst?: string;
  ['no-escape']?: boolean;
}