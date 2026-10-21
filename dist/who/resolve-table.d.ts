import type { Sex, WhoAgeIndex } from "../types.js";
export type WhoIndicator = "wfa" | "lhfa" | "hfa" | "bfa" | "hcfa" | "wfl" | "wfh";
export declare function whoTableFile(indicator: WhoIndicator, sex: Sex, ageInDays: number, whoAgeIndex: WhoAgeIndex): {
    file: string;
    index: number;
} | null;
export declare function resolveWhoLms(indicator: WhoIndicator, sex: Sex, ageInDays: number, whoAgeIndex: WhoAgeIndex, lengthHeightCm?: number): {
    table: import("../types.js").LmsRow[];
    index: number;
} | null;
//# sourceMappingURL=resolve-table.d.ts.map