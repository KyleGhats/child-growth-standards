export type GrowthStandard = "doh" | "who";

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

export type IndicatorResult = {
  indicator: string;
  zScore: number | null;
  status: string;
  statusCode?: string;
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
