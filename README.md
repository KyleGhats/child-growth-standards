# child-growth-standards

JavaScript library for pediatric anthropometry using two Philippine/nutrition workflows in one API:

| Mode | `standard` | What it computes |
|------|------------|------------------|
| **NNC (eOPT-style)** | `"nnc"` | **Nutritional status** from age-in-**months** cutoff tables (weight-for-age, length/height-for-age, weight-for-length/height). No z-scores. |
| **WHO LMS** | `"who"` | **Z-scores**, percentiles, and **nutritional status** from bundled WHO reference tables and published z-score cutoffs. |

Zero runtime dependencies. Works in Node.js and bundlers that support ES modules.

## Install

```bash
npm install child-growth-standards
```

## Quick start

```ts
import { calculateAll } from "child-growth-standards";

const assessment = await calculateAll({
  standard: "nnc", // or "who"
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

## Migration (0.1.0 → 0.2.0)

- `standard: "doh"` → **`"nnc"`**
- `result.status` → **`nutritionalStatus`**
- `result.statusCode` → **`nutritionalStatusCode`**
- New optional **`sdBand`** on each indicator (SD-range hint for display)
- Export **`mapWhoNutritionalStatus`** replaces **`mapWhoClassification`**

## Choosing NNC vs WHO

### NNC (`standard: "nnc"`)

- Age for WFA and length/height-for-age: **completed calendar months** (same idea as Excel `DATEDIF(..., "m")`), with tables through **71 completed months**.
- Weight-for-**length** applies below **24 months**; weight-for-**height** from **24 up to 59 months** (by month index at measurement). From **0.2.5**, if age would use WFH but measured length/height is **below 65 cm** (NNC WFH table minimum), classification uses the **WFL** table instead.
- Each indicator returns **`nutritionalStatus`**, **`nutritionalStatusCode`** (e.g. SUW, UW, N, OW, SSt, St, SW, MW, Ob), and **`sdBand`**. **`zScore` is always `null`**.
- WFL/WFH wasting (**`MW`** / **`SW`**) also includes **`acuteMalnutritionStatus`** and **`acuteMalnutritionStatusCode`** (`MAM` / `SAM`), with eOPT labels unchanged.

### WHO (`standard: "who"`)

- Under **5 years**: age-indexed indicators default to **`ageInDays`** on the LMS tables.
- Optional **`whoAgeIndex: "months"`** uses month-indexed tables for 0–5 (for comparison with month-based tools).
- **5–19 years**: height-for-age and BMI-for-age use month-indexed WHO 2007 reference; weight-for-age applies in the 5–10 year band where tables exist.
- From **0.2.5**, acute wasting uses **weight-for-length** when age is under 24 months **or** length/height is **below 65 cm** (WHO WFH tables start at 65 cm); otherwise **weight-for-height** through 5 years. Helpers: `resolveWhoWflWfhIndicator`, `WHO_WFH_MIN_LENGTH_CM`.
- Returns **`zScore`**, **`percentile`**, **`nutritionalStatus`**, **`nutritionalStatusCode`**, and **`sdBand`** per indicator.

### WHO nutritional status references

| Age | Source |
|-----|--------|
| Birth–5 years | [WHO IMCI Table 1 (NBK487900)](https://www.ncbi.nlm.nih.gov/books/NBK487900/table/fm.s1.t1/) — underweight, stunting, wasting (with **MAM/SAM** on WFL/WFH/BMI-for-age wasting bands), overweight/obesity; optional **MUAC** (6–59 completed months, &lt;11.5 / 11.5–&lt;12.5 cm) and **bilateral pitting oedema** (SAM) |
| 5–19 years | [WHO BMI-for-age (5–19)](https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age) — thinness, normal weight, overweight, obesity; height-for-age stunting |

Head circumference-for-age uses WHO chart bands (below / normal / above expected), not Table 1.

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

Optional **head circumference**, **MUAC (cm)**, and **bilateral pitting oedema** (WHO only, when provided):

```ts
await calculateAll({
  standard: "who",
  sex: "male",
  dateOfBirth: "2024-06-01",
  dateOfMeasurement: "2025-06-01",
  weightKg: 9.5,
  lengthHeightCm: 75,
  headCircumferenceCm: 46,
  muacCm: 12.1,
  bilateralPittingEdema: false,
});
```

Wasting indicators also expose **`acuteMalnutritionStatus`** / **`acuteMalnutritionStatusCode`** (`MAM` / `SAM`) alongside the legacy “moderately/severely wasted” labels. MUAC and oedema appear as extra results: `mid-upper-arm-circumference`, `bilateral-pitting-oedema`.

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
// { indicator, zScore, nutritionalStatus, nutritionalStatusCode, sdBand, percentile }
```

Indicators: `weight-for-age`, `length-height-for-age`, `bmi-for-age`, `head-circumference-for-age`, `weight-for-length`, `weight-for-height`.

`calculateZScore` with `standard: "nnc"` returns `null` (NNC is cutoff classification only, via `calculateAll`).

## Result shape

```ts
type AssessmentResult = {
  standard: "nnc" | "who";
  ageDays: number;
  ageMonthsCompleted: number;
  results: Array<{
    indicator: string;
    zScore: number | null;
    nutritionalStatus: string;
    nutritionalStatusCode?: string;
    sdBand?: string;
    percentile?: number | null; // WHO only
  }>;
};
```

## Other exports

Age helpers, LMS utilities, WHO nutritional status mapping, and TypeScript types:

```ts
import {
  ageInDays,
  ageInCompletedMonths,
  mapWhoNutritionalStatus,
  resolveWhoWflWfhIndicator,
  WHO_WFH_MIN_LENGTH_CM,
  type CalculateAllInput,
  type GrowthStandard,
  type WhoNutritionalStatusResult,
} from "child-growth-standards";
```

## Disclaimer

This library **computes reference-based metrics and labels**. It does not diagnose disease. Clinical interpretation belongs to qualified staff. Reference data sources are described in [DATA_PROVENANCE.md](DATA_PROVENANCE.md).

## License

MIT — see [LICENSE](LICENSE).
