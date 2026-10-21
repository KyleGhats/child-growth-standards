import fs from "node:fs";
import path from "node:path";
import { resolveDataRoot } from "../data-path.js";
const cache = new Map();
const dataDir = path.join(resolveDataRoot(import.meta.url), "who");
export function loadWhoJson(fileName) {
    const hit = cache.get(fileName);
    if (hit)
        return hit;
    const fp = path.join(dataDir, fileName);
    const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
    cache.set(fileName, raw);
    return raw;
}
