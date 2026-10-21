import { describe, expect, it } from "vitest";
import { calculateAll } from "../src/calculate.js";

describe("DOH standard", () => {
  it("classifies weight-for-age at 12 months", async () => {
    const result = await calculateAll({
      standard: "doh",
      sex: "male",
      dateOfBirth: "2023-06-15",
      dateOfMeasurement: "2024-06-15",
      weightKg: 8,
      lengthHeightCm: 72,
    });
    expect(result.standard).toBe("doh");
    const wfa = result.results.find((r) => r.indicator === "weight-for-age");
    expect(wfa?.zScore).toBeNull();
    expect(wfa?.statusCode).toBeTruthy();
    expect(wfa?.status).toBeTruthy();
  });

  it("returns underweight band for low weight at 0 months", async () => {
    const result = await calculateAll({
      standard: "doh",
      sex: "male",
      dateOfBirth: "2024-06-01",
      dateOfMeasurement: "2024-06-15",
      weightKg: 2,
      lengthHeightCm: 50,
    });
    const wfa = result.results.find((r) => r.indicator === "weight-for-age");
    expect(wfa?.statusCode).toBe("SUW");
  });
});
