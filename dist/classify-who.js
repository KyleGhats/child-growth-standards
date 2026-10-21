import { FIVE_YEARS_DAYS } from "./age.js";
function mapWhoWeightForAge(z) {
    if (z < -3)
        return "Severely Underweight";
    if (z < -2)
        return "Underweight";
    if (z <= 1)
        return "Normal";
    return "Inconclusive";
}
function mapWhoHeightForAge(z) {
    if (z < -3)
        return "Severely Stunted";
    if (z < -2)
        return "Stunted";
    if (z <= 3)
        return "Normal";
    return "Tall";
}
function mapWhoWeightForLengthHeight(z) {
    if (z < -3)
        return "Severely Wasted";
    if (z < -2)
        return "Wasted";
    if (z <= 1)
        return "Normal";
    if (z <= 2)
        return "Risk of Overweight";
    if (z <= 3)
        return "Overweight";
    return "Obese";
}
function mapWhoBmiForAge5To19(z) {
    if (z < -3)
        return "Severe thinness";
    if (z < -2)
        return "Thinness";
    if (z <= 1)
        return "Normal weight";
    if (z <= 3)
        return "Overweight";
    return "Obesity";
}
function mapWhoHeadCircumferenceForAge(z) {
    if (z < -2)
        return "Below expected";
    if (z <= 2)
        return "Normal";
    return "Above expected";
}
export function mapWhoClassification(indicatorKind, zScore, ageInDays) {
    const z = Number(zScore);
    if (!Number.isFinite(z))
        return "";
    const kind = indicatorKind === "wfh" ? "wfl" : indicatorKind === "lhfa" ? "hfa" : indicatorKind;
    if (kind === "wfa")
        return mapWhoWeightForAge(z);
    if (kind === "hfa")
        return mapWhoHeightForAge(z);
    if (kind === "wfl")
        return mapWhoWeightForLengthHeight(z);
    if (kind === "hcfa")
        return mapWhoHeadCircumferenceForAge(z);
    if (kind === "bfa") {
        if (ageInDays < FIVE_YEARS_DAYS)
            return mapWhoWeightForLengthHeight(z);
        return mapWhoBmiForAge5To19(z);
    }
    return "";
}
