import type { DohBandRow } from "../types.js";
export type NncClassification = {
    code: string;
    label: string;
    sdBand: string;
};
export declare function classifyDohWfa(weightKg: number, row: DohBandRow): NncClassification;
export declare function classifyDohLhfa(heightCm: number, row: DohBandRow): NncClassification;
export declare function classifyDohWflh(weightKg: number, row: DohBandRow): NncClassification;
//# sourceMappingURL=classify-cutoffs.d.ts.map