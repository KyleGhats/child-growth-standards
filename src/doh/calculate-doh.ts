import { acuteFieldsForNncWastingCode } from "../acute-malnutrition.js";
import { ageInCompletedMonths, ageInDays, resolveDates } from "../age.js";
import type { AssessmentResult, CalculateAllInput, IndicatorResult, Sex } from "../types.js";
import {
  classifyDohLhfa,
  classifyDohWfa,
  classifyDohWflh,
} from "./classify-cutoffs.js";
import { loadDohTable, lookupDohRow, mRoundHalf } from "./load-tables.js";
const TWENTY_FOUR_MONTHS = 24;
const SIXTY_MONTHS = 60;

/** Last month index in bundled NNC WFA/LHFA tables (inclusive). */
export const NNC_MAX_COMPLETED_MONTH_INDEX = 71;
/** Exclusive upper bound for completed months when NNC age tables apply. */
export const NNC_EXCLUSIVE_MAX_COMPLETED_MONTHS = 72;

export function calculateDohAll(input: CalculateAllInput): AssessmentResult {
  const dates = resolveDates(input.dateOfBirth, input.dateOfMeasurement);
  if (!dates) {
    return {
      standard: "nnc",
      ageDays: 0,
      ageMonthsCompleted: 0,
      results: [],
    };
  }

  const days = ageInDays(dates.dateOfBirth, dates.dateOfMeasurement);
  const months = ageInCompletedMonths(dates.dateOfBirth, dates.dateOfMeasurement);
  const sex = input.sex;
  const weight = input.weightKg;
  const height = input.lengthHeightCm;

  const results: IndicatorResult[] = [];

  const wfaRow = lookupDohRow(loadDohTable("wfa", sex), months);
  if (wfaRow) {
    const c = classifyDohWfa(weight, wfaRow);
    results.push({
      indicator: "weight-for-age",
      zScore: null,
      nutritionalStatus: c.label,
      nutritionalStatusCode: c.code,
      sdBand: c.sdBand,
    });
  }

  const lhfaRow = lookupDohRow(loadDohTable("lhfa", sex), months);
  if (lhfaRow) {
    const c = classifyDohLhfa(height, lhfaRow);
    results.push({
      indicator: "length-height-for-age",
      zScore: null,
      nutritionalStatus: c.label,
      nutritionalStatusCode: c.code,
      sdBand: c.sdBand,
    });
  }

  const lengthIndex = mRoundHalf(height);
  const wflIndicator =
    months < TWENTY_FOUR_MONTHS ? "wfl" : months < SIXTY_MONTHS ? "wfh" : null;
  if (wflIndicator) {
    const table = loadDohTable(wflIndicator, sex);
    const row = lookupDohRow(table, lengthIndex);
    if (row) {
      const c = classifyDohWflh(weight, row);
      results.push({
        indicator: wflIndicator === "wfl" ? "weight-for-length" : "weight-for-height",
        zScore: null,
        nutritionalStatus: c.label,
        nutritionalStatusCode: c.code,
        sdBand: c.sdBand,
        ...acuteFieldsForNncWastingCode(c.code),
      });
    }
  }

  return {
    standard: "nnc",
    ageDays: days,
    ageMonthsCompleted: months,
    results,
  };
}

export function isNncGrowthAge(months: number): boolean {
  return months >= 0 && months < NNC_EXCLUSIVE_MAX_COMPLETED_MONTHS;
}

/** @deprecated Use isNncGrowthAge — NNC WFA/LHFA tables run through 71 completed months. */
export function isDohPreschoolAge(months: number): boolean {
  return isNncGrowthAge(months);
}

export function mapSex(input: string): Sex | null {
  const n = String(input ?? "")
    .trim()
    .toUpperCase();
  if (n === "M" || n === "MALE") return "male";
  if (n === "F" || n === "FEMALE") return "female";
  return null;
}
