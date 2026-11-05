import { NINETEEN_YEARS_DAYS } from "./age.js";
import { calculateAll, calculateZScore } from "./calculate.js";
import { NNC_EXCLUSIVE_MAX_COMPLETED_MONTHS } from "./doh/calculate-doh.js";
import type {
  AssessmentResult,
  CalculateAllInput,
  CalculateZScoreInput,
  IndicatorResult,
  Sex,
} from "./types.js";

const VALID_MODES = new Set(["all", "zscore", "compare"]);
const VALID_STANDARDS = new Set(["nnc", "who"]);
const VALID_INDICATORS = new Set([
  "weight-for-age",
  "length-height-for-age",
  "bmi-for-age",
  "head-circumference-for-age",
  "weight-for-length",
  "weight-for-height",
]);

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

export type PediatricGrowthRequestResult =
  | PediatricGrowthCompareResult
  | PediatricGrowthAllResult
  | PediatricGrowthZScoreResult;

function fail(message: string): never {
  throw new Error(message);
}

function mapSexInput(sex: unknown): Sex | null {
  if (sex === "male" || sex === "female") return sex;
  const normalized = String(sex ?? "")
    .trim()
    .toUpperCase();
  if (normalized === "MALE" || normalized === "M") return "male";
  if (normalized === "FEMALE" || normalized === "F") return "female";
  return null;
}

function parseNumber(value: unknown, fieldName: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    fail(`${fieldName} must be a number`);
  }
  return n;
}

/** Parse YYYY-MM-DD as a local calendar date string for CGS. */
function parseCalendarDate(value: unknown, fieldName: string): string {
  const text = String(value ?? "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    fail(`${fieldName} must be a calendar date (YYYY-MM-DD)`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    fail(`${fieldName} is not a valid calendar date`);
  }
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/** BMRS-shaped API: compare / all / zscore without HTTP. Safe for static SPA (no Node). */
export async function runPediatricGrowthRequest(
  body: PediatricGrowthRequestBody,
): Promise<PediatricGrowthRequestResult> {
  if (!body || typeof body !== "object") {
    fail("Invalid request body");
  }

  const mode = body.mode ?? "all";
  if (!VALID_MODES.has(mode)) {
    fail("Invalid mode");
  }

  const sex = mapSexInput(body.sex);
  if (!sex) {
    fail("Valid sex is required");
  }

  if (!body.dateOfBirth || !body.dateOfMeasurement) {
    fail("dateOfBirth and dateOfMeasurement are required");
  }

  const weightKg = parseNumber(body.weightKg, "weightKg");
  const lengthHeightCm = parseNumber(body.lengthHeightCm, "lengthHeightCm");

  const dateOfBirth = parseCalendarDate(body.dateOfBirth, "dateOfBirth");
  const dateOfMeasurement = parseCalendarDate(body.dateOfMeasurement, "dateOfMeasurement");

  const sharedMeasurements: Omit<CalculateAllInput, "standard"> = {
    sex,
    dateOfBirth,
    dateOfMeasurement,
    weightKg,
    lengthHeightCm,
    ...(body.headCircumferenceCm != null && body.headCircumferenceCm !== ""
      ? { headCircumferenceCm: parseNumber(body.headCircumferenceCm, "headCircumferenceCm") }
      : {}),
    ...(body.muacCm != null && body.muacCm !== ""
      ? { muacCm: parseNumber(body.muacCm, "muacCm") }
      : {}),
    ...(body.bilateralPittingEdema === true || body.bilateralPittingEdema === "true"
      ? { bilateralPittingEdema: true }
      : {}),
  };

  if (mode === "compare") {
    const whoDays = await calculateAll({
      ...sharedMeasurements,
      standard: "who",
      whoAgeIndex: "days",
    });

    const { ageDays, ageMonthsCompleted } = whoDays;

    if (ageDays > NINETEEN_YEARS_DAYS) {
      fail("Growth comparison applies from birth through 19 years.");
    }

    const whoMonths = await calculateAll({
      ...sharedMeasurements,
      standard: "who",
      whoAgeIndex: "months",
    });

    let nnc: AssessmentResult | null = null;
    if (ageMonthsCompleted < NNC_EXCLUSIVE_MAX_COMPLETED_MONTHS) {
      nnc = await calculateAll({
        ...sharedMeasurements,
        standard: "nnc",
      });
    }

    return {
      mode: "compare",
      ageDays,
      ageMonthsCompleted,
      whoDays,
      whoMonths,
      nnc,
    };
  }

  let standard = body.standard ?? "who";
  if (standard === "doh") standard = "nnc";
  if (!VALID_STANDARDS.has(standard)) {
    fail("Invalid standard");
  }

  const baseInput: CalculateAllInput = {
    ...sharedMeasurements,
    standard: standard as "who" | "nnc",
    ...(body.whoAgeIndex === "days" || body.whoAgeIndex === "months"
      ? { whoAgeIndex: body.whoAgeIndex }
      : {}),
  };

  if (mode === "zscore") {
    if (!body.indicator || !VALID_INDICATORS.has(body.indicator)) {
      fail("Valid indicator is required");
    }
    const indicator = body.indicator as CalculateZScoreInput["indicator"];
    const result = await calculateZScore({
      ...baseInput,
      indicator,
      ...(body.measurement != null && body.measurement !== ""
        ? { measurement: parseNumber(body.measurement, "measurement") }
        : {}),
    });
    return { mode: "zscore", result };
  }

  const assessment = await calculateAll(baseInput);
  return { mode: "all", assessment };
}

/** @deprecated Use runPediatricGrowthRequest */
export const computePediatricGrowthRequest = runPediatricGrowthRequest;
