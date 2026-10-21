# Data provenance

## NNC (age-in-months cutoffs)

CSV files under `sources/raw/doh/` support Philippine National Nutrition Council (NNC) / eOPT Plus–style band classification. Built JSON is published under **`dist/data/nnc/`**. These are **not** WHO LMS z-score tables.

## WHO Child Growth Standards

Xlsx files under `sources/raw/who/who-standard/` are derived from [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards) reference material (0–5 day/month tables and 5–19 year growth reference). Built JSON lives under **`dist/data/who/`**.

WHO **nutritional status** labels in code follow:

- Birth–5 years: [WHO IMCI Table 1 (NBK487900)](https://www.ncbi.nlm.nih.gov/books/NBK487900/table/fm.s1.t1/)
- 5–19 years: [WHO BMI-for-age (5–19)](https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age) and related height-for-age rules

This package is **independent** and is **not** WHO-certified or endorsed software.

## Code

MIT License — see [LICENSE](LICENSE).
