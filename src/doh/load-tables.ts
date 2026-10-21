import fs from "node:fs";
import path from "node:path";
import type { DohBandRow, Sex } from "../types.js";
import { resolveDataRoot } from "../data-path.js";

export type DohTable = {
  indicator: string;
  sex: Sex;
  indexUnit: "months" | "cm";
  rows: DohBandRow[];
};

const cache = new Map<string, DohTable>();

const dataDir = path.join(resolveDataRoot(import.meta.url), "nnc");

export function loadDohTable(indicator: string, sex: Sex): DohTable {
  const key = `${indicator}-${sex}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const fp = path.join(dataDir, `${key}.json`);
  const raw = JSON.parse(fs.readFileSync(fp, "utf8")) as DohTable;
  cache.set(key, raw);
  return raw;
}

export function lookupDohRow(table: DohTable, index: number): DohBandRow | null {
  const rows = table.rows;
  if (!rows.length) return null;
  if (index < rows[0].index || index > rows[rows.length - 1].index) return null;
  let exact = rows.find((r) => r.index === index);
  if (exact) return exact;
  if (table.indexUnit === "months") {
    exact = rows.find((r) => r.index === Math.floor(index));
    if (exact) return exact;
  }
  return null;
}

export function mRoundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
