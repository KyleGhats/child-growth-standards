import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(__dirname, "..");
const rawDoh = path.join(pkgRoot, "sources/raw/doh");
const rawWho = path.join(pkgRoot, "sources/raw/who/who-standard");
const outRoot = path.join(pkgRoot, "dist/data");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseDohCsv(filePath, meta) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 2) continue;
    const index = parseFloat(cols[0]);
    if (Number.isNaN(index)) continue;
    const bands = {};
    for (let h = 1; h < headers.length; h++) {
      const key = headers[h];
      if (key === "Measurement Type") continue;
      const v = parseFloat(cols[h]);
      if (!Number.isNaN(v)) bands[key] = v;
    }
    rows.push({ index, bands });
  }
  return { ...meta, rows };
}

const dohFileMap = [
  { file: "Weight-for-Age-Boys.csv", indicator: "wfa", sex: "male", indexUnit: "months" },
  { file: "Weight-for-Age-Girls.csv", indicator: "wfa", sex: "female", indexUnit: "months" },
  {
    file: "LengthHeight-for-Age-Boys.csv",
    indicator: "lhfa",
    sex: "male",
    indexUnit: "months",
  },
  {
    file: "LengthHeight-for-Age-Girls.csv",
    indicator: "lhfa",
    sex: "female",
    indexUnit: "months",
  },
  {
    file: "Weight-for-Length-Boys.csv",
    indicator: "wfl",
    sex: "male",
    indexUnit: "cm",
  },
  {
    file: "Weight-for-Length-Girls.csv",
    indicator: "wfl",
    sex: "female",
    indexUnit: "cm",
  },
  {
    file: "Weight-for-Height-Boys.csv",
    indicator: "wfh",
    sex: "male",
    indexUnit: "cm",
  },
  {
    file: "Weight-for-Height-Girls.csv",
    indicator: "wfh",
    sex: "female",
    indexUnit: "cm",
  },
];

function buildDoh() {
  const outDir = path.join(outRoot, "doh");
  ensureDir(outDir);
  for (const spec of dohFileMap) {
    const fp = path.join(rawDoh, spec.file);
    if (!fs.existsSync(fp)) {
      console.warn(`Missing DOH file: ${fp}`);
      continue;
    }
    const data = parseDohCsv(fp, {
      indicator: spec.indicator,
      sex: spec.sex,
      indexUnit: spec.indexUnit,
    });
    const outName = `${spec.indicator}-${spec.sex}.json`;
    fs.writeFileSync(path.join(outDir, outName), JSON.stringify(data));
    console.log(`DOH → ${outName} (${data.rows.length} rows)`);
  }
}

function findCol(headers, patterns) {
  const lower = headers.map((h) => String(h ?? "").toLowerCase());
  for (const p of patterns) {
    const i = lower.findIndex((h) => h.includes(p));
    if (i >= 0) return i;
  }
  return -1;
}

function extractLmsFromSheet(sheet) {
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (matrix.length < 2) return [];
  const headers = matrix[0].map(String);
  const ageCol = findCol(headers, ["day", "month", "age", "length", "height", "cm"]);
  const lCol = findCol(headers, ["^l$", " lambda"]);
  const mCol = findCol(headers, ["^m$", " median"]);
  const sCol = findCol(headers, ["^s$", " sigma"]);
  let li = headers.findIndex((h) => /^l$/i.test(String(h).trim()));
  let mi = headers.findIndex((h) => /^m$/i.test(String(h).trim()));
  let si = headers.findIndex((h) => /^s$/i.test(String(h).trim()));
  if (li < 0) li = lCol;
  if (mi < 0) mi = mCol;
  if (si < 0) si = sCol;
  let ai = ageCol;
  if (ai < 0) ai = 0;

  const rows = [];
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const age = parseFloat(row[ai]);
    const L = parseFloat(row[li]);
    const M = parseFloat(row[mi]);
    const S = parseFloat(row[si]);
    if (Number.isNaN(age) || Number.isNaN(L) || Number.isNaN(M) || Number.isNaN(S)) continue;
    if (M <= 0 || S <= 0) continue;
    rows.push({ age, L, M, S });
  }
  rows.sort((a, b) => a.age - b.age);
  return rows;
}

