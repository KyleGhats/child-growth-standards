import type { AssessmentResult, IndicatorResult, Sex } from "./types.js";
export type PediatricGrowthRequestBody = {
    mode?: "all" | "zscore" | "compare";
    standard?: string;
    sex?: string | Sex;
    dateOfBirth?: string | Date;
    dateOfMeasurement?: string | Date;
    weightKg?: number;
    lengthHeightCm?: number;
    headCircumferenceCm?: number | string | null;
    muacCm?: number | string | null;
    bilateralPittingEdema?: boolean | string;
    whoAgeIndex?: "days" | "months";
    indicator?: string;
    measurement?: number | string | null;
};
export type PediatricGrowthCompareResult = {
    mode: "compare";
    ageDays: number;
    ageMonthsCompleted: number;
    whoDays: AssessmentResult;
    whoMonths: AssessmentResult;
    nnc: AssessmentResult | null;
};
export type PediatricGrowthAllResult = {
    mode: "all";
    assessment: AssessmentResult;
};
export type PediatricGrowthZScoreResult = {
    mode: "zscore";
    result: IndicatorResult | null;
};
export type PediatricGrowthRequestResult = PediatricGrowthCompareResult | PediatricGrowthAllResult | PediatricGrowthZScoreResult;
/** BMRS-shaped API: compare / all / zscore without HTTP. Safe for static SPA (no Node). */
export declare function runPediatricGrowthRequest(body: PediatricGrowthRequestBody): Promise<PediatricGrowthRequestResult>;
/** @deprecated Use runPediatricGrowthRequest */
export declare const computePediatricGrowthRequest: typeof runPediatricGrowthRequest;
//# sourceMappingURL=run-pediatric-growth-request.d.ts.map