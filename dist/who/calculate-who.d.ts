import type { AssessmentResult, CalculateAllInput, CalculateZScoreInput, IndicatorResult } from "../types.js";
/** WHO weight-for-height tables index standing height from 65 cm. */
export declare const WHO_WFH_MIN_LENGTH_CM = 65;
export declare function resolveWhoWflWfhIndicator(ageDays: number, lengthHeightCm: number | undefined): {
    tableIndicator: "wfl" | "wfh";
    apiIndicator: "weight-for-length" | "weight-for-height";
} | null;
export declare function calculateWhoZScore(input: CalculateZScoreInput): IndicatorResult | null;
export declare function calculateWhoAll(input: CalculateAllInput): AssessmentResult;
//# sourceMappingURL=calculate-who.d.ts.map