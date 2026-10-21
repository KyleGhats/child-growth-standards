# child-growth-standards

Pediatric growth calculations with a single API and two reference modes:

- **`standard: 'doh'`** — DOH / NNC eOPT-style **cutoff tables** (age in **completed months**).
- **`standard: 'who'`** — WHO **LMS z-scores** (age in **days** by default for 0–5; optional `whoAgeIndex: 'months'`).

Zero runtime dependencies. Reference data ships as JSON under `dist/data/`.

## Install

```bash
npm install child-growth-standards
```

Local development:

```bash
cd child-growth-standards
npm install
npm run build
```

## Usage

```ts
import { calculateAll } from "child-growth-standards";

const doh = await calculateAll({
  standard: "doh",
  sex: "male",
  dateOfBirth: "2023-06-15",
  dateOfMeasurement: "2024-06-15",
  weightKg: 8.2,
  lengthHeightCm: 72,
});

const who = await calculateAll({
  standard: "who",
  sex: "male",
  dateOfBirth: "2023-06-15",
  dateOfMeasurement: "2024-06-15",
  weightKg: 8.2,
  lengthHeightCm: 72,
  whoAgeIndex: "days", // or "months" for 0–5 age-indexed indicators
});
```

## Data workflow

1. Copy raw CSV/xlsx into `sources/raw/` (committed in git):

   ```bash
   npm run sync:sources
   ```

2. Generate JSON:

   ```bash
   npm run build:data
   ```

3. Compile TypeScript:

   ```bash
   npm run build
   ```

## Before publish

1. Edit `package.json` `repository.url` and `author` to match your GitHub account.
2. Ensure the npm name `child-growth-standards` is still available on [npmjs.com](https://www.npmjs.com/package/child-growth-standards).

## GitHub

```bash
cd child-growth-standards
git init
git add .
git commit -m "feat: initial child-growth-standards package"
git remote add origin https://github.com/YOUR_USER/child-growth-standards.git
git push -u origin main
```

## npm

```bash
npm login
npm publish --access public
```

`prepublishOnly` runs build and tests.

## npm pack contents

Published tarball includes `dist/` (code + JSON). Raw `sources/` are excluded via `.npmignore` but remain in git for reproducible builds.

## License

MIT for code. See [DATA_PROVENANCE.md](DATA_PROVENANCE.md) for reference data attribution.
