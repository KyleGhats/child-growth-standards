import type { DohBandRow } from "../types.js";

export type NncClassification = {
  code: string;
  label: string;
  sdBand: string;
};

function nncSdBandFromCode(code: string): string {
  const map: Record<string, string> = {
    SUW: "< −3 SD",
    UW: "< −2 SD",
    N: "−2 SD to +2 SD",
    OW: "> +2 SD",
    SSt: "< −3 SD",
    St: "< −2 SD",
    T: "> +2 SD",
    SW: "< −3 SD",
    MW: "< −2 SD",
    Ob: "> +2 SD",
  };
  return map[code] ?? "";
}

function withSdBand(code: string, label: string): NncClassification {
  return { code, label, sdBand: nncSdBandFromCode(code) };
}

function band(bands: Record<string, number>, ...keys: string[]): number | undefined {
  for (const k of Object.keys(bands)) {
    for (const needle of keys) {
      if (k.toLowerCase().includes(needle.toLowerCase())) return bands[k];
    }
  }
  return undefined;
}

export function classifyDohWfa(weightKg: number, row: DohBandRow): NncClassification {
  const b = row.bands;
  const uwFrom = band(b, "underweight from");
  const uwTo = band(b, "underweight to");
  const normalFrom = band(b, "normal from");
  const normalTo = band(b, "normal to");
  const ow = band(b, "overweight");

  if (uwFrom != null && weightKg < uwFrom) {
    return withSdBand("SUW", "Severely Underweight");
  }
  if (uwFrom != null && uwTo != null && weightKg >= uwFrom && weightKg < uwTo) {
    return withSdBand("UW", "Underweight");
  }
  if (normalFrom != null && normalTo != null && weightKg >= normalFrom && weightKg <= normalTo) {
    return withSdBand("N", "Normal");
  }
  if (ow != null && weightKg > normalTo!) {
    return withSdBand("OW", "Overweight");
  }
  return withSdBand("", "");
}

export function classifyDohLhfa(heightCm: number, row: DohBandRow): NncClassification {
  const b = row.bands;
  const stFrom = band(b, "stunted from");
  const stTo = band(b, "stunted to");
  const normalFrom = band(b, "normal from");
  const normalTo = band(b, "normal to");
  const tall = band(b, "tall");

  if (stFrom != null && heightCm < stFrom) {
    return withSdBand("SSt", "Severely Stunted");
  }
  if (stFrom != null && stTo != null && heightCm >= stFrom && heightCm < stTo) {
    return withSdBand("St", "Stunted");
  }
  if (normalFrom != null && normalTo != null && heightCm >= normalFrom && heightCm <= normalTo) {
    return withSdBand("N", "Normal");
  }
  if (tall != null && heightCm > normalTo!) {
    return withSdBand("T", "Tall");
  }
  return withSdBand("", "");
}

export function classifyDohWflh(weightKg: number, row: DohBandRow): NncClassification {
  const b = row.bands;
  const sw = band(b, "severely wasted");
  const mwFrom = band(b, "wasted from");
  const mwTo = band(b, "wasted to");
  const normalFrom = band(b, "normal from");
  const normalTo = band(b, "normal to");
  const owFrom = band(b, "overweight from");
  const owTo = band(b, "overweight to");
  const ob = band(b, "obese");

  if (sw != null && weightKg < sw) return withSdBand("SW", "Severely Wasted");
  if (mwFrom != null && mwTo != null && weightKg >= mwFrom && weightKg < mwTo) {
    return withSdBand("MW", "Moderately Wasted");
  }
  if (normalFrom != null && normalTo != null && weightKg >= normalFrom && weightKg <= normalTo) {
    return withSdBand("N", "Normal");
  }
  if (owFrom != null && owTo != null && weightKg > normalTo! && weightKg <= owTo) {
    return withSdBand("OW", "Overweight");
  }
  if (ob != null && weightKg > owTo!) return withSdBand("Ob", "Obese");
  return withSdBand("", "");
}
