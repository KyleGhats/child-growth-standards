import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(__dirname, "..");
const defaultBmrsData = path.resolve(
  pkgRoot,
  "../../../git-baguio/egov-bmrs/data",
);

const bmrsData = process.env.BMRS_DATA_DIR
  ? path.resolve(process.env.BMRS_DATA_DIR)
  : defaultBmrsData;

const dohSrc = path.join(bmrsData, "DOH (age-in-months)");
const whoSrc = path.join(bmrsData, "who-standard");
const dohDest = path.join(pkgRoot, "sources/raw/doh");
const whoDest = path.join(pkgRoot, "sources/raw/who/who-standard");

function copyDirFlatCsv(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (name.endsWith(".csv")) {
      fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name));
    }
  }
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(dohSrc)) {
  console.error(`DOH source not found: ${dohSrc}`);
  process.exit(1);
}
if (!fs.existsSync(whoSrc)) {
  console.error(`WHO source not found: ${whoSrc}`);
  process.exit(1);
}

copyDirFlatCsv(dohSrc, dohDest);
copyDirRecursive(whoSrc, whoDest);
console.log(`Synced DOH CSV → ${dohDest}`);
console.log(`Synced WHO xlsx → ${whoDest}`);
