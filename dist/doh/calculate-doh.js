import { ageInCompletedMonths, ageInDays, resolveDates } from "../age.js";
import { classifyDohLhfa, classifyDohWfa, classifyDohWflh, } from "./classify-cutoffs.js";
import { loadDohTable, lookupDohRow, mRoundHalf } from "./load-tables.js";
const TWENTY_FOUR_MONTHS = 24;
const SIXTY_MONTHS = 60;
function empty() {
    return { indicator: "", zScore: null, status: "", statusCode: "" };
}
export function calculateDohAll(input) {
    const dates = resolveDates(input.dateOfBirth, input.dateOfMeasurement);
    if (!dates) {
        return {
            standard: "doh",
            ageDays: 0,
            ageMonthsCompleted: 0,
            results: [],
        };
    }
    const days = ageInDays(dates.dateOfBirth, dates.dateOfMeasurement);
    const months = ageInCompletedMonths(dates.dateOfBirth, dates.dateOfMeasurement);
    const sex = input.sex;
    const weight = input.weightKg;
    const height = input.lengthHeightCm;
    const results = [];
    const wfaRow = lookupDohRow(loadDohTable("wfa", sex), months);
    if (wfaRow) {
        const c = classifyDohWfa(weight, wfaRow);
        results.push({
            indicator: "weight-for-age",
            zScore: null,
            status: c.label,
            statusCode: c.code,
        });
    }
    const lhfaRow = lookupDohRow(loadDohTable("lhfa", sex), months);
    if (lhfaRow) {
        const c = classifyDohLhfa(height, lhfaRow);
        results.push({
            indicator: "length-height-for-age",
            zScore: null,
            status: c.label,
            statusCode: c.code,
        });
    }
    const lengthIndex = mRoundHalf(height);
    const wflIndicator = months < TWENTY_FOUR_MONTHS ? "wfl" : months < SIXTY_MONTHS ? "wfh" : null;
    if (wflIndicator) {
        const table = loadDohTable(wflIndicator, sex);
        const row = lookupDohRow(table, lengthIndex);
        if (row) {
            const c = classifyDohWflh(weight, row);
            results.push({
                indicator: wflIndicator === "wfl" ? "weight-for-length" : "weight-for-height",
                zScore: null,
                status: c.label,
                statusCode: c.code,
            });
        }
    }
    return {
        standard: "doh",
        ageDays: days,
        ageMonthsCompleted: months,
        results,
    };
}
export function isDohPreschoolAge(months) {
    return months >= 0 && months < SIXTY_MONTHS;
}
export function mapSex(input) {
    const n = String(input ?? "")
        .trim()
        .toUpperCase();
    if (n === "M" || n === "MALE")
        return "male";
    if (n === "F" || n === "FEMALE")
        return "female";
    return null;
}
