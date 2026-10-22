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
