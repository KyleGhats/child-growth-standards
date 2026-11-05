import { describe, expect, it } from "vitest";
import { runPediatricGrowthRequest } from "../src/run-pediatric-growth-request.js";

describe("runPediatricGrowthRequest (Node)", () => {
  it("compare mode includes weight-for-length at 29 mo / 50 cm", async () => {
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
    const wfl = result.whoDays.results.find((r) => r.indicator === "weight-for-length");
    expect(wfl).toBeDefined();
  });
});
