import type { LmsRow, Sex } from "../types.js";
import { WHO_TABLES } from "./table-registry.generated.js";

export type WhoTableFile = {
  indicator: string;
  sex: Sex;
  indexUnit: string;
  rows: LmsRow[];
};

export function loadWhoJson(fileName: string): WhoTableFile {
  const hit = WHO_TABLES.get(fileName);
  if (!hit) {
    throw new Error(`WHO growth table not found: ${fileName}`);
  }
  return hit;
}
