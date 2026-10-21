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
});
