import {binarySearch, findCorrespondingFloatIndex} from "../../../Utils/methods";

export function getStrengthOfLine(xs, ys, line, redshift, quasar) {

    const window = quasar ? 21 : 11;
    const x = line.wavelength * (1 + redshift);
    const bounds = binarySearch(xs, x);
    const floatIndex = findCorrespondingFloatIndex(xs, x, bounds[0]);
    const index = Math.round(floatIndex);

    const strength = 2 * window; //TEMP TO MAKE USELESS UNTIL BETTER ALGORITHM


    return 0.3 + 0.7 * Math.min(1.0, Math.abs(1.0 * strength / (2 * window )));
};