export declare const WHO_DAYS_PER_MONTH = 30.4375;
export declare const FIVE_YEARS_DAYS = 1856;
export declare const NINETEEN_YEARS_DAYS = 6935;
export declare function toDateOnly(value: Date | string): Date | null;
/** Calendar day difference using Y/M/D components (stable across DST). */
export declare function ageInDays(dateOfBirth: Date, dateOfMeasurement: Date): number;
/**
 * Completed calendar months between dates (Excel DATEDIF "m" style).
 * Counts full months; if measurement day is before birth day-of-month, subtract one.
 */
export declare function ageInCompletedMonths(dateOfBirth: Date, dateOfMeasurement: Date): number;
export declare function daysToMonths(days: number): number;
export declare function resolveDates(dateOfBirth: Date | string, dateOfMeasurement: Date | string): {
    dateOfBirth: Date;
    dateOfMeasurement: Date;
} | null;
//# sourceMappingURL=age.d.ts.map