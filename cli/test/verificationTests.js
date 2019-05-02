import {expect} from "chai";
import {getMean, getMeanMask, getStdDev, getStdDevMask, absMax, absMean, defaultFor, linearScale, interpolate, round, range} from "../src/Utils/methods";
import TemplateManager from "../src/Lib/TemplateManager";
import { handleEvent } from '../src/Lib/worker/workerMethods'; 
var node = true;

//console.log("Loading dependencies for verification");
//var dependencies = ['../js/methods', '../js/workerMethods', '../js/templates', '../js/spectralLines', '../js/config', './test'];
//for (var i = 0; i < dependencies.length; i++) {
//    require(dependencies[i])();
//}
const numberTestsPerSpectraPermutation = 100;
const numberTestsPerSpectraPermutationQuasar = 500;
const edgeThresh = 0.002;
const threshold = 1e-5;
const quasarThreshold = 2e-5;
const scale = 1e5;

function getFakeDataScaffold(start, end, res) {
    start = defaultFor(start, 3000);
    end = defaultFor(end, 9000);
    res = defaultFor(res, 1.0);
    var data = {};
    data.processing = true;
    data.matching = true;
    data.node = true;
    data.lambda = range(start, end + 1e-7, res);
    data.intensity = null;
    data.variance = null;
    return data;
}

/**
 * Returns a mock variance array calculated as 1 + sqrt(intensity)
 *
 * @param intensity
 * @returns {number[]}
 */
function getVarianceBasedOffIntensity(intensity) {
    var result = [];
    for (var i = 0; i < intensity.length; i++) {
        result.push(1);// + Math.sqrt(Math.abs(intensity[i]));
    }
    return result;
}



/**
 * Adds uniform noise of height {{weight}}, centered around zero, onto data (in place).
 *
 * @param data
 * @param weight [defaults to 1]
 */
function addUniformNoise(data, weight) {
    weight = defaultFor(weight, 1);
    for (var i = 0; i < data.length; i++) {
        data[i] += (weight / 2) + Math.random() * weight;
    }
}


const templateManager = new TemplateManager();
templateManager.shiftToMatchSpectra();
const templates = templateManager.originalTemplates;



/**
 * Want to test that matches against template redshift permutations do not show signs of
 * any systematic issues from the data processing and matching algorithm
 */

describe("Verification tests", function () {
    this.timeout(30000);
for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const name = "Template (" + t.id + ") " + t.name + " systematic permutation test";
    let thresh = templateManager.isQuasar(t.id) ? quasarThreshold : threshold;
        it(name, () => {
            const t = templates[i];
            const received = [];
            const zs = [];
            let zend = t.z_end2 || t.z_end;
            var inact = templateManager.getInactivesForSingleTemplateActive(t.id);
            var isQuasar = templateManager.isQuasar(t.id);
            var numm = isQuasar ? numberTestsPerSpectraPermutationQuasar : numberTestsPerSpectraPermutation;
            var zsPot = linearScale(t.z_start + edgeThresh, zend - edgeThresh, numm);
            for (let j = 0; j < zsPot.length; j++) {
                let z = zsPot[j];
                z = round(z, 5);
                zsPot[j] = z;
                const data = getFakeDataScaffold();
                data.inactiveTemplates = inact;
                const temp = templateManager.getTemplate(t.id, z, true);

                data.intensity = interpolate(data.lambda, temp[0], temp[1]);
                data.variance = getVarianceBasedOffIntensity(data.intensity);

                const res = handleEvent(data);

                const resZ = res.results.coalesced[0].z;

                if (Math.abs(resZ - z) < 2e-3) {
                    zs.push(z);
                    received.push(resZ);
                }
            }
            const diff = [];
            for (let i = 0; i < zs.length; i++) {
                diff.push(zs[i] - received[i]);
            }
            const mean = getMean(diff);
            const std = getStdDev(diff);
            if (false) {
                console.log("\n\n\nc = numpy.array(" + JSON.stringify(zs, function (key, val) {
                        return val && val.toFixed ? Number(val.toFixed(7)) : val;
                    }) + ")");
                console.log("d = np.array(" + JSON.stringify(diff, function (key, val) {
                        return val && val.toFixed ? Number(val.toFixed(7)) : val;
                    }) + ")");
                console.log("plt.hist(d)\nplt.figure()");
                console.log("plt.plot(c,d,'b.')");
            }
            //console.log("    Mean deviation of (" +  (mean*scale).toFixed(3) + " ± " + (std*scale/Math.sqrt(numm)).toFixed(3) + ") x 10^5");
           expect(Math.abs(mean)).closeTo(0,thresh);
        });
    
}
});
