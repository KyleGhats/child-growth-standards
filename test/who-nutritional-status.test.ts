import { describe, expect, it } from "vitest";
import { FIVE_YEARS_DAYS } from "../src/age.js";
import {
  mapWhoEdemaNutritionalStatus,
  mapWhoMuacNutritionalStatus,
  mapWhoNutritionalStatus,
} from "../src/who/nutritional-status.js";

describe("mapWhoNutritionalStatus boundaries", () => {
  const underFive = FIVE_YEARS_DAYS - 1;
  const schoolAge = 365 * 10;

  it("WFA 0–5: moderately underweight at z = -2.5", () => {
    const r = mapWhoNutritionalStatus("wfa", -2.5, underFive);
    expect(r.nutritionalStatus).toBe("Moderately underweight");
    expect(r.nutritionalStatusCode).toBe("MOD_UW");
  });

  it("WFA 0–5: normal at z = -2", () => {
    const r = mapWhoNutritionalStatus("wfa", -2, underFive);
    expect(r.nutritionalStatus).toBe("Normal");
    expect(r.nutritionalStatusCode).toBe("N");
  });

  it("HFA 0–5: moderately stunted at z = -2", () => {
    const r = mapWhoNutritionalStatus("lhfa", -2, underFive);
    expect(r.nutritionalStatus).toContain("Moderately stunted");
    expect(r.nutritionalStatusCode).toBe("MOD_ST");
  });

  it("WFL 0–5: overweight at z = 2.5", () => {
    const r = mapWhoNutritionalStatus("wfl", 2.5, underFive);
    expect(r.nutritionalStatus).toBe("Overweight");
    expect(r.nutritionalStatusCode).toBe("OW");
  });

  it("WFL 0–5: risk of overweight at z = 1.5", () => {
    const r = mapWhoNutritionalStatus("wfl", 1.5, underFive);
    expect(r.nutritionalStatus).toBe("Risk of overweight");
    expect(r.nutritionalStatusCode).toBe("RISK_OW");
  });

  it("WFL 0–5: MAM/SAM acute labels on wasting bands", () => {
    const mam = mapWhoNutritionalStatus("wfl", -2.5, underFive);
    expect(mam.nutritionalStatus).toBe("Moderately wasted");
    expect(mam.acuteMalnutritionStatus).toBe("Moderate acute malnutrition");
    expect(mam.acuteMalnutritionStatusCode).toBe("MAM");

    const sam = mapWhoNutritionalStatus("wfl", -3.5, underFive);
    expect(sam.nutritionalStatus).toBe("Severely wasted");
    expect(sam.acuteMalnutritionStatusCode).toBe("SAM");
  });

  it("MUAC Table 1 cutoffs at 24 completed months", () => {
    expect(mapWhoMuacNutritionalStatus(11, 24)?.acuteMalnutritionStatusCode).toBe("SAM");
    expect(mapWhoMuacNutritionalStatus(12, 24)?.acuteMalnutritionStatusCode).toBe("MAM");
    expect(mapWhoMuacNutritionalStatus(13, 24)?.nutritionalStatusCode).toBe("N");
    expect(mapWhoMuacNutritionalStatus(11, 5)).toBeNull();
  });

  it("bilateral pitting oedema → SAM", () => {
    const r = mapWhoEdemaNutritionalStatus(true);
    expect(r?.acuteMalnutritionStatusCode).toBe("SAM");
    expect(r?.nutritionalStatusCode).toBe("SAM");
  });

  it("BFA 5–19: overweight at z = 1.5", () => {
    const r = mapWhoNutritionalStatus("bfa", 1.5, schoolAge);
    expect(r.nutritionalStatus).toBe("Overweight");
    expect(r.reference).toBe("who-growth-ref-5-19");
  });

  it("BFA 5–19: obesity at z = 2.01", () => {
    const r = mapWhoNutritionalStatus("bfa", 2.01, schoolAge);
    expect(r.nutritionalStatus).toBe("Obesity");
    expect(r.nutritionalStatusCode).toBe("OB");
  });

  it("HFA 5–19: moderate stunting at z = -2", () => {
    const r = mapWhoNutritionalStatus("hfa", -2, schoolAge);
    expect(r.nutritionalStatus).toBe("Moderate stunting");
    expect(r.nutritionalStatusCode).toBe("MOD_ST");
  });
});
