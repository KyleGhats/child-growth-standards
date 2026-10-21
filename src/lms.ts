import type { LmsRow } from "./types.js";

function interpolateLms(lower: LmsRow, upper: LmsRow, fraction: number): LmsRow {
  return {
    age: lower.age + (upper.age - lower.age) * fraction,
    L: lower.L + (upper.L - lower.L) * fraction,
    M: lower.M + (upper.M - lower.M) * fraction,
    S: lower.S + (upper.S - lower.S) * fraction,
  };
}

export function lookupLms(table: LmsRow[], index: number): LmsRow | null {
  if (table.length === 0) return null;
  const first = table[0];
  const last = table[table.length - 1];
  if (index < first.age || index > last.age) return null;
  if (index === first.age) return first;
  if (index === last.age) return last;

  let lo = 0;
  let hi = table.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (table[mid].age === index) return table[mid];
    if (table[mid].age < index) lo = mid + 1;
    else hi = mid - 1;
  }
  const lower = table[hi];
  const upper = table[lo];
  if (lower.age === upper.age) return lower;
  const fraction = (index - lower.age) / (upper.age - lower.age);
  return interpolateLms(lower, upper, fraction);
}

/** WHO LMS z-score with L≈0 and |Z|>3 extrapolation. */
export function computeZScore(measurement: number, lms: LmsRow): number {
  const { L, M, S } = lms;
  if (measurement <= 0 || M <= 0 || S <= 0) return NaN;

  let z: number;
  if (Math.abs(L) < 1e-10) {
    z = Math.log(measurement / M) / S;
  } else {
    z = (Math.pow(measurement / M, L) - 1) / (L * S);
  }

  if (Math.abs(z) > 3) {
    const sdValue = (k: number) =>
      Math.abs(L) < 1e-10 ? M * Math.exp(S * k) : M * Math.pow(1 + L * S * k, 1 / L);
    const sd3pos = sdValue(3);
    const sd2pos = sdValue(2);
    const sd3neg = sdValue(-3);
    const sd2neg = sdValue(-2);
    const sd23pos = sd3pos - sd2pos;
    const sd23neg = sd2neg - sd3neg;
    if (z > 3 && sd23pos > 0) z = 3 + (measurement - sd3pos) / sd23pos;
    else if (z < -3 && sd23neg > 0) z = -3 + (measurement - sd3neg) / sd23neg;
  }
  return z;
}

/** Abramowitz & Stegun normal CDF approximation. */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function zScoreToPercentile(z: number): number {
  return normalCdf(z) * 100;
}
