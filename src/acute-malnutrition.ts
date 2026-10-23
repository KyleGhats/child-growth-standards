export const ACUTE_MAM = {
  status: "Moderate acute malnutrition",
  code: "MAM",
} as const;

export const ACUTE_SAM = {
  status: "Severe acute malnutrition",
  code: "SAM",
} as const;

export type AcuteMalnutritionFields = {
  acuteMalnutritionStatus: string;
  acuteMalnutritionStatusCode: string;
};

/** NNC eOPT wasting codes MW/SW → supplementary MAM/SAM (primary labels unchanged). */
export function acuteFieldsForNncWastingCode(
  code: string,
): Partial<AcuteMalnutritionFields> {
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
