import { describe, expect, it } from "vitest";

describe("browser bundle", () => {
  it("runPediatricGrowthRequest compare mode (static SPA entry)", async () => {
    const { runPediatricGrowthRequest } = await import("../dist/browser.mjs");

    const result = await runPediatricGrowthRequest({
      mode: "compare",
      sex: "male",
      dateOfBirth: "2024-04-01",
      dateOfMeasurement: "2026-09-24",
      weightKg: 4.6,
      lengthHeightCm: 50,
    });

    expect(result.mode).toBe("compare");
    if (result.mode !== "compare") return;
    expect(result.ageDays).toBe(906);
    expect(result.whoDays.results.some((r) => r.indicator === "weight-for-length")).toBe(true);
  });
});
