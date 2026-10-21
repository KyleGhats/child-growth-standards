import type { WhoNutritionalStatusResult } from "../types.js";
export type WhoIndicatorKind = "wfa" | "hfa" | "lhfa" | "wfl" | "wfh" | "bfa" | "hcfa";
export declare function mapWhoNutritionalStatus(indicatorKind: WhoIndicatorKind, zScore: number, ageInDays: number): WhoNutritionalStatusResult;
//# sourceMappingURL=nutritional-status.d.ts.map