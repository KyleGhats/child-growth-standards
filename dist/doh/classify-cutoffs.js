function band(bands, ...keys) {
    for (const k of Object.keys(bands)) {
        for (const needle of keys) {
            if (k.toLowerCase().includes(needle.toLowerCase()))
                return bands[k];
        }
    }
    return undefined;
}
export function classifyDohWfa(weightKg, row) {
    const b = row.bands;
    const uwFrom = band(b, "underweight from");
    const uwTo = band(b, "underweight to");
    const normalFrom = band(b, "normal from");
    const normalTo = band(b, "normal to");
    const ow = band(b, "overweight");
    if (uwFrom != null && weightKg < uwFrom) {
        return { code: "SUW", label: "Severely Underweight" };
    }
    if (uwFrom != null && uwTo != null && weightKg >= uwFrom && weightKg < uwTo) {
        return { code: "UW", label: "Underweight" };
    }
    if (normalFrom != null && normalTo != null && weightKg >= normalFrom && weightKg <= normalTo) {
        return { code: "N", label: "Normal" };
    }
    if (ow != null && weightKg > normalTo) {
        return { code: "OW", label: "Overweight" };
    }
    return { code: "", label: "" };
}
export function classifyDohLhfa(heightCm, row) {
    const b = row.bands;
    const stFrom = band(b, "stunted from");
    const stTo = band(b, "stunted to");
    const normalFrom = band(b, "normal from");
    const normalTo = band(b, "normal to");
    const tall = band(b, "tall");
    if (stFrom != null && heightCm < stFrom) {
        return { code: "SSt", label: "Severely Stunted" };
    }
    if (stFrom != null && stTo != null && heightCm >= stFrom && heightCm < stTo) {
        return { code: "St", label: "Stunted" };
    }
    if (normalFrom != null && normalTo != null && heightCm >= normalFrom && heightCm <= normalTo) {
        return { code: "N", label: "Normal" };
    }
    if (tall != null && heightCm > normalTo) {
        return { code: "T", label: "Tall" };
    }
    return { code: "", label: "" };
}
export function classifyDohWflh(weightKg, row) {
    const b = row.bands;
    const sw = band(b, "severely wasted");
    const mwFrom = band(b, "wasted from");
    const mwTo = band(b, "wasted to");
    const normalFrom = band(b, "normal from");
    const normalTo = band(b, "normal to");
    const owFrom = band(b, "overweight from");
    const owTo = band(b, "overweight to");
    const ob = band(b, "obese");
    if (sw != null && weightKg < sw)
        return { code: "SW", label: "Severely Wasted" };
    if (mwFrom != null && mwTo != null && weightKg >= mwFrom && weightKg < mwTo) {
        return { code: "MW", label: "Moderately Wasted" };
    }
    if (normalFrom != null && normalTo != null && weightKg >= normalFrom && weightKg <= normalTo) {
        return { code: "N", label: "Normal" };
    }
    if (owFrom != null && owTo != null && weightKg > normalTo && weightKg <= owTo) {
        return { code: "OW", label: "Overweight" };
    }
    if (ob != null && weightKg > owTo)
        return { code: "Ob", label: "Obese" };
    return { code: "", label: "" };
}
