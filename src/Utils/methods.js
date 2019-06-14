import {getDataPowered, polynomial, polynomial3} from "./regression";

import {globalConfig} from "../Lib/config";
import FFT from "../Lib/dsp/FFT";

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

// SOURCED FROM http://www.csgnetwork.com/julianmodifdateconv.html
/**
 *
 * @param mjd_in the MJD date in
 * @returns {string} the 'YYYY-MM-dd' date format
 */
export function MJDtoYMD(mjd_in) {
    let year;
    let month;
    let day;
    // let hour;
    let jd;
    let jdi;
    let jdf;
    let l;
    let n;


    // Julian day
    jd = Math.floor(mjd_in) + 2400000.5;

    // Integer Julian day
    jdi = Math.floor(jd);

    // Fractional part of day
    jdf = jd - jdi + 0.5;

    if (jdf >= 1.0) {
        jdi = jdi + 1;
    }
    l = jdi + 68569;
    n = Math.floor(4 * l / 146097);

    l = Math.floor(l) - Math.floor((146097 * n + 3) / 4);
    year = Math.floor(4000 * (l + 1) / 1461001);

    l = l - (Math.floor(1461 * year / 4)) + 31;
    month = Math.floor(80 * l / 2447);

    day = l - Math.floor(2447 * month / 80);

    l = Math.floor(month / 11);

    month = Math.floor(month + 2 - 12 * l);
    year = Math.floor(100 * (n - 49) + year + l);

    if (month < 10)
        month = "0" + month;

    if (day < 10)
        day = "0" + day;
    return year + "-" + month + "-" + day;
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

export function convertVacuumFromAir(lambda) {
    for (let i = 0; i < lambda.length; i++) {
        lambda[i] = convertSingleVacuumFromAir(lambda[i]);
    }
}

export function convertVacuumFromAirWithLogLambda(lambda) {
    for (let i = 0; i < lambda.length; i++) {
        const l = Math.pow(10, lambda[i]);
        lambda[i] = Math.log(convertSingleVacuumFromAir(l))/Math.LN10;
    }
}

/**
 * Converts the equispaced linear scale of the given lambda into an equispaced log scale.
 * Interpolates intensity and variance to this new scale.
 *
 * @param lambda
 * @param intensity
 */
export function convertLambdaToLogLambda(lambda, intensity, numel, quasar) {
    if (typeof numel === 'undefined') numel = globalConfig.arraySize;
    const s = quasar ? globalConfig.startPowerQ : globalConfig.startPower;
    const e = quasar ? globalConfig.endPowerQ : globalConfig.endPower;
    const logLambda = linearScale(s, e, numel);
    const rescale = logLambda.map(function(x) { return Math.pow(10, x);});
    const newIntensity = interpolate(rescale, lambda, intensity);
    return {lambda: logLambda, intensity: newIntensity};
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

/**
 * Performs a fast smooth on the data via means of a rolling sum
 * @param y the array of values which to smooth
 * @param num the number of pixels either side to smooth (not the window size)
 * @returns {Array} the smoothed values
 */
export function fastSmooth(y, num) {
    //TODO: LOOK AT THIS AGAIN, RESULTS FOR HIGH NUM SEEM WEIRD
    if (num === 0) {
        return y;
    }
    num += 1;
    const frac = 2*num + 1;
    // Remove NaNs
    for (let i = 0; i < y.length; i++) {
        if (isNaN(y[i])) {
            if (i === 0) {
                y[i] = 0;
            } else {
                y[i] = y[i - 1];
            }
        }
    }
    // Get initial sum
    let rolling = 0;
    for (let i = 0; i < num; i++) {
        rolling += y[i];
    }
    // Average it
    const d = [];
    for (let i = 0; i < y.length; i++) {
        if (i >= num) {
            rolling -= y[i - num];
        }
        if (i <= y.length - num) {
            rolling += y[i + num]
        }
        d.push(rolling / frac);
    }
    return d;
}

/**
 * Normalises an input array to fit between the bottom and top limits via applying a linear ratio.
 * An optional array can be passed in to the end that will also undergo normalisation to the same
 * ratio as the first array if it is specified.
 *
 * @param array
 * @param bottom
 * @param top
 * @param optional
 */
export function normaliseViaShift(array, bottom, top, optional) {
    let min = 9e9;
    let max = -9e9;
    for (let j = 0; j < array.length; j++) {
        if (array[j] > max) {
            max = array[j];
        }
        if (array[j] < min) {
            min = array[j];
        }
    }
    const r = (top-bottom)/(max-min);
    for (let j = 0; j < array.length; j++) {
        const newVal = bottom + r*(array[j]-min);
        if (optional != null) {
            optional[j] = bottom + r*(optional[j]- min);
        }
        array[j] = newVal;
    }
}

/**
 * Iterates through an array and replaces NaNs with the value immediately prior to the NaN,
 * setting the first element to zero if it is NaN
 * @param y
 */
export function removeNaNs(y) {
    for (let i = 0; i < y.length; i++) {
        if (isNaN(y[i])) {
            if (i === 0) {
                y[i] = 0;
            } else {
                y[i] = y[i - 1];
            }
        }
    }
}

/**
 * Creates a linear scale of num points between and start and an end number
 * @param start
 * @param end
 * @param num
 * @returns {Array}
 */
export function linearScale(start, end, num) {
    const result = [];
    for (let i = 0; i < num; i++) {
        const w0 = 1 - (i/(num-1));
        const w1 = 1 - w0;
        result.push(start*w0 + end*w1);
    }
    return result;
}

/**
 * Linearly interpolates a data set of xvals and yvals into the new x range found in xinterp.
 * The interpolated y vals are returned, not modified in place.
 *
 * Assumes both xvals and xinterp are sorted.
 *
 * This function will NOT interpolate to zero the interpolation values do not overlap
 * @param xinterp
 * @param xvals
 * @param yvals
 * @returns {Array} Array of interpolated y values
 */
export function interpolate(xinterp, xvals, yvals) {
    let index = 0;
    const result = [];
    let diff = 0;
    let bottom = 0;
    for (let i = 0; i < xinterp.length; i++) {
        index = findCorrespondingFloatIndex(xvals, xinterp[i], bottom);
        bottom = Math.floor(index);
        diff = index - bottom;
        if (diff === 0) {
            result.push(yvals[bottom])
        } else {
            result.push((yvals[bottom + 1] - yvals[bottom]) * diff + yvals[bottom])
        }
    }
    return result;
}

/**
 * In place subtracts a polynomial fit (polynomial degree set in config.js as polyDeg),
 * and returns the array of values that form the polynomial
 * @param lambda
 * @param intensity
 * @returns {Array}
 */
export function subtractPolyFit(lambda, intensity) {
    const r = polyFit(lambda, intensity);
    for (let i = 0; i < intensity.length; i++) {
        intensity[i] = intensity[i] - r[i];
    }
    return r;
}

/**
 * Calculates a polynomial fit to the input x and y data sets. Polynomial degree
 * set in config.js as polyDeg.
 * @param lambda
 * @param intensity
 * @returns {Array}
 */
export function polyFit(lambda, intensity) {
    const data = [];
    const polyDeg = globalConfig.polyDeg;
    const r = [];
    for (let i = 0; i < intensity.length; i++) {
        data.push([lambda[i], intensity[i]]);
    }
    const result = polynomial(data, polyDeg).equation;
    for (let i = 0; i < intensity.length; i++) {
        let y = 0;
        for (let j = 0; j < result.length; j++) {
            y += result[j] * Math.pow(lambda[i], j);
        }
        r.push(y);
    }
    return r;
}

/**
 * Checks to see if the index is bad
 * @param intensity
 * @param variance
 * @param index
 */
export function badIndex(intensity, variance, index) {
    const maxVal = globalConfig.maxVal;
    const minVal = globalConfig.minVal;
    const i = intensity[index];
    const v = variance[index];
    return isNaN(i) || isNaN(v) || i == null || v == null || i > maxVal || i < minVal || v <= 0;
}

/**
 * Replaces NaNs with an average over numPoints to either side.
 * Sets the variance to null so the point isn't counted.
 * @param intensity
 * @param variance
 * @param numPoints
 */
export function removeBadPixels(intensity, variance) {
    const numPoints = globalConfig.numPoints;
    for (let i = 0; i < intensity.length; i++) {
        if (badIndex(intensity, variance, i)) {
            let r = 0;
            let e = 0;
            let c = 0;
            for (let j = i - numPoints; j < (i + 1 + numPoints); j++) {
                if (j >= 0 && j < intensity.length && !badIndex(intensity, variance, j)) {
                    c++;
                    r += intensity[j];
                    e += variance[j];
                }
            }
            if (c !== 0) {
                r = r / c;
                e = e / c;
            }
            intensity[i] = r;
            if (e === 0) {
                variance[i] = 9e19;
            } else {
                variance[i] = e;
            }
        }
    }
}

/**
 *  Removes cosmic rays from the data by removing any points more than 5 rms dev apart
 *
 * @param intensity
 * @param variance
 */
export function removeCosmicRay(intensity, variance) {
    const numPoints = globalConfig.numPoints;
    const max_error = globalConfig.max_error;
    const cosmicIterations = globalConfig.cosmicIterations;
    const deviationFactor = globalConfig.deviationFactor;

    for (let n = 0; n < cosmicIterations; n++) {
        let rms = 0;
        let mean = 0;
        for (let i = 0; i < intensity.length; i++) {
            mean += intensity[i];
        }
        mean = mean / intensity.length;
        for (let i = 0; i < intensity.length; i++) {
            rms += Math.pow(intensity[i] - mean, 2);
        }
        rms = rms / intensity.length;
        rms = Math.pow(rms, 0.5);
        for (let i = 0; i < intensity.length; i++) {
            if (Math.abs(intensity[i] - mean) < deviationFactor * rms) {
                continue;
            }
            let maxNeighbour = 0;
            if (i > 1) {
                maxNeighbour = Math.abs(intensity[i - 2] - intensity[i]);
            }
            if (i < intensity.length - 2) {
                maxNeighbour = Math.max(maxNeighbour, Math.abs(intensity[i + 2] - intensity[i]));
            }
            if (maxNeighbour > deviationFactor * rms) {
                let r = 0;
                let c = 0;
                for (let j = i - 2*numPoints; j < (i + 1 + 2*numPoints); j++) {
                    if (j >= 0 && j < intensity.length && Math.abs(intensity[j]-mean) < rms) {
                        c++;
                        r += intensity[j];
                    }
                }
                if (c !== 0) {
                    r = r / c;
                }
                for (let k = i-numPoints; k < i+numPoints + 1; k++) {
                    if (k > 0 && k < (intensity.length - 1)) {
                        intensity[k] = r;
                        variance[k] = max_error;
                    }

                }
            }
        }
    }
}

/**
 * Returns {{data - subtract}}, as a new array
 * @param data
 * @param subtract
 * @returns {Array}
 */
function getNewSubtract(data, subtract) {
    const subtracted = new Array(data.length), dataLength = data.length;
    for (let i = 0; i < dataLength; i++) {
        subtracted[i|0] = data[i|0] - subtract[i|0];
    }
    return subtracted;
}

/**
 * Perform a rejected polynomial fit to the data. In place modified intensity to subtract the
 * polyfit, and returns the polyfit itself.
 * @param lambda
 * @param intensity
 */
export function polyFitReject(lambda, intensity, interactions, threshold, polyDegree) {
    interactions = defaultFor(interactions, globalConfig.polyFitInteractions);
    threshold = defaultFor(threshold, globalConfig.polyFitRejectDeviation);
    polyDegree = defaultFor(polyDegree, globalConfig.polyDeg);

    const intLength = intensity.length, mask = new Array(intLength);
    for (let i = 0; i < intLength; i++) {
        mask[i|0] = 1;
    }
    const dataPowered = getDataPowered(lambda, polyDegree);
    let subtracted, fit;

    for (let i = 0; i < interactions; i++) {
        fit = polynomial3(lambda, intensity, polyDegree, mask, dataPowered);
        subtracted = getNewSubtract(intensity, fit.points);
        const stdDev = getStdDevMask(subtracted, mask);
        const cutoff = stdDev * threshold;
        let c = true;
        for (let j = 0; j < intLength; j++) {
            if (mask[j|0] && Math.abs(subtracted[j|0]) > cutoff) {
                mask[j|0] = 0;
                c = false;
            }
        }
        if (c) {
            break;
        }
    }
    for (let i = 0; i < intLength; i++) {
        intensity[i] = subtracted[i];
    }
    return fit.points;
}

export function subtract(data, subtract) {
    for (let i = 0; i < data.length; i++) {
        data[i] -= subtract[i];
    }
}

export function addConstant(data, add) {
    for (let i = 0; i < data.length; i++) {
        data[i] += add;
    }
}

export function addMinMultiple(data, multiple) {
    const min = getMin(data);
    addConstant(data, min * multiple);
}

export function medianAndBoxcarSmooth(array, medianFilterWidth, boxCarWidth) {
    const medians = medianFilter(array, medianFilterWidth);
    return boxCarSmooth(medians, boxCarWidth);
}

export function smoothAndSubtract(intensity) {
    const medians = medianFilter(intensity, globalConfig.medianWidth);
    const smoothed = boxCarSmooth(medians, globalConfig.smoothWidth);
    subtract(intensity, smoothed);
}

/**
 * Returns a median filter of window size {{window}}.
 *
 * @param data
 * @param window
 * @returns {Array}
 */
export function medianFilter(data, window) {
    const result = [];
    const head = [null, null];
    const n = (window - 1) / 2;
    let i;

    for (i = 0; i < n + 1; i++) {
        addToSorted(head, data[0]);
    }
    for (i = 0; i < n; i++ ) {
        addToSorted(head, data[i|0]);
    }
    let add = 0;
    let remove = 0;
    const dataLength = data.length;
    for (i = 0; i < dataLength; i++) {
        remove = i < (n + 1) ? data[0] : data[(i - n - 1)|0];
        add = i + n >= dataLength ? data[dataLength - 1] : data[(i + n)|0];
        result.push(removeAddAndFindMedian(head, remove, add, n));
    }
    return result;
}

/**
 * Returns a boxcar smoothed array of {{data}}, smothing over {{window}} pixels.
 * @param data
 * @param window
 * @returns {Array}
 */
export function boxCarSmooth(data, window) {
    const result = [];
    const num = (window - 1)/2;
    const r = 1 / window;
    const dataLength = data.length, dlmo = dataLength - 1;
    let tot = 0, i1 = 0, i2 = 0, i;

    for (i = 0; i < num + 1; i++) {
        tot += data[0] * r;
    }
    for (i = 0; i < num; i++) {
        tot += data[i] * r;
    }
    for (i = 0; i < dataLength; i++) {
        i1 = i - num - 1;
        i2 = i + num;
        if (i1 < 0) {
            i1 = 0;
        }
        if (i2 > dlmo) {
            i2 = dlmo;
        }
        tot += (data[i2|0] - data[i1|0]) * r;
        result.push(tot);
    }
    return result;
}

/**
 * Applies a cosine taper onto both ends of the given data array.
 *
 * Modifies the array in place.
 *
 * @param intensity
 * @param zeroPixelWidth
 * @param taperWidth
 */
export function cosineTaper(intensity, zeroPixelWidth, taperWidth) {
    for (let i = 0; i < zeroPixelWidth; i++) {
        const inverse = intensity.length - 1 - i;
        intensity[i] = 0;
        intensity[inverse] = 0;
    }
    const frac = 0.5 * Math.PI / taperWidth;
    for (let i = 0; i < taperWidth; i++) {
        const inverse = intensity.length - 1 - i;
        const rad = i * frac;
        intensity[i + zeroPixelWidth] *= Math.sin(rad);
        intensity[inverse - zeroPixelWidth] *= Math.sin(rad);
    }
}

export function taperSpectra(intensity) {
    cosineTaper(intensity, globalConfig.zeroPixelWidth, globalConfig.taperWidth);
}

/**
 * In place modifies broadenError so that each value takes on the maximum
 * of itself, the previous data point, and the next data point.
 *
 * @param data
 */
export function broadenError(data) {
    const result = [];
    let prior = data[0];
    let current = data[0];
    let next = data[1];
    let i;
    const dataLength = data.length;

    for (i = 0; i < dataLength; i++) {
        if (i < dataLength - 1) {
            next = data[(i+1)|0];
        } else {
            next = data[(dataLength - 1)|0];
        }
        current = data[i|0];
        if (current < prior) {
            current = prior;
        }
        if (current < next) {
            current = next;
        }
        result.push(current);
        prior = data[i];
    }
    for (i = 0; i < dataLength; i++) {
        data[i|0] = result[i|0];
    }
}

/**
 * In place modifies the input array, such that the output values are the
 * maximum of either the original data point, or {{weight}} times by a median
 * filter of window size {{window}}.
 * @param data
 * @param window
 * @param weight
 */
export function maxMedianAdjust(data, window, weight) {
    const medians = medianFilter(data, window);
    const dataLength = data.length;
    let i, val = 0.0;
    for (i = 0; i < dataLength; i++) {
        val = weight * medians[i|0];
        if (data[i|0] < val) {
            data[i|0] = val;
        }
    }
}

export function adjustError(variance) {
    for (let i = 0; i < variance.length; i++) {
        variance[i] = Math.sqrt(variance[i]);
    }
    broadenError(variance);
    maxMedianAdjust(variance, globalConfig.errorMedianWindow, globalConfig.errorMedianWeight);
    for (let i = 0; i < variance.length; i++) {
        variance[i] = variance[i] * variance[i];
    }
}

export function divideByError(intensity, variance) {
    for (let i = 0; i < intensity.length; i++) {
        intensity[i] = intensity[i] / variance[i];
    }
}

/**
 * Returns the mean of the absolute of the input
 * @param data
 * @returns {number}
 */
export function absMean(data) {
    const dataLength = data.length;
    let running = 0, i;

    for (i = 0; i < dataLength; i++) {
        if (data[i|0] < 0) {
            running -= data[i|0];
        } else {
            running += data[i|0];
        }
    }
    return running / dataLength;
}
/**
 * Returns the maximum value of the absolute of the input.
 * @param data
 * @returns {number}
 */
export function absMax(data) {
    let max = 0;
    const dataLength = data.length;
    for (let i = 0; i < dataLength; i++) {
        if (data[i|0] < 0 && -data[i|0] > max) {
            max = -data[i|0];
        } else if (data[i|0] > 0 && data[i|0] > max) {
            max = data[i|0];
        }
    }
    return max;
}

export function normaliseMeanDev(intensity, clipValue) {
    const intLength = intensity.length;
    let running = true, i = 0, meanDeviation;

    while (running) {
        meanDeviation = absMean(intensity);
        const clipVal = (clipValue + 0.01) * meanDeviation;
        if (absMax(intensity) > clipVal) {
            for (i = 0; i < intLength; i++) {
                if (intensity[i|0] > clipVal) {
                    intensity[i|0] = clipVal;
                } else if (intensity[i|0] < -clipVal) {
                    intensity[i|0] = -clipVal;
                }
            }
        } else {
            running = false;
        }
    }
    for (i = 0; i < intLength; i++) {
        intensity[i|0] /= meanDeviation;
    }
}

export function normalise(intensity) {
    normaliseMeanDev(intensity, globalConfig.clipValue);
}

export function circShift(data, num) {
    const result = new Array(data.length);
    const l = data.length;
    for (let i = 0; i < l; i++) {
        result[i|0] = data[((i + num) % l)|0];
    }
    return result;
}

export function pruneResults(final, template) {
    return final.slice(template.startZIndex, template.endZIndex);
}

export function pruneResults2(final, template) {
    return final.slice(0, final.length - (template.endZIndex - template.endZIndex2));
}

export function subtractMeanReject2(final, stdDev) {
    const mask = [], finalLength = final.length;
    const cutoff = stdDev * getStdDev(final);
    const mean = getMean(final);
    for (let i = 0; i < finalLength; i++) {
        mask.push((final[i|0] - mean) < cutoff && (final[i|0] - mean) > -cutoff);
    }
    const maskedMean = getMeanMask(final, mask);
    for (let i = 0; i < finalLength; i++) {
        final[i|0] -= maskedMean;
    }
}

export function getPeaks(final, both) {
    if (typeof both === 'undefined') both = true;
    const is = [];
    const vals = [];
    for (let i = 2; i < final.length - 2; i++) {
        if (final[i] >= final[i + 1] && final[i] >= final[i+2] && final[i] > final[i - 1] && final[i] > final[i - 2]) {
            vals.push(final[i]);
            is.push(i);
        } else if (both && (final[i] <= final[i + 1] && final[i] <= final[i+2] && final[i] < final[i - 1] && final[i] < final[i - 2])) {
            vals.push(final[i]);
            is.push(i);
        }
    }
    return {index: is, value: vals};
}

export function addToSorted(head, value) {
    let current = head;
    while(current[0] != null && current[0][1] < value) {
        current = current[0];
    }
    current[0] = [current[0], value];
}

export function removeAddAndFindMedian(head, remove, add, median) {
    let c = 0;
    let previous = head;
    let current = head[0];
    let r = false, m = false, a = false, result = null;
    while (true) {
        if (!r && current[1] === remove) {
            previous[0] = current[0];
            current = current[0];
            r = true;
        }
        if (!a && current == null) {
            current = [null, add];
            previous[0] = current;
            a = true;

        }
        if (!a && (current[1] > add)) {
            const temp = [previous[0], add];
            previous[0] = temp;
            current = temp;
            a = true;
        }
        if (!m && c === median) {
            result = current[1];
            m = true;
        }
        if (a && r && m) {
            return result;
        }
        c++;
        previous = current;
        current = current[0];
    }
}

/**
 * Returns the standard deviation
 * @param data
 * @returns {number}
 */
export function getStdDev(data) {
    const mean = getMean(data);
    const dataLength = data.length;
    let squared = 0, temp = 0.0, i;
    for (i = 0; i < dataLength; i++) {
        temp = (data[i|0] - mean);
        squared += temp * temp;
    }
    return Math.sqrt(squared / dataLength);
}

/**
 * Returns the standard deviation with an input mask
 * @param data
 * @returns {number}
 */
export function getStdDevMask(data, mask) {
    const mean = getMeanMask(data, mask);
    const dataLength = data.length;
    let squared = 0, temp = 0.0, i, c = 0;

    for (i = 0; i < dataLength; i++) {
        if (mask[i|0]) {
            temp = (data[i|0] - mean);
            squared += temp * temp;
            c++;
        }
    }
    return Math.sqrt(squared / c);
}

export function rmsNormalisePeaks(final) {
    const peaks = getPeaks(final).value;
    if (peaks.length > 1) {
        const rms = getStdDev(peaks);
        for (let i = 0; i < final.length; i++) {
            final[i] /= rms;
        }
    }
}

export function normaliseXCorr(final) {
    subtractMeanReject2(final, globalConfig.trimStd);
    rmsNormalisePeaks(final);
    return final;
}

export function getPeaksFromNormalised(final) {
    const peaks = getPeaks(final, false);
    const result = [];
    for (let i = 0; i < peaks.index.length; i++) {
        result.push({index: peaks.index[i], value: peaks.value[i]});
    }
    return result;
}

/**
 * Convolves the intensity array with an exponential falloff window
 * to produce a rolling mean which mostly preserves peak location.
 *
 * Does not modify arrays in place.
 *
 * @param intensity
 * @param numPoints
 * @param falloff
 * @returns {Array}
 */
export function rollingPointMean(intensity, numPoints, falloff) {
    const d = new Array(intensity.length);
    const weights = [];
    let total = 0;
    let i;
    for (i = 0; i < 2*numPoints + 1; i++) {
        const w = Math.pow(falloff, Math.abs(numPoints - i));
        weights.push(w);
        total += w;
    }
    for (i = 0; i < weights.length; i++) {
        weights[i|0] /= total;
    }
    const intLength = intensity.length;
    let r = 0, c = 0;
    for (i = 0; i < intLength; i++) {
        c = 0;
        r = 0;
        for (let j = i - numPoints; j <= i + numPoints; j++) {
            if (j > 0 && j < intLength) {
                r += intensity[j|0] * weights[c|0];
                c++;
            }
        }
        d[i] = r;
    }
    return d;
}

export function getMean(data) {
    let r = 0, i;
    for (i = 0; i < data.length; i++) {
        r += data[i|0];
    }
    return r / data.length;
}

export function getMeanMask(data, mask) {
    const dataLength = data.length;
    let c = 0, r = 0, i;

    for (i = 0; i < dataLength; i++) {
        if (mask[i|0]) {
            r += data[i|0];
            c++;
        }
    }
    return r / c;
}

export function makeUnique(inarray) {
    const a = [];
    for (let i=0, l=inarray.length; i<l; i++)
        if (a.indexOf(inarray[i]) === -1)
            a.push(inarray[i]);
    return a;
}

/**
 * Clips the input array at the specific std range. Modifies array in place.
 * @param variance - the array to clip
 * @param clip - how many std to allow before clipping. Defaults to 3
 */
export function clipVariance(variance, clip) {
    clip = defaultFor(clip, 3);
    const mean = getMean(variance);
    const std = getStdDev(variance);
    for (let i = 0; i < variance.length; i++) {
        if (variance[i] - mean > clip * std) {
            variance[i] = mean + clip * std;
        }
    }
}

/**
 * In place caps all values in data to within 30 standard deviations of the mean
 *
 * @param data
 */
export function cullLines(data) {
    const std = getStdDev(data);
    const mean = getMean(data);
    const maxV = mean + 30 * std;
    const minV = mean - 30 * std;
    const dataLength = data.length;
    for (let i = 0; i < dataLength; i++) {
        if (data[i|0] > maxV) {
            data[i|0] = maxV;
        } else if (data[i|0] < minV) {
            data[i|0] = minV;
        }
    }
}

export function extractResults(templates, finals) {
    let final = finals[0];
    for (let i = 0; i < finals.length; i++) {
        const ev = defaultFor(templates[i].eigenvalue, 1.0);
        if (i === 0) {
            if (finals.length > 1) {
                for (let j = 0; j < final.length; j++) {
                    final[j] *=  final[j] / ev;
                }
            }

        } else {
            const f = finals[i];
            for (let j = 0; j < final.length; j++) {
                final[j] += f[j] / ev;
            }
        }
    }
    final = circShift(final, final.length/2);
    final = pruneResults(final, templates[0]);
    normaliseXCorr(final);


    if (templates[0].endZIndex2 != null) {
        final = pruneResults2(final, templates[0]);
    }
    const finalPeaks = getPeaksFromNormalised(final);

    return {
        id: templates[0].id,
        zs: templates[0].zs,
        xcor: final,
        peaks: finalPeaks
    };
}
/**
 * Determines the cross correlation (and peaks in it) between a spectra and a template
 *
 * @param template A template data structure from the template manager. Will contain a pre-transformed
 * template spectrum (this is why initialising TemplateManager is so slow).
 * @param fft the Fourier transformed spectra
 * @returns {{id: String, zs: Array, xcor: Array, peaks: Array}} a data structure containing the id of the template, the redshifts of the template, the xcor
 * results of the template and a list of peaks in the xcor array.
 */
export function matchTemplate(templates, fft) {
    const finals = templates.map(function(template) {
        const fftNew = fft.multiply(template.fft);
        const final = fftNew.inverse();
        return final
    });


    return extractResults(templates, finals)
}

/**
 * Performs a quadratic fit around a given index, and returns the
 * non-integer index of the quadratic maximum. Pixel window size starts at 3,
 * and increases if the quadratic does not give a maximum.
 *
 * @param data - the data to fit around (y values)
 * @param index - the index to place the pixel window
 * @returns {number} a double representing the non-integer maximal index
 */
export function fitAroundIndex(data, index) {
    let window = 3;
    let e = null;
    while (window < 10) {
        if (index - window < 0 || index + window >= data.length) {
            return index; // On boundary failure, return index
        }
        const d = data.slice(index - window, index + window + 1).map(function(v,i) { return [i - window,v]; });
        e = polynomial(d).equation;
        if (e[2] < 0) {
            break;
        } else {
            window++;
        }
    }
    let offset = (-e[1]/(2*e[2]));
    if (Math.abs(offset) > 1) {
        offset = 0;
    }
    return index + offset;
}

/**
 * Calculates a redshift based from a given index
 *
 * @param t - the template to use
 * @param index - the index to calculate the redshift for
 * @returns {number} the redshift of the index
 */
export function getRedshiftForNonIntegerIndex(t, index) {
    const gap =  (t.lambda[t.lambda.length - 1] - t.lambda[0]) / (t.lambda.length - 1);
    const num = t.lambda.length / 2;
    const z = (Math.pow(10, (index + t.startZIndex - num) * gap) * (1 + t.redshift)) - 1;
    return z;
}

export function getQuasarFFT(lambda, intensity, variance) {
    let quasarIntensity = intensity.slice();
    let quasarVariance = variance.slice();
    quasarIntensity = rollingPointMean(quasarIntensity, globalConfig.rollingPointWindow, globalConfig.rollingPointDecay);
    taperSpectra(quasarIntensity);
    quasarVariance = medianAndBoxcarSmooth(quasarVariance, globalConfig.quasarVarianceMedian, globalConfig.quasarVarianceBoxcar);
    addMinMultiple(quasarVariance, globalConfig.quasarMinMultiple);
    divideByError(quasarIntensity, quasarVariance);
    taperSpectra(quasarIntensity);
    normalise(quasarIntensity);
    const quasarResult = convertLambdaToLogLambda(lambda, quasarIntensity, globalConfig.arraySize, true);
    quasarIntensity = quasarResult.intensity;
    const quasarFFT = new FFT(quasarIntensity.length, quasarIntensity.length);
    quasarFFT.forward(quasarIntensity);
    return quasarFFT;
}

export function getStandardFFT(lambda, intensity, variance, needSubtracted) {
    needSubtracted = defaultFor(needSubtracted, false);
    intensity = intensity.slice();
    variance = variance.slice();
    taperSpectra(intensity);
    smoothAndSubtract(intensity);
    let subtracted;
    if (needSubtracted) {
        subtracted = intensity.slice();
    }
    adjustError(variance);
    divideByError(intensity, variance);
    taperSpectra(intensity);
    normalise(intensity);

    // This rebins (oversampling massively) into an equispaced log array. To change the size and range of
    // this array, have a look at the config.js file.
    const result = convertLambdaToLogLambda(lambda, intensity, globalConfig.arraySize, false);
    intensity = result.intensity;

    // Fourier transform both the intensity and quasarIntensity variables
    const fft = new FFT(intensity.length, intensity.length);
    fft.forward(intensity);

    if (needSubtracted) {
        return [fft, subtracted];
    } else {
        return fft;
    }
}
function getMethods(obj) {
    const result = [];
    for (let id in obj) {
      try {
        if (typeof(obj[id]) == "function") {
          result.push(id + ": " + obj[id].toString());
        }
      } catch (err) {
        result.push(id + ": inaccessible");
      }
    }
    return result;
  }
export function describe(object)
{
    console.log("Description:"+object);
    for (let p in object) {
        console.log(p+"="+object[p]);
    }
    //console.log("       JSON:"+JSON.stringify(object));
    /*
    let methods = getMethods(object);
    for (let i=0;i<methods.length;i++) {
        console.log("method["+methods[i]+"]");
    }
    for (p in object) {
        console.log(p+"="+object[p]);
    }
    */
}