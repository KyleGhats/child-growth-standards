import fs from "node:fs";
import path from "node:path";
import type { LmsRow, Sex } from "../types.js";
import { resolveDataRoot } from "../data-path.js";

export type WhoTableFile = {
  indicator: string;
  sex: Sex;
  indexUnit: string;
  rows: LmsRow[];
};

const cache = new Map<string, WhoTableFile>();

const dataDir = path.join(resolveDataRoot(import.meta.url), "who");

export function loadWhoJson(fileName: string): WhoTableFile {
  const hit = cache.get(fileName);
  if (hit) return hit;
  const fp = path.join(dataDir, fileName);
  const raw = JSON.parse(fs.readFileSync(fp, "utf8")) as WhoTableFile;
  cache.set(fileName, raw);
  return raw;
}
