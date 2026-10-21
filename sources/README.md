# Reference data sources

Raw files are **copied** from the BMRS nutrition data folder (not symlinked).

- `raw/doh/` — DOH / NNC eOPT-style cutoff tables (CSV).
- `raw/who/who-standard/` — WHO LMS expanded tables (xlsx).

Regenerate copies:

```bash
npm run sync:sources
# or BMRS_DATA_DIR=/path/to/egov-bmrs/data npm run sync:sources
```

Build JSON consumed at runtime:

```bash
npm run build:data
```

Output: `dist/data/doh/*.json`, `dist/data/who/*.json`.
