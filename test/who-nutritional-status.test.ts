import { describe, expect, it } from "vitest";
import { FIVE_YEARS_DAYS } from "../src/age.js";
import { mapWhoNutritionalStatus } from "../src/who/nutritional-status.js";

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
