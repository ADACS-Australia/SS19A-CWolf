/******************************************************************
 * ANY CHANGES OF THIS FILE MUST BE CONVEYED IN A VERSION INCREMENT
 * OF marzVersion IN config.js!
 ******************************************************************/
import TemplateManager from "../TemplateManager";
import {globalConfig} from '../config';
import {defaultFor, linearScale, convertVacuumFromAir, subtractPolyFit, smoothAndSubtract,
    convertVacuumFromAirWithLogLambda, interpolate, polyFitReject, removeBadPixels, removeCosmicRay, cullLines, removeNaNs, clipVariance, normaliseViaShift,
    getQuasarFFT, getStandardFFT, matchTemplate, fitAroundIndex, getRedshiftForNonIntegerIndex
} from '../../Utils/methods';
import {adjustRedshift} from '../../Utils/dsp';
let node = false;
const templateManager = new TemplateManager(true, true);

/**
 * Handles all worker related events, including data processing and spectra matching.
 *
 * ANY CHANGES IN THIS FUNCTION OR CHILD FUNCTIONS MUST BE CONVEYED IN A VERSION INCREMENT
 * OF marzVersion IN config.js!
 *
 */
export function handleEvent(data) {
    templateManager.setInactiveTemplates(data.inactiveTemplates);
    node = data.node;
    let result = null;
    // Whether the data gets processed or matched depends on if a processing property is set
    if (data.processing) {
        process(data);
        result = data;
    }
    if (result == null) {
        result = {}
    }
    if (data.matching) {
        result['matching'] = true;
        result['id'] = data.id;
        result['name'] = data.name;
        result['results'] = matchTemplates(data.lambda, data.intensity, data.variance, data.type, data.helio, data.cmb);
    }
    return result;
}



/**
 * This function takes a data structure that has lambda, intensity and variance arrays set. It will add
 * a continuum array (which is the intensity without subtraction) and modified intensity and variance arrays
 * such that the continuum has been subtracted out
 * @param data
 * @returns the input data data structure with a continuum property added
 */
export function process(data) {

    if (!node) {
        data.processedVariancePlot = data.variance.slice();
        removeNaNs(data.processedVariancePlot);
        for (let i = 0; i < 3; i++ ) {
            clipVariance(data.processedVariancePlot);
        }
        normaliseViaShift(data.processedVariancePlot, 0, globalConfig.varianceHeight, null);
    }
    data.continuum = processData(data.lambda, data.intensity, data.variance);
    return data;
}

/**
 * Preprocesses the data to make it easier for a user to find a manual redshift.
 *
 * Involves flagging and removing bad pixels, along with flagging and removing bad pixels.
 *
 * Continuum subtraction is done via rejected polynomial fitting.
 *
 * Returns the continuum, so that users can toggle it on or off.
 */
export function processData(lambda, intensity, variance) {
    removeBadPixels(intensity, variance);
    removeCosmicRay(intensity, variance);
    const res = intensity.slice();
    polyFitReject(lambda, intensity);
    cullLines(intensity);
    return res;
};

function getTemplatesToMatch() {
    const ts = templateManager.templates;
    const result = [];
    const eigens = {}
    for (let i = 0; i < ts.length; i++) {
        const t = ts[i];
        if (t.eigentemplate == null) {
            result.push([t])
        } else {
            if (eigens[t.eigentemplate] == null) {
                eigens[t.eigentemplate] = [t]
            } else {
                eigens[t.eigentemplate].push(t)
            }
        }
    }
    for (let key in eigens) {
        if (eigens.hasOwnProperty(key)) {
            result.push(eigens[key]);
        }
    }
    return result;
};

/**
 * This is the real part of the program. The matching algorithm.
 *
 * This function will get the matching results for every available template, and then coalesce them
 * into a singular data structure which is then returned to the user.
 *
 * It first continues processing the spectra, before Fourier transforming them, and passing the transforms
 * to a template matching function (which is found below), before calling the coalesce function and returning
 * its results
 *
 * @param lambda
 * @param intensity
 * @param variance
 * @param type (eg 'AGN_reverberation')
 * @returns a data structure of results, containing both the fit at each redshift for each template, and an
 * ordered list of best results.
 */
function matchTemplates(lambda, intensity, variance, type, helio, cmb) {

    let quasarFFT = null;
    if (templateManager.isQuasarActive()) {
        quasarFFT = getQuasarFFT(lambda, intensity, variance);
    }
    const res = getStandardFFT(lambda, intensity, variance, !node);
    let subtracted = null;
    let fft = null;
    if (node) {
        fft = res;
    } else {
        fft = res[0];
        subtracted = res[1];
    }

    // For each template, match the appropriate transform
    const ts = getTemplatesToMatch();
    const templateResults = ts.map(function(templates) {
        if (templateManager.isQuasar(templates[0].id)) {
            return matchTemplate(templates, quasarFFT);
        } else {
            return matchTemplate(templates, fft);
        }
    });

    return coalesceResults(templateResults, type, subtracted, helio, cmb);
};


