import { calculateDohAll } from "./doh/calculate-doh.js";
import type {
  AssessmentResult,
  CalculateAllInput,
  CalculateZScoreInput,
  IndicatorResult,
} from "./types.js";
import { calculateWhoAll, calculateWhoZScore } from "./who/calculate-who.js";

export async function calculateAll(input: CalculateAllInput): Promise<AssessmentResult> {
  if (input.standard === "doh") {
    return calculateDohAll(input);
  }
  return calculateWhoAll(input);
}

export async function calculateZScore(
  input: CalculateZScoreInput,
): Promise<IndicatorResult | null> {
  if (input.standard === "doh") {
    return null;
  }
  return calculateWhoZScore(input);
}
