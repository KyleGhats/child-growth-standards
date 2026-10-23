export const ACUTE_MAM = {
    status: "Moderate acute malnutrition",
    code: "MAM",
};
export const ACUTE_SAM = {
    status: "Severe acute malnutrition",
    code: "SAM",
};
/** NNC eOPT wasting codes MW/SW → supplementary MAM/SAM (primary labels unchanged). */
export function acuteFieldsForNncWastingCode(code) {
    if (code === "MW") {
        return {
            acuteMalnutritionStatus: ACUTE_MAM.status,
            acuteMalnutritionStatusCode: ACUTE_MAM.code,
        };
    }
    if (code === "SW") {
        return {
            acuteMalnutritionStatus: ACUTE_SAM.status,
            acuteMalnutritionStatusCode: ACUTE_SAM.code,
        };
    }
    return {};
}
