export function binarySearch(data, val) {
    let highIndex = data.length - 1;
    let lowIndex = 0;
    while (highIndex > lowIndex) {
        const index = Math.floor((highIndex + lowIndex) / 2);
        const sub = data[index];
        if (data[lowIndex] === val) {
            return [lowIndex, lowIndex];
        } else if (sub === val) {
            return [index, index];
        } else if (data[highIndex] === val) {
            return [highIndex, highIndex];
        } else if (sub > val) {
            if (highIndex === index) {
                return [lowIndex, highIndex];
            }
            highIndex = index
        } else {
            if (lowIndex === index) {
                return [lowIndex, highIndex];
            }
            lowIndex = index
        }
    }
    return [lowIndex, highIndex];
}

export function defaultFor(arg, val) {
    return typeof arg !== 'undefined' ? arg : val;
}

export function range(start, stop, step) {
    const result = [];
    for (let i = start; i < stop; i += step) {
        result.push(i);
    }
    return result;
}

export function getMax(array, lower, upper) {
    if (typeof lower === "undefined") lower = 0;
    if (typeof upper === "undefined") upper = array.length;
    let max = -9e19;
    for (let i = lower; i < upper; i++) {
        if (array[i] > max) {
            max = array[i];
        }
    }
    return max;
}

export function getMin(array, lower, upper) {
    if (typeof lower === "undefined") lower = 0;
    if (typeof upper === "undefined") upper = array.length;
    let min = 9e19;
    for (let i = lower; i < upper; i++) {
        if (array[i] < min) {
            min = array[i];
        }
    }
    return min;
}

const vacuum = range(500, 10000, 0.1);
const air = vacuum.slice();
convertAirFromVacuum(air);

export function convertSingleVacuumFromAir(lambda) {
    const indexes = binarySearch(air, lambda);
    if (indexes[0] === indexes[1]) {
        return vacuum[indexes[0]];
    } else {
        return vacuum[indexes[0]] + (vacuum[indexes[1]] - vacuum[indexes[0]]) * (lambda - air[indexes[0]]) / (air[indexes[1]] - air[indexes[0]]);
    }
}

/**
 * Converts a single wavelength in Angstroms from air to vacuum
 * @param lambda the wavelength to convert
 * @returns {number} the vacuum wavelength
 */
export function convertSingleAirFromVacuum(lambda) {
    return lambda / (1 + 2.735192e-4 + (131.4182/Math.pow(lambda, 2)) + (2.76249E8 /Math.pow(lambda, 4)));
}

/**
 * In place converts an array of wavelengths (in Angstroms) from air wavelength
 * to vacuum wavelength
 *
 * @param lambda an array of wavelengths
 */
export function convertAirFromVacuum(lambda) {
    for (let i = 0; i < lambda.length; i++) {
        lambda[i] = convertSingleAirFromVacuum(lambda[i]);
    }
}

/**
 * Redshifts a singular wavelength
 * @param lambda the wavelength to redshift
 * @param z the redshift to apply
 * @returns {number} the redshifted wavelength
 */
export function shiftWavelength(lambda, z) {
    return (1+z)*lambda;
}

/**
 * Helper function for the interpolation method, which locates a linearly interpolated
 * floating point index that corresponds to the position of value x inside array xs.
 * @param xs
 * @param x
 * @param optionalStartIndex
 * @returns {Number} the floating point effective index
 */
export function findCorrespondingFloatIndex(xs, x, optionalStartIndex) {
    let s = optionalStartIndex;
    if (s == null) s = 0;
    for (let i = s; i < xs.length; i++) {
        if (xs[i] >= x) {
            if (i === 0) return i;
            return (i - 1) + (x - xs[i - 1])/(xs[i] - xs[i - 1]);
        }
    }
    return xs.length - 1;
}

export function distance(x1, y1, x2, y2) {
    return Math.pow((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2), 0.5);
}