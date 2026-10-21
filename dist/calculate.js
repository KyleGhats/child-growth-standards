import { calculateDohAll } from "./doh/calculate-doh.js";
import { calculateWhoAll, calculateWhoZScore } from "./who/calculate-who.js";
export async function calculateAll(input) {
    if (input.standard === "nnc") {
        return calculateDohAll(input);
    }
    return calculateWhoAll(input);
}
export async function calculateZScore(input) {
    if (input.standard === "nnc") {
        return null;
    }
    return calculateWhoZScore(input);
}
