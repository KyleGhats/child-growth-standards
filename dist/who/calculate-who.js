import { ageInCompletedMonths, ageInDays, resolveDates } from "../age.js";
import { computeZScore, lookupLms, zScoreToPercentile } from "../lms.js";
import { indicatorResultFromWhoStatus, mapWhoEdemaNutritionalStatus, mapWhoMuacNutritionalStatus, mapWhoNutritionalStatus, } from "./nutritional-status.js";
import { resolveWhoLms } from "./resolve-table.js";
const TWENTY_FOUR_MONTHS_DAYS = 731;
function rawBmi(weightKg, heightCm) {
    const m = heightCm / 100;
    return weightKg / (m * m);
}
function indicatorKind(api, ageDays) {
    if (api === "weight-for-age")
        return "wfa";
    if (api === "length-height-for-age")
        return ageDays > 1856 ? "hfa" : "lhfa";
    if (api === "bmi-for-age")
        return "bfa";
    if (api === "head-circumference-for-age")
        return "hcfa";
    if (api === "weight-for-length")
        return "wfl";
    if (api === "weight-for-height")
        return "wfh";
    return "wfa";
}
function toWhoIndicator(api) {
    switch (api) {
        case "weight-for-age":
            return "wfa";
        case "length-height-for-age":
            return "lhfa";
        case "bmi-for-age":
            return "bfa";
        case "head-circumference-for-age":
            return "hcfa";
        case "weight-for-length":
            return "wfl";
        case "weight-for-height":
            return "wfh";
        default:
            return null;
    }
}
export function calculateWhoZScore(input) {
    const dates = resolveDates(input.dateOfBirth, input.dateOfMeasurement);
    if (!dates)
        return null;
    const days = ageInDays(dates.dateOfBirth, dates.dateOfMeasurement);
    const whoAgeIndex = input.whoAgeIndex ?? "days";
    const wi = toWhoIndicator(input.indicator);
    if (!wi)
        return null;
    let measurement = input.measurement;
    if (measurement == null) {
        if (wi === "bfa")
            measurement = rawBmi(input.weightKg, input.lengthHeightCm);
        else if (wi === "wfa")
            measurement = input.weightKg;
        else if (wi === "lhfa" || wi === "hfa")
            measurement = input.lengthHeightCm;
        else if (wi === "hcfa")
            measurement = input.headCircumferenceCm ?? NaN;
        else if (wi === "wfl" || wi === "wfh")
            measurement = input.weightKg;
    }
    if (measurement == null || !Number.isFinite(measurement))
        return null;
    let ind = wi;
    if (wi === "wfl" && days >= TWENTY_FOUR_MONTHS_DAYS)
        ind = "wfh";
    if (wi === "wfh" && days < TWENTY_FOUR_MONTHS_DAYS)
        ind = "wfl";
    const lmsRef = resolveWhoLms(ind, input.sex, days, whoAgeIndex, input.lengthHeightCm);
    if (!lmsRef)
        return null;
    const lms = lookupLms(lmsRef.table, lmsRef.index);
    if (!lms)
        return null;
    const z = computeZScore(measurement, lms);
    if (!Number.isFinite(z))
        return null;
    const kind = indicatorKind(input.indicator, days);
    const ns = mapWhoNutritionalStatus(kind, z, days);
    return {
        indicator: input.indicator,
        zScore: z,
        nutritionalStatus: ns.nutritionalStatus,
        nutritionalStatusCode: ns.nutritionalStatusCode,
        sdBand: ns.sdBand,
        ...(ns.acuteMalnutritionStatus
            ? {
                acuteMalnutritionStatus: ns.acuteMalnutritionStatus,
                acuteMalnutritionStatusCode: ns.acuteMalnutritionStatusCode,
            }
            : {}),
        percentile: zScoreToPercentile(z),
    };
}
export function calculateWhoAll(input) {
    const dates = resolveDates(input.dateOfBirth, input.dateOfMeasurement);
    if (!dates) {
        return { standard: "who", ageDays: 0, ageMonthsCompleted: 0, results: [] };
    }
    const days = ageInDays(dates.dateOfBirth, dates.dateOfMeasurement);
    const months = ageInCompletedMonths(dates.dateOfBirth, dates.dateOfMeasurement);
    const indicators = [
        "weight-for-age",
        "length-height-for-age",
        "bmi-for-age",
    ];
    if (input.headCircumferenceCm != null) {
        indicators.push("head-circumference-for-age");
    }
    if (days < TWENTY_FOUR_MONTHS_DAYS) {
        indicators.push("weight-for-length");
    }
    else if (days <= 1856) {
        indicators.push("weight-for-height");
    }
    const results = [];
    for (const indicator of indicators) {
        const row = calculateWhoZScore({ ...input, indicator });
        if (row)
            results.push(row);
    }
    if (input.muacCm != null) {
        const muacNs = mapWhoMuacNutritionalStatus(input.muacCm, months);
        if (muacNs) {
            results.push(indicatorResultFromWhoStatus("mid-upper-arm-circumference", muacNs));
        }
    }
    if (input.bilateralPittingEdema) {
        const edemaNs = mapWhoEdemaNutritionalStatus(true);
        if (edemaNs) {
            results.push(indicatorResultFromWhoStatus("bilateral-pitting-oedema", edemaNs));
        }
    }
    return { standard: "who", ageDays: days, ageMonthsCompleted: months, results };
}
