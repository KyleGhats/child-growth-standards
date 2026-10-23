export type GrowthStandard = "nnc" | "who";

export type Sex = "male" | "female";

export type WhoAgeIndex = "days" | "months";

export type CalculateAllInput = {
  standard: GrowthStandard;
  sex: Sex;
  dateOfBirth: Date | string;
  dateOfMeasurement: Date | string;
  weightKg: number;
  lengthHeightCm: number;
  headCircumferenceCm?: number;
  /** WHO only: mid-upper arm circumference in cm (IMCI Table 1 SAM/MAM cutoffs use mm internally). */
  muacCm?: number;
  /** WHO only: bilateral pitting oedema → severe acute malnutrition (Table 1). */
  bilateralPittingEdema?: boolean;
  /** WHO only: age index for 0–5 age-based indicators. Default `days`. */
  whoAgeIndex?: WhoAgeIndex;
};

export type CalculateZScoreInput = CalculateAllInput & {
  indicator:
    | "weight-for-age"
    | "length-height-for-age"
    | "bmi-for-age"
    | "head-circumference-for-age"
    | "weight-for-length"
    | "weight-for-height";
  measurement?: number;
};

export type WhoNutritionalStatusReference = "who-imci-table1-0-5" | "who-growth-ref-5-19";

export type WhoNutritionalStatusResult = {
  nutritionalStatus: string;
  nutritionalStatusCode: string;
  sdBand: string;
  reference: WhoNutritionalStatusReference;
  /** Table 1 MAM/SAM when anthropometric wasting or MUAC/edema applies. */
  acuteMalnutritionStatus?: string;
  acuteMalnutritionStatusCode?: string;
};

export type IndicatorResult = {
  indicator: string;
  zScore: number | null;
  nutritionalStatus: string;
  nutritionalStatusCode?: string;
  sdBand?: string;
  acuteMalnutritionStatus?: string;
  acuteMalnutritionStatusCode?: string;
  percentile?: number | null;
};

export type AssessmentResult = {
  standard: GrowthStandard;
  ageDays: number;
  ageMonthsCompleted: number;
  results: IndicatorResult[];
};

export type LmsRow = { age: number; L: number; M: number; S: number };

export type DohBandRow = {
  index: number;
  bands: Record<string, number>;
};
