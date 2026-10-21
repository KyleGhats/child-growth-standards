import type { LmsRow } from "./types.js";
export declare function lookupLms(table: LmsRow[], index: number): LmsRow | null;
/** WHO LMS z-score with L≈0 and |Z|>3 extrapolation. */
export declare function computeZScore(measurement: number, lms: LmsRow): number;
/** Abramowitz & Stegun normal CDF approximation. */
export declare function normalCdf(z: number): number;
export declare function zScoreToPercentile(z: number): number;
//# sourceMappingURL=lms.d.ts.map