function writeWhoJson(relPath, outName, meta = {}) {
  const fp = path.join(rawWho, relPath);
  if (!fs.existsSync(fp)) {
    console.warn(`Missing WHO file: ${fp}`);
    return;
  }
  const wb = XLSX.readFile(fp);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = extractLmsFromSheet(sheet);
  if (rows.length === 0) {
    console.warn(`No LMS rows parsed: ${fp}`);
    return;
  }
  const outDir = path.join(outRoot, "who");
  ensureDir(outDir);
  fs.writeFileSync(
    path.join(outDir, outName),
    JSON.stringify({ ...meta, rows }),
  );
  console.log(`WHO → ${outName} (${rows.length} rows)`);
}

function mergeWhoTables(paths, outName, meta) {
  const merged = [];
  for (const rel of paths) {
    const fp = path.join(rawWho, rel);
    if (!fs.existsSync(fp)) continue;
    const wb = XLSX.readFile(fp);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    merged.push(...extractLmsFromSheet(sheet));
  }
  merged.sort((a, b) => a.age - b.age);
  const dedup = [];
  for (const row of merged) {
    if (dedup.length && dedup[dedup.length - 1].age === row.age) {
      dedup[dedup.length - 1] = row;
    } else dedup.push(row);
  }
  const outDir = path.join(outRoot, "who");
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, outName), JSON.stringify({ ...meta, rows: dedup }));
  console.log(`WHO → ${outName} (${dedup.length} rows merged)`);
}

function buildWho() {
  const d05 = "age-in-days_0-5-years_zscores";
  const m05 = "age-in-months_0-5-years_zscores";
  const m519 = "age-in-months_5-19-years_zscores";

  writeWhoJson(`${d05}/wfa-boys-zscore-expanded-tables.xlsx`, "wfa-boys-0-5-days.json", {
    indicator: "wfa",
    sex: "male",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/wfa-girls-zscore-expanded-tables.xlsx`, "wfa-girls-0-5-days.json", {
    indicator: "wfa",
    sex: "female",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/lhfa-boys-zscore-expanded-tables.xlsx`, "lhfa-boys-0-5-days.json", {
    indicator: "lhfa",
    sex: "male",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/lhfa-girls-zscore-expanded-tables.xlsx`, "lhfa-girls-0-5-days.json", {
    indicator: "lhfa",
    sex: "female",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/bfa-boys-zscore-expanded-tables.xlsx`, "bfa-boys-0-5-days.json", {
    indicator: "bfa",
    sex: "male",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/bfa-girls-zscore-expanded-tables.xlsx`, "bfa-girls-0-5-days.json", {
    indicator: "bfa",
    sex: "female",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/hcfa-boys-zscore-expanded-tables.xlsx`, "hcfa-boys-0-5-days.json", {
    indicator: "hcfa",
    sex: "male",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/hcfa-girls-zscore-expanded-tables.xlsx`, "hcfa-girls-0-5-days.json", {
    indicator: "hcfa",
    sex: "female",
    indexUnit: "days",
  });
  writeWhoJson(`${d05}/wfl-boys-zscore-expanded-table.xlsx`, "wfl-boys-days.json", {
    indicator: "wfl",
    sex: "male",
    indexUnit: "cm",
  });
  writeWhoJson(`${d05}/wfl-girls-zscore-expanded-table.xlsx`, "wfl-girls-days.json", {
    indicator: "wfl",
    sex: "female",
    indexUnit: "cm",
  });

  writeWhoJson(`${m05}/wfa_boys_0-to-5-years_zscores.xlsx`, "wfa-boys-0-5-months.json", {
    indicator: "wfa",
    sex: "male",
    indexUnit: "months",
  });
  writeWhoJson(`${m05}/wfa_girls_0-to-5-years_zscores.xlsx`, "wfa-girls-0-5-months.json", {
    indicator: "wfa",
    sex: "female",
    indexUnit: "months",
  });
  mergeWhoTables(
    [`${m05}/lhfa_boys_0-to-2-years_zscores.xlsx`, `${m05}/lhfa_boys_2-to-5-years_zscores.xlsx`],
    "lhfa-boys-0-5-months.json",
    { indicator: "lhfa", sex: "male", indexUnit: "months" },
  );
  mergeWhoTables(
    [`${m05}/lhfa_girls_0-to-2-years_zscores.xlsx`, `${m05}/lhfa_girls_2-to-5-years_zscores.xlsx`],
    "lhfa-girls-0-5-months.json",
    { indicator: "lhfa", sex: "female", indexUnit: "months" },
  );
  mergeWhoTables(
    [`${m05}/bmi_boys_0-to-2-years_zcores.xlsx`, `${m05}/bmi_boys_2-to-5-years_zscores.xlsx`],
    "bfa-boys-0-5-months.json",
    { indicator: "bfa", sex: "male", indexUnit: "months" },
  );
  mergeWhoTables(
    [`${m05}/bmi_girls_0-to-2-years_zscores.xlsx`, `${m05}/bmi_girls_2-to-5-years_zscores.xlsx`],
    "bfa-girls-0-5-months.json",
    { indicator: "bfa", sex: "female", indexUnit: "months" },
  );
  writeWhoJson(`${m05}/hcfa-boys-0-5-zscores.xlsx`, "hcfa-boys-0-5-months.json", {
    indicator: "hcfa",
    sex: "male",
    indexUnit: "months",
  });
  writeWhoJson(`${m05}/hcfa-girls-0-5-zscores.xlsx`, "hcfa-girls-0-5-months.json", {
    indicator: "hcfa",
    sex: "female",
    indexUnit: "months",
  });
  writeWhoJson(`${m05}/wfl_boys_0-to-2-years_zscores.xlsx`, "wfl-boys-months.json", {
    indicator: "wfl",
    sex: "male",
    indexUnit: "cm",
  });
  writeWhoJson(`${m05}/wfl_girls_0-to-2-years_zscores.xlsx`, "wfl-girls-months.json", {
    indicator: "wfl",
    sex: "female",
    indexUnit: "cm",
  });
  writeWhoJson(`${m05}/wfh_boys_2-to-5-years_zscores.xlsx`, "wfh-boys-months.json", {
    indicator: "wfh",
    sex: "male",
    indexUnit: "cm",
  });
  writeWhoJson(`${m05}/wfh_girls_2-to-5-years_zscores.xlsx`, "wfh-girls-months.json", {
    indicator: "wfh",
    sex: "female",
    indexUnit: "cm",
  });

  writeWhoJson(`${m519}/wfa-boys-z-who-2007-exp.xlsx`, "wfa-boys-5-10-months.json", {
    indicator: "wfa",
    sex: "male",
    indexUnit: "months",
  });
  writeWhoJson(`${m519}/wfa-girls-z-who-2007-exp.xlsx`, "wfa-girls-5-10-months.json", {
    indicator: "wfa",
    sex: "female",
    indexUnit: "months",
  });
  writeWhoJson(`${m519}/hfa-boys-z-who-2007-exp.xlsx`, "hfa-boys-5-19-months.json", {
    indicator: "hfa",
    sex: "male",
    indexUnit: "months",
  });
  writeWhoJson(`${m519}/hfa-girls-z-who-2007-exp.xlsx`, "hfa-girls-5-19-months.json", {
    indicator: "hfa",
    sex: "female",
    indexUnit: "months",
  });
  writeWhoJson(`${m519}/bmi-boys-z-who-2007-exp.xlsx`, "bfa-boys-5-19-months.json", {
    indicator: "bfa",
    sex: "male",
    indexUnit: "months",
  });
  writeWhoJson(`${m519}/bmi-girls-z-who-2007-exp.xlsx`, "bfa-girls-5-19-months.json", {
    indicator: "bfa",
    sex: "female",
    indexUnit: "months",
  });
}

ensureDir(outRoot);
buildDoh();
buildWho();
console.log("build:data complete");
