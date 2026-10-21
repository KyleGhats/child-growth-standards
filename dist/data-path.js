import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
/** Resolve `dist/data` for runtime and tests (after `npm run build:data`). */
export function resolveDataRoot(fromModuleUrl) {
    const cwdDist = path.join(process.cwd(), "dist", "data");
    if (fs.existsSync(path.join(cwdDist, "doh")))
        return cwdDist;
    const here = path.dirname(fileURLToPath(fromModuleUrl));
    const sibling = path.join(here, "..", "data");
    if (fs.existsSync(path.join(sibling, "doh")))
        return sibling;
    throw new Error("Growth reference JSON not found. Run `npm run build:data` before import.");
}
