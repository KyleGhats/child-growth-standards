import { ageInCompletedMonths, ageInDays, FIVE_YEARS_DAYS, resolveDates } from "../age.js";
import { computeZScore, lookupLms, zScoreToPercentile } from "../lms.js";
import type {
  AssessmentResult,
  CalculateAllInput,
  CalculateZScoreInput,
  IndicatorResult,
} from "../types.js";
import {
  indicatorResultFromWhoStatus,
  mapWhoEdemaNutritionalStatus,
  mapWhoMuacNutritionalStatus,
  mapWhoNutritionalStatus,
} from "./nutritional-status.js";
import { resolveWhoLms, type WhoIndicator } from "./resolve-table.js";

const TWENTY_FOUR_MONTHS_DAYS = 731;
/** WHO weight-for-height tables index standing height from 65 cm. */
export const WHO_WFH_MIN_LENGTH_CM = 65;

function rawBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

function indicatorKind(
  api: string,
  ageDays: number,
): "wfa" | "hfa" | "lhfa" | "wfl" | "wfh" | "bfa" | "hcfa" {
  if (api === "weight-for-age") return "wfa";
  if (api === "length-height-for-age") return ageDays > 1856 ? "hfa" : "lhfa";
  if (api === "bmi-for-age") return "bfa";
  if (api === "head-circumference-for-age") return "hcfa";
  if (api === "weight-for-length") return "wfl";
  if (api === "weight-for-height") return "wfh";
  return "wfa";
}

export function resolveWhoWflWfhIndicator(
  ageDays: number,
  lengthHeightCm: number | undefined,
): { tableIndicator: "wfl" | "wfh"; apiIndicator: "weight-for-length" | "weight-for-height" } | null {
  if (lengthHeightCm == null || !Number.isFinite(lengthHeightCm)) return null;
  if (ageDays < TWENTY_FOUR_MONTHS_DAYS || lengthHeightCm < WHO_WFH_MIN_LENGTH_CM) {
    return { tableIndicator: "wfl", apiIndicator: "weight-for-length" };
  }
  if (ageDays <= FIVE_YEARS_DAYS) {
    return { tableIndicator: "wfh", apiIndicator: "weight-for-height" };
  }
  return null;
}

function toWhoIndicator(api: string): WhoIndicator | null {
  switch (api) {
    case "weight-for-age":
      return "wfa";
    case "length-height-for-age":
      return "lhfa";
    case "bmi-for-age":
      return "bfa";
    case "head-circumference-for-age":
      return "hcfa";
    case "weight-for-length":
      return "wfl";
    case "weight-for-height":
      return "wfh";
    default:
      return null;
  }
}

export function calculateWhoZScore(input: CalculateZScoreInput): IndicatorResult | null {
  const dates = resolveDates(input.dateOfBirth, input.dateOfMeasurement);
  if (!dates) return null;
  const days = ageInDays(dates.dateOfBirth, dates.dateOfMeasurement);
  const whoAgeIndex = input.whoAgeIndex ?? "days";
  const wi = toWhoIndicator(input.indicator);
  if (!wi) return null;

  let measurement = input.measurement;
  if (measurement == null) {
    if (wi === "bfa") measurement = rawBmi(input.weightKg, input.lengthHeightCm);
    else if (wi === "wfa") measurement = input.weightKg;
    else if (wi === "lhfa" || wi === "hfa") measurement = input.lengthHeightCm;
    else if (wi === "hcfa") measurement = input.headCircumferenceCm ?? NaN;
    else if (wi === "wfl" || wi === "wfh") measurement = input.weightKg;
  }
  if (measurement == null || !Number.isFinite(measurement)) return null;

  let tableIndicator = wi;
  let apiIndicator = input.indicator;
  if (wi === "wfl" || wi === "wfh") {
    const resolved = resolveWhoWflWfhIndicator(days, input.lengthHeightCm);
    if (!resolved) return null;
    tableIndicator = resolved.tableIndicator;
    apiIndicator = resolved.apiIndicator;
  }

  const lmsRef = resolveWhoLms(tableIndicator, input.sex, days, whoAgeIndex, input.lengthHeightCm);
  if (!lmsRef) return null;
  const lms = lookupLms(lmsRef.table, lmsRef.index);
  if (!lms) return null;
  const z = computeZScore(measurement, lms);
  if (!Number.isFinite(z)) return null;

  const kind = indicatorKind(apiIndicator, days);
  const ns = mapWhoNutritionalStatus(kind, z, days);

  return {
    indicator: apiIndicator,
    zScore: z,
    nutritionalStatus: ns.nutritionalStatus,
    nutritionalStatusCode: ns.nutritionalStatusCode,
    sdBand: ns.sdBand,
    ...(ns.acuteMalnutritionStatus
      ? {
          acuteMalnutritionStatus: ns.acuteMalnutritionStatus,
          acuteMalnutritionStatusCode: ns.acuteMalnutritionStatusCode,
        }
      : {}),
    percentile: zScoreToPercentile(z),
  };
}

export function calculateWhoAll(input: CalculateAllInput): AssessmentResult {
  const dates = resolveDates(input.dateOfBirth, input.dateOfMeasurement);
  if (!dates) {
    return { standard: "who", ageDays: 0, ageMonthsCompleted: 0, results: [] };
  }
  const days = ageInDays(dates.dateOfBirth, dates.dateOfMeasurement);
  const months = ageInCompletedMonths(dates.dateOfBirth, dates.dateOfMeasurement);

  const indicators: CalculateZScoreInput["indicator"][] = [
    "weight-for-age",
    "length-height-for-age",
    "bmi-for-age",
  ];
  if (input.headCircumferenceCm != null) {
    indicators.push("head-circumference-for-age");
  }
  const wflWfh = resolveWhoWflWfhIndicator(days, input.lengthHeightCm);
  if (wflWfh) {
    indicators.push(wflWfh.apiIndicator);
  }

  const results: IndicatorResult[] = [];
  for (const indicator of indicators) {
    const row = calculateWhoZScore({ ...input, indicator });
    if (row) results.push(row);
  }

  if (input.muacCm != null) {
    const muacNs = mapWhoMuacNutritionalStatus(input.muacCm, months);
    if (muacNs) {
      results.push(
        indicatorResultFromWhoStatus("mid-upper-arm-circumference", muacNs),
      );
    }
  }

  if (input.bilateralPittingEdema) {
    const edemaNs = mapWhoEdemaNutritionalStatus(true);
    if (edemaNs) {
      results.push(
        indicatorResultFromWhoStatus("bilateral-pitting-oedema", edemaNs),
      );
    }
  }

  return { standard: "who", ageDays: days, ageMonthsCompleted: months, results };
}
