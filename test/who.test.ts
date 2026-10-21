import { describe, expect, it } from "vitest";
import { calculateAll, calculateZScore } from "../src/calculate.js";

describe("WHO standard", () => {
  it("returns z-score for weight-for-age at 365 days", async () => {
    const row = await calculateZScore({
      standard: "who",
      indicator: "weight-for-age",
      sex: "male",
      dateOfBirth: "2023-06-15",
      dateOfMeasurement: "2024-06-14",
      weightKg: 9.5,
      lengthHeightCm: 75,
    });
    expect(row?.zScore).not.toBeNull();
    expect(Number.isFinite(row!.zScore!)).toBe(true);
    expect(row?.nutritionalStatus).toBeTruthy();
  });

  it("calculateAll includes WFA and LHFA under 5", async () => {
    const result = await calculateAll({
      standard: "who",
      sex: "female",
      dateOfBirth: "2024-01-01",
      dateOfMeasurement: "2024-07-01",
      weightKg: 7,
      lengthHeightCm: 65,
    });
    expect(result.results.some((r) => r.indicator === "weight-for-age")).toBe(true);
    expect(result.results.some((r) => r.indicator === "length-height-for-age")).toBe(true);
  });
});

describe("WHO golden values (from bundled LMS tables)", () => {
  it("WFA male ~365 days, 9.5 kg", async () => {
    const row = await calculateZScore({
      standard: "who",
      indicator: "weight-for-age",
      sex: "male",
      dateOfBirth: "2023-06-15",
      dateOfMeasurement: "2024-06-14",
      weightKg: 9.5,
      lengthHeightCm: 75,
    });
    expect(row?.zScore).toBeCloseTo(-0.13953339918284288, 5);
    expect(row?.nutritionalStatus).toBe("Normal");
    expect(row?.percentile).toBeCloseTo(44.45141779198591, 2);
  });
});
