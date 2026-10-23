import type { IndicatorResult, WhoNutritionalStatusResult } from "../types.js";
export type WhoIndicatorKind = "wfa" | "hfa" | "lhfa" | "wfl" | "wfh" | "bfa" | "hcfa";
/** IMCI MUAC classification typically applies at 6–59 completed months. */
export declare const MUAC_CLASSIFICATION_MIN_MONTHS = 6;
export declare const MUAC_CLASSIFICATION_MAX_MONTHS = 59;
export declare function mapWhoNutritionalStatus(indicatorKind: WhoIndicatorKind, zScore: number, ageInDays: number): WhoNutritionalStatusResult;
/** Table 1 MUAC cutoffs (115 mm / 125 mm), input in cm. */
export declare function mapWhoMuacNutritionalStatus(muacCm: number, ageMonthsCompleted: number): WhoNutritionalStatusResult | null;
/** Table 1: bilateral pitting oedema → severe acute malnutrition. */
export declare function mapWhoEdemaNutritionalStatus(bilateralPittingEdema: boolean): WhoNutritionalStatusResult | null;
export declare function indicatorResultFromWhoStatus(indicator: string, ns: WhoNutritionalStatusResult, zScore?: number | null, percentile?: number | null): IndicatorResult;
//# sourceMappingURL=nutritional-status.d.ts.map