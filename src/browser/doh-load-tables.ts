import type { DohBandRow, Sex } from "../types.js";
import { NNC_TABLES } from "./table-registry.generated.js";

export type DohTable = {
  indicator: string;
  sex: Sex;
  indexUnit: "months" | "cm";
  rows: DohBandRow[];
};

export function loadDohTable(indicator: string, sex: Sex): DohTable {
  const key = `${indicator}-${sex}`;
  const hit = NNC_TABLES.get(key);
  if (!hit) {
    throw new Error(`NNC growth table not found: ${key}`);
  }
  return hit;
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
