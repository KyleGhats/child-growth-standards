import { describe, expect, it } from "vitest";
import { ageInCompletedMonths, ageInDays } from "../src/age.js";

describe("age", () => {
  it("computes completed months like calendar months", () => {
    const dob = new Date(2024, 0, 15);
    const dom = new Date(2024, 6, 14);
    expect(ageInCompletedMonths(dob, dom)).toBe(5);
    expect(ageInCompletedMonths(dob, new Date(2024, 6, 15))).toBe(6);
  });

  it("computes age in days", () => {
    const dob = new Date(2024, 0, 1);
    const dom = new Date(2025, 0, 1);
    expect(ageInDays(dob, dom)).toBe(366);
  });
});
