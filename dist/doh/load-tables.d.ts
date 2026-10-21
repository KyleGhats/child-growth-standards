import type { DohBandRow, Sex } from "../types.js";
export type DohTable = {
    indicator: string;
    sex: Sex;
    indexUnit: "months" | "cm";
    rows: DohBandRow[];
};
export declare function loadDohTable(indicator: string, sex: Sex): DohTable;
export declare function lookupDohRow(table: DohTable, index: number): DohBandRow | null;
export declare function mRoundHalf(value: number): number;
//# sourceMappingURL=load-tables.d.ts.map