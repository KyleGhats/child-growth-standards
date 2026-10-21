import fs from "node:fs";
import path from "node:path";
import { resolveDataRoot } from "../data-path.js";
const cache = new Map();
const dataDir = path.join(resolveDataRoot(import.meta.url), "doh");
export function loadDohTable(indicator, sex) {
    const key = `${indicator}-${sex}`;
    const hit = cache.get(key);
    if (hit)
        return hit;
    const fp = path.join(dataDir, `${key}.json`);
    const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
    cache.set(key, raw);
    return raw;
}
export function lookupDohRow(table, index) {
    const rows = table.rows;
    if (!rows.length)
        return null;
    if (index < rows[0].index || index > rows[rows.length - 1].index)
        return null;
    let exact = rows.find((r) => r.index === index);
    if (exact)
        return exact;
    if (table.indexUnit === "months") {
        exact = rows.find((r) => r.index === Math.floor(index));
        if (exact)
            return exact;
    }
    return null;
}
export function mRoundHalf(value) {
    return Math.round(value * 2) / 2;
}
