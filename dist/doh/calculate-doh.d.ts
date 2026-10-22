import type { AssessmentResult, CalculateAllInput, Sex } from "../types.js";
/** Last month index in bundled NNC WFA/LHFA tables (inclusive). */
export declare const NNC_MAX_COMPLETED_MONTH_INDEX = 71;
/** Exclusive upper bound for completed months when NNC age tables apply. */
export declare const NNC_EXCLUSIVE_MAX_COMPLETED_MONTHS = 72;
export declare function calculateDohAll(input: CalculateAllInput): AssessmentResult;
export declare function isNncGrowthAge(months: number): boolean;
/** @deprecated Use isNncGrowthAge — NNC WFA/LHFA tables run through 71 completed months. */
export declare function isDohPreschoolAge(months: number): boolean;
export declare function mapSex(input: string): Sex | null;
//# sourceMappingURL=calculate-doh.d.ts.map