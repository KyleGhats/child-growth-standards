import { FIVE_YEARS_DAYS, daysToMonths } from "../age.js";
import type { Sex, WhoAgeIndex } from "../types.js";
import { loadWhoJson } from "./load-tables.js";

export type WhoIndicator =
  | "wfa"
  | "lhfa"
  | "hfa"
  | "bfa"
  | "hcfa"
  | "wfl"
  | "wfh";

export function whoTableFile(
  indicator: WhoIndicator,
  sex: Sex,
  ageInDays: number,
  whoAgeIndex: WhoAgeIndex,
): { file: string; index: number } | null {
  const sexKey = sex === "male" ? "boys" : "girls";
  const under5 = ageInDays <= FIVE_YEARS_DAYS;
  const months = daysToMonths(ageInDays);

  switch (indicator) {
    case "wfa":
      if (under5) {
        const suffix = whoAgeIndex === "months" ? "0-5-months" : "0-5-days";
        return {
          file: `wfa-${sexKey}-${suffix}.json`,
          index: whoAgeIndex === "months" ? Math.floor(months) : ageInDays,
        };
      }
      if (months > 120) return null;
      return { file: `wfa-${sexKey}-5-10-months.json`, index: months };
    case "lhfa":
      if (under5) {
        const suffix = whoAgeIndex === "months" ? "0-5-months" : "0-5-days";
        return {
          file: `lhfa-${sexKey}-${suffix}.json`,
          index: whoAgeIndex === "months" ? months : ageInDays,
        };
      }
      if (months > 228) return null;
      return { file: `hfa-${sexKey}-5-19-months.json`, index: months };
    case "hfa":
      if (!under5) {
        if (months > 228) return null;
        return { file: `hfa-${sexKey}-5-19-months.json`, index: months };
      }
      return null;
    case "bfa":
      if (under5) {
        const suffix = whoAgeIndex === "months" ? "0-5-months" : "0-5-days";
        return {
          file: `bfa-${sexKey}-${suffix}.json`,
          index: whoAgeIndex === "months" ? months : ageInDays,
        };
      }
      if (months > 228) return null;
      return { file: `bfa-${sexKey}-5-19-months.json`, index: months };
    case "hcfa":
      if (ageInDays > FIVE_YEARS_DAYS) return null;
      {
        const suffix = whoAgeIndex === "months" ? "0-5-months" : "0-5-days";
        return {
          file: `hcfa-${sexKey}-${suffix}.json`,
          index: whoAgeIndex === "months" ? months : ageInDays,
        };
      }
    case "wfl":
      return {
        file: whoAgeIndex === "months" ? `wfl-${sexKey}-months.json` : `wfl-${sexKey}-days.json`,
        index: 0,
      };
    case "wfh":
      if (ageInDays < 731) return null;
      return { file: `wfh-${sexKey}-months.json`, index: 0 };
    default:
      return null;
  }
}

export function resolveWhoLms(
  indicator: WhoIndicator,
  sex: Sex,
  ageInDays: number,
  whoAgeIndex: WhoAgeIndex,
  lengthHeightCm?: number,
) {
  const resolved = whoTableFile(indicator, sex, ageInDays, whoAgeIndex);
  if (!resolved) return null;
  const table = loadWhoJson(resolved.file);
  let index = resolved.index;
  if (indicator === "wfl" || indicator === "wfh") {
    if (lengthHeightCm == null) return null;
    index = lengthHeightCm;
  }
  return { table: table.rows, index };
}