/**
 * Coalesces the results from all templates into a singular list by adding in the
 * weighting that comes from the prior spectra type. This function is NOT finished
 * (see the null value of the templates variable in the return), because I have not
 * yet had the chance to add in the cross correlation function above the detailed
 * graph as Chris Lidman requested.
 *
 * @param templateResults an array of results from the {matchTemplate} function
 * @param type
 * @returns {{coalesced: Array, templates: null, intensity: Array}}
 */
function coalesceResults(templateResults, type, intensity, helio, cmb) {
    // Adjust for optional weighting
    const coalesced = [];
    let w;
    for (let i = 0; i < templateResults.length; i++) {
        const tr = templateResults[i];
        const t = templateManager.getTemplateFromId(tr.id);

        // Find the weight to apply
        w =  t.weights[''+type];
        if (w == 0 || w == null) {
            w = t.weights['blank'];
            if (w == 0 || w == null) {
                w = 1;
            }
        }
        tr.weight = w;

        for (let j = 0; j < tr.peaks.length; j++) {
            tr.peaks[j].value = tr.peaks[j].value / w;
            tr.peaks[j].z = adjustRedshift(tr.zs[tr.peaks[j].index], helio, cmb);
            tr.peaks[j].templateId = tr.id;
            tr.peaks[j].xcor = tr.xcor;
            coalesced.push(tr.peaks[j]);
        }
    }
    coalesced.sort(function(a,b) { return b.value - a.value});

    // Return only the ten best results
    //coalesced.splice(10, coalesced.length - 1);
    const topTen = [coalesced[0]];
    const thresh = 0.01;
    for (let ii = 1; ii < coalesced.length; ii++) {
        let add = true;
        for (let jj = 0; jj < topTen.length; jj++) {
            if (Math.abs(topTen[jj].z - coalesced[ii].z) < thresh) {
                add = false;
                break;
            }
        }
        if (add) {
            topTen.push(coalesced[ii]);
        }
        if (topTen.length == 10) {
            break;
        }
    }

    for (let k = 0; k < topTen.length; k++) {
        // Javascript only rounds to integer, so this should get four decimal places
        const index = fitAroundIndex(topTen[k].xcor, topTen[k].index);
        const res = adjustRedshift(getRedshiftForNonIntegerIndex(templateManager.getTemplateFromId(topTen[k].templateId), index), helio, cmb);
        topTen[k] = {
            z:  Math.round(res * 1e5) / 1e5,
            index: index,
            templateId: topTen[k].templateId,
            value: topTen[k].value
        };
    }
    const templates = {};
    const returnedMax = globalConfig.returnedMax;
    for (let i = 0; i < templateResults.length; i++) {
        const tr = templateResults[i];
        const numCondense = Math.ceil(tr.zs.length / returnedMax);
        let zs = [];
        let xcor = [];
        let c1 = 0;
        let c2 = 0;
        if (tr.zs.length > 1) {
            for (let j = 0; j < tr.zs.length; j++) {
                c1 += adjustRedshift(tr.zs[j], helio, cmb);
                c2 += tr.xcor[j];
                if ((j + 1) % numCondense == 0) {
                    zs.push(c1 / numCondense);
                    xcor.push(c2 / numCondense);
                    c1 = 0;
                    c2 = 0;
                }
            }
        } else {
            zs = tr.zs;
            xcor = tr.xcor;
        }
        if (node) {
            templates[tr.id] = {
                zs: null,
                xcor: null,
                weight: w
            };
            zs = null;
            xcor = null;
        } else {
            templates[tr.id] = {
                zs: zs,
                xcor: xcor,
                weight: w
            };
        }

    }
    const autoQOP = getAutoQOP(topTen);
    return {
        coalesced: topTen,
        templates: templates,
        intensity2: intensity,
        autoQOP: autoQOP
    };
}

/**
 *  Returns an auto QOP from the coalesced matching results. Needs tuning.
 *
 * @returns {number} QOp integer, 1,2,3,4 or 6
 */
function getAutoQOP(coalesced) {
    if (coalesced.length < 2) {
        return 0;
    }
    const mainV = coalesced[0].value;
    const secondV = coalesced[1].value;

    const isStar = templateManager.getTemplateFromId(coalesced[0].templateId).isStar == true;
    let pqop = 0;
    const fom = Math.pow(mainV - 2.5, 0.75) * (mainV / secondV);
    if (fom > 8.5) {
        pqop = 4;
    } else if (fom > 4.5) {
        pqop = 3;
    } else if (fom > 3) {
        pqop = 2;
    } else {
        pqop = 1;
    }
    return (pqop > 2 && isStar ? 6 : pqop);
}
