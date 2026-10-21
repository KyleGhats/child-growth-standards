# child-growth-standards

JavaScript library for pediatric anthropometry using two Philippine/nutrition workflows in one API:

| Mode | `standard` | What it computes |
|------|------------|------------------|
| **DOH / NNC (eOPT-style)** | `"doh"` | Nutritional **classification** from age-in-**months** cutoff tables (weight-for-age, length/height-for-age, weight-for-length/height). No z-scores. |
| **WHO LMS** | `"who"` | **Z-scores**, percentiles, and WHO-style **classifications** from bundled reference tables. |

Zero runtime dependencies. Works in Node.js and bundlers that support ES modules.

## Install

```bash
npm install child-growth-standards
```

## Quick start

```ts
import { calculateAll } from "child-growth-standards";

const assessment = await calculateAll({
  standard: "doh", // or "who"
  sex: "male", // or "female"
  dateOfBirth: "2023-06-15",
  dateOfMeasurement: "2024-06-15",
  weightKg: 8.2,
  lengthHeightCm: 72,
});

console.log(assessment.ageDays);
console.log(assessment.ageMonthsCompleted);
console.log(assessment.results);
```

Use **`YYYY-MM-DD`** strings or `Date` values for birth and measurement dates (calendar dates, not timestamps with timezone surprises).

## Choosing DOH vs WHO

### DOH (`standard: "doh"`)

- Age for WFA and length/height-for-age: **completed calendar months** (same idea as Excel `DATEDIF(..., "m")`).
- Weight-for-**length** applies below **24 months**; weight-for-**height** from **24 up to 59 months** (by month index at measurement).
- Each indicator returns **`status`** / **`statusCode`** (e.g. SUW, UW, N, OW, SSt, St, SW, MW, Ob). **`zScore` is always `null`**.

### WHO (`standard: "who"`)

- Under **5 years**: age-indexed indicators default to **`ageInDays`** on the LMS tables.
- Optional **`whoAgeIndex: "months"`** uses month-indexed tables for 0–5 (for comparison with month-based tools).
- **5–19 years**: height-for-age and BMI-for-age use month-indexed WHO 2007 reference; weight-for-age applies in the 5–10 year band where tables exist.
- Returns **`zScore`**, **`percentile`**, and **`status`** per indicator.

```ts
await calculateAll({
  standard: "who",
  sex: "female",
  dateOfBirth: "2024-01-01",
  dateOfMeasurement: "2024-07-01",
  weightKg: 7,
  lengthHeightCm: 65,
  whoAgeIndex: "days", // default; use "months" for 0–5 if needed
});
```

Optional **head circumference** (WHO only, when provided):

```ts
await calculateAll({
  standard: "who",
  sex: "male",
  dateOfBirth: "2024-06-01",
  dateOfMeasurement: "2025-06-01",
  weightKg: 9.5,
  lengthHeightCm: 75,
  headCircumferenceCm: 46,
});
```

## Single indicator (WHO only)

```ts
import { calculateZScore } from "child-growth-standards";

const wfa = await calculateZScore({
  standard: "who",
  indicator: "weight-for-age",
  sex: "male",
  dateOfBirth: "2023-06-15",
  dateOfMeasurement: "2024-06-14",
  weightKg: 9.5,
  lengthHeightCm: 75,
});
// { indicator, zScore, status, percentile }
```

Indicators: `weight-for-age`, `length-height-for-age`, `bmi-for-age`, `head-circumference-for-age`, `weight-for-length`, `weight-for-height`.

`calculateZScore` with `standard: "doh"` returns `null` (DOH is cutoff classification only, via `calculateAll`).

## Result shape

```ts
type AssessmentResult = {
  standard: "doh" | "who";
  ageDays: number;
  ageMonthsCompleted: number;
  results: Array<{
    indicator: string;
    zScore: number | null;
    status: string;
    statusCode?: string; // DOH short codes when applicable
    percentile?: number | null; // WHO only
  }>;
};
```

## Other exports

Age helpers, LMS utilities, and TypeScript types are exported for advanced use:

```ts
import {
  ageInDays,
  ageInCompletedMonths,
  mapWhoClassification,
  type CalculateAllInput,
  type GrowthStandard,
} from "child-growth-standards";
```

## Disclaimer

This library **computes reference-based metrics and labels**. It does not diagnose disease. Clinical interpretation belongs to qualified staff. Reference data sources are described in [DATA_PROVENANCE.md](DATA_PROVENANCE.md).

## License

MIT — see [LICENSE](LICENSE).
