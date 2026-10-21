const MS_PER_DAY = 86400000;
export const WHO_DAYS_PER_MONTH = 30.4375;
export const FIVE_YEARS_DAYS = 1856;
export const NINETEEN_YEARS_DAYS = 6935;

export function toDateOnly(value: Date | string): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Calendar day difference using Y/M/D components (stable across DST). */
export function ageInDays(dateOfBirth: Date, dateOfMeasurement: Date): number {
  const birthUTC = Date.UTC(
    dateOfBirth.getFullYear(),
    dateOfBirth.getMonth(),
    dateOfBirth.getDate(),
  );
  const measureUTC = Date.UTC(
    dateOfMeasurement.getFullYear(),
    dateOfMeasurement.getMonth(),
    dateOfMeasurement.getDate(),
  );
  return Math.floor((measureUTC - birthUTC) / MS_PER_DAY);
}

/**
 * Completed calendar months between dates (Excel DATEDIF "m" style).
 * Counts full months; if measurement day is before birth day-of-month, subtract one.
 */
export function ageInCompletedMonths(
  dateOfBirth: Date,
  dateOfMeasurement: Date,
): number {
  let months =
    (dateOfMeasurement.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (dateOfMeasurement.getMonth() - dateOfBirth.getMonth());
  if (dateOfMeasurement.getDate() < dateOfBirth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function daysToMonths(days: number): number {
  return days / WHO_DAYS_PER_MONTH;
}

export function resolveDates(
  dateOfBirth: Date | string,
  dateOfMeasurement: Date | string,
): { dateOfBirth: Date; dateOfMeasurement: Date } | null {
  const dob = toDateOnly(dateOfBirth);
  const dom = toDateOnly(dateOfMeasurement);
  if (!dob || !dom) return null;
  return { dateOfBirth: dob, dateOfMeasurement: dom };
}
