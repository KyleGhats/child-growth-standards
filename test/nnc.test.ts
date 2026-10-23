import { describe, expect, it } from "vitest";
import { calculateAll } from "../src/calculate.js";

describe("NNC standard", () => {
  it("classifies weight-for-age at 12 months", async () => {
    const result = await calculateAll({
      standard: "nnc",
      sex: "male",
      dateOfBirth: "2023-06-15",
      dateOfMeasurement: "2024-06-15",
      weightKg: 8,
      lengthHeightCm: 72,
    });
    expect(result.standard).toBe("nnc");
    const wfa = result.results.find((r) => r.indicator === "weight-for-age");
    expect(wfa?.zScore).toBeNull();
    expect(wfa?.nutritionalStatusCode).toBeTruthy();
    expect(wfa?.nutritionalStatus).toBeTruthy();
    expect(wfa?.sdBand).toBeTruthy();
  });

  it("returns underweight band for low weight at 0 months", async () => {
    const result = await calculateAll({
      standard: "nnc",
      sex: "male",
      dateOfBirth: "2024-06-01",
      dateOfMeasurement: "2024-06-15",
      weightKg: 2,
      lengthHeightCm: 50,
    });
    const wfa = result.results.find((r) => r.indicator === "weight-for-age");
    expect(wfa?.nutritionalStatusCode).toBe("SUW");
  });

  it("adds MAM/SAM acute fields on NNC wasting (WFL) without changing eOPT labels", async () => {
    const mam = await calculateAll({
      standard: "nnc",
      sex: "male",
      dateOfBirth: "2023-06-15",
      dateOfMeasurement: "2024-06-15",
      weightKg: 7.6,
      lengthHeightCm: 75,
    });
    const wfaUw = mam.results.find((r) => r.indicator === "weight-for-age");
    expect(wfaUw?.nutritionalStatus).toBe("Underweight");
    expect(wfaUw?.nutritionalStatusCode).toBe("UW");

    const wflMam = mam.results.find((r) => r.indicator === "weight-for-length");
    expect(wflMam?.nutritionalStatus).toBe("Moderately Wasted");
    expect(wflMam?.nutritionalStatusCode).toBe("MW");
    expect(wflMam?.acuteMalnutritionStatusCode).toBe("MAM");

    const sam = await calculateAll({
      standard: "nnc",
      sex: "male",
      dateOfBirth: "2023-06-15",
      dateOfMeasurement: "2024-06-15",
      weightKg: 6.5,
      lengthHeightCm: 75,
    });
    const wflSam = sam.results.find((r) => r.indicator === "weight-for-length");
    expect(wflSam?.nutritionalStatus).toBe("Severely Wasted");
    expect(wflSam?.nutritionalStatusCode).toBe("SW");
    expect(wflSam?.acuteMalnutritionStatusCode).toBe("SAM");

    const wfa = sam.results.find((r) => r.indicator === "weight-for-age");
    expect(wfa?.acuteMalnutritionStatusCode).toBeUndefined();
  });

  it("uses weight-for-length when age >= 24 mo but height below WFH minimum", async () => {
    const result = await calculateAll({
      standard: "nnc",
      sex: "male",
      dateOfBirth: "2024-04-01",
      dateOfMeasurement: "2026-09-24",
      weightKg: 4.6,
      lengthHeightCm: 50,
    });
    expect(result.ageMonthsCompleted).toBe(29);
    const wfl = result.results.find((r) => r.indicator === "weight-for-length");
    expect(wfl).toBeDefined();
    expect(wfl?.nutritionalStatusCode).toBeTruthy();
    expect(result.results.some((r) => r.indicator === "weight-for-height")).toBe(false);
  });

  it("classifies WFA and LHFA at 65 completed months without WFH", async () => {
    const result = await calculateAll({
      standard: "nnc",
      sex: "male",
      dateOfBirth: "2020-01-15",
      dateOfMeasurement: "2025-06-15",
      weightKg: 22,
      lengthHeightCm: 110,
    });
    expect(result.ageMonthsCompleted).toBe(65);
    expect(result.results.some((r) => r.indicator === "weight-for-age")).toBe(true);
    expect(result.results.some((r) => r.indicator === "length-height-for-age")).toBe(true);
    expect(result.results.some((r) => r.indicator === "weight-for-height")).toBe(false);
  });
});
