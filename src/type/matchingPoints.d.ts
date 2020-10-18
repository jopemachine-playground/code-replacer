import { MatchingPoint } from './matchingPoint'

export interface MatchingPoints {
  sort (arg0: (lPt: any, rPt: any) => number);
  length: number;
  replacingKey?: string;
  [x: number]: MatchingPoint;
}
