import type { LmsRow, Sex } from "../types.js";
export type WhoTableFile = {
    indicator: string;
    sex: Sex;
    indexUnit: string;
    rows: LmsRow[];
};
export declare function loadWhoJson(fileName: string): WhoTableFile;
//# sourceMappingURL=load-tables.d.ts.map