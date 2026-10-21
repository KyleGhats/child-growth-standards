import { FIVE_YEARS_DAYS } from "../age.js";
import type { WhoNutritionalStatusReference, WhoNutritionalStatusResult } from "../types.js";

export type WhoIndicatorKind = "wfa" | "hfa" | "lhfa" | "wfl" | "wfh" | "bfa" | "hcfa";

function normalizeKind(kind: WhoIndicatorKind): WhoIndicatorKind {
  if (kind === "wfh") return "wfl";
  if (kind === "lhfa") return "hfa";
  return kind;
}

function result(
  nutritionalStatus: string,
  nutritionalStatusCode: string,
  sdBand: string,
  reference: WhoNutritionalStatusReference,
): WhoNutritionalStatusResult {
  return { nutritionalStatus, nutritionalStatusCode, sdBand, reference };
}

function whoSdBand(
  z: number,
  kind: WhoIndicatorKind,
  underFive: boolean,
): string {
  if (kind === "hcfa") {
    if (z < -2) return "< −2 SD";
    if (z <= 2) return "−2 SD to +2 SD";
    return "> +2 SD";
  }

  if (kind === "hfa" && !underFive) {
    if (z < -3) return "< −3 SD";
    if (z <= -2) return "−3 SD to −2 SD";
    if (z <= 3) return "−2 SD to +2 SD";
    return "> +3 SD";
  }

  if (kind === "hfa" && underFive) {
    if (z < -3) return "< −3 SD";
    if (z <= -2) return "−3 SD to −2 SD";
    return "−2 SD to +2 SD";
  }

  if (kind === "bfa" && !underFive) {
    if (z < -3) return "< −3 SD";
    if (z < -2) return "−3 SD to −2 SD";
    if (z <= 1) return "−2 SD to +1 SD";
    if (z <= 2) return "+1 SD to +2 SD";
    return "> +2 SD";
  }

  if (kind === "wfl" || kind === "wfh" || (kind === "bfa" && underFive)) {
    if (z < -3) return "< −3 SD";
    if (z <= -2) return "−3 SD to −2 SD";
    if (z <= 1) return "−2 SD to +1 SD";
    if (z <= 2) return "+1 SD to +2 SD";
    if (z <= 3) return "+2 SD to +3 SD";
    return "> +3 SD";
  }

  if (kind === "wfa") {
    if (z < -3) return "< −3 SD";
    if (z < -2) return "−3 SD to −2 SD";
    if (z <= 1) return "−2 SD to +1 SD";
    return "> +1 SD";
  }

  return "";
}

function mapWfaUnderFive(z: number): WhoNutritionalStatusResult {
  const ref = "who-imci-table1-0-5" as const;
  if (z < -3) {
    return result("Severely underweight", "SEV_UW", "< −3 SD", ref);
  }
  if (z < -2) {
    return result("Moderately underweight", "MOD_UW", "−3 SD to −2 SD", ref);
  }
  return result("Normal", "N", "−2 SD to +1 SD", ref);
}

function mapWfaFiveToTen(z: number): WhoNutritionalStatusResult {
  const ref = "who-growth-ref-5-19" as const;
  if (z < -3) {
    return result("Severe underweight", "SEV_UW", "< −3 SD", ref);
  }
  if (z < -2) {
    return result("Moderate underweight", "MOD_UW", "−3 SD to −2 SD", ref);
  }
  return result("Normal", "N", "−2 SD to +1 SD", ref);
}

function mapHfaUnderFive(z: number): WhoNutritionalStatusResult {
  const ref = "who-imci-table1-0-5" as const;
  if (z < -3) {
    return result(
      "Severely stunted (severe chronic malnutrition)",
      "SEV_ST",
      "< −3 SD",
      ref,
    );
  }
  if (z <= -2) {
    return result(
      "Moderately stunted (moderate chronic malnutrition)",
      "MOD_ST",
      "−3 SD to −2 SD",
      ref,
    );
  }
  return result("Normal", "N", "−2 SD to +2 SD", ref);
}

function mapHfaFiveToNineteen(z: number): WhoNutritionalStatusResult {
  const ref = "who-growth-ref-5-19" as const;
  if (z < -3) {
    return result("Severe stunting", "SEV_ST", "< −3 SD", ref);
  }
  if (z <= -2) {
    return result("Moderate stunting", "MOD_ST", "−3 SD to −2 SD", ref);
  }
  if (z <= 3) {
    return result("Normal", "N", "−2 SD to +2 SD", ref);
  }
  return result("Tall", "TALL", "> +3 SD", ref);
}

function mapWflUnderFive(z: number): WhoNutritionalStatusResult {
  const ref = "who-imci-table1-0-5" as const;
  if (z < -3) {
    return result("Severely wasted", "SEV_W", "< −3 SD", ref);
  }
  if (z <= -2) {
    return result("Moderately wasted", "MOD_W", "−3 SD to −2 SD", ref);
  }
  if (z <= 1) {
    return result("Normal", "N", "−2 SD to +1 SD", ref);
  }
  if (z <= 2) {
    return result("Risk of overweight", "RISK_OW", "+1 SD to +2 SD", ref);
  }
  if (z <= 3) {
    return result("Overweight", "OW", "+2 SD to +3 SD", ref);
  }
  return result("Obese", "OB", "> +3 SD", ref);
}

function mapBfaUnderFive(z: number): WhoNutritionalStatusResult {
  return mapWflUnderFive(z);
}

function mapBfaFiveToNineteen(z: number): WhoNutritionalStatusResult {
  const ref = "who-growth-ref-5-19" as const;
  if (z < -3) {
    return result("Severe thinness", "SEV_THIN", "< −3 SD", ref);
  }
  if (z < -2) {
    return result("Thinness", "THIN", "−3 SD to −2 SD", ref);
  }
  if (z <= 1) {
    return result("Normal weight", "N", "−2 SD to +1 SD", ref);
  }
  if (z <= 2) {
    return result("Overweight", "OW", "+1 SD to +2 SD", ref);
  }
  return result("Obesity", "OB", "> +2 SD", ref);
}

function mapHcfa(z: number): WhoNutritionalStatusResult {
  const ref = "who-imci-table1-0-5" as const;
  if (z < -2) {
    return result("Below expected", "HCFA_LOW", "< −2 SD", ref);
  }
  if (z <= 2) {
    return result("Normal", "HCFA_N", "−2 SD to +2 SD", ref);
  }
  return result("Above expected", "HCFA_HIGH", "> +2 SD", ref);
}

export function mapWhoNutritionalStatus(
  indicatorKind: WhoIndicatorKind,
  zScore: number,
  ageInDays: number,
): WhoNutritionalStatusResult {
  const z = Number(zScore);
  if (!Number.isFinite(z)) {
    return result("", "", "", "who-imci-table1-0-5");
  }

  const kind = normalizeKind(indicatorKind);
  const underFive = ageInDays <= FIVE_YEARS_DAYS;

  if (kind === "hcfa") {
    return mapHcfa(z);
  }

  if (kind === "wfa") {
    const mapped = underFive ? mapWfaUnderFive(z) : mapWfaFiveToTen(z);
    return { ...mapped, sdBand: whoSdBand(z, "wfa", underFive) };
  }

  if (kind === "hfa") {
    const mapped = underFive ? mapHfaUnderFive(z) : mapHfaFiveToNineteen(z);
    return { ...mapped, sdBand: whoSdBand(z, "hfa", underFive) };
  }

  if (kind === "wfl") {
    const mapped = mapWflUnderFive(z);
    return { ...mapped, sdBand: whoSdBand(z, "wfl", true) };
  }

  if (kind === "bfa") {
    const mapped = underFive ? mapBfaUnderFive(z) : mapBfaFiveToNineteen(z);
    return { ...mapped, sdBand: whoSdBand(z, "bfa", underFive) };
  }

  return result("", "", "", underFive ? "who-imci-table1-0-5" : "who-growth-ref-5-19");
}
