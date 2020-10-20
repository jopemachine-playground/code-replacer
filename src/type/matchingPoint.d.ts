export interface MatchingPoint {
  push(replacingKeyMatchingPt: RegExpExecArray);
  leastIdx: number;
  length: number;
  [x: number]: RegExpExecArray;
  [Symbol.iterator](): IterableIterator<RegExpExecArray>;
}
