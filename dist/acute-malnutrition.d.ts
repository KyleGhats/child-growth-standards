export declare const ACUTE_MAM: {
    readonly status: "Moderate acute malnutrition";
    readonly code: "MAM";
};
export declare const ACUTE_SAM: {
    readonly status: "Severe acute malnutrition";
    readonly code: "SAM";
};
export type AcuteMalnutritionFields = {
    acuteMalnutritionStatus: string;
    acuteMalnutritionStatusCode: string;
};
/** NNC eOPT wasting codes MW/SW → supplementary MAM/SAM (primary labels unchanged). */
export declare function acuteFieldsForNncWastingCode(code: string): Partial<AcuteMalnutritionFields>;
//# sourceMappingURL=acute-malnutrition.d.ts.map