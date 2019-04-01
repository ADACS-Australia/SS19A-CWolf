import {defaultFor, normaliseViaShift, removeNaNs} from "../Utils/methods";
import {globalConfig} from "./config";

class Spectra {
    /** The spectra class is used to store information about each spectra loaded into marz
     * @param id - the fibre id
     * @param lambda - an array of wavelengths in Angstroms
     * @param intensity - an array of flux intensities
     * @param variance - an array of flux intensity variance
     * @param sky - an array of sky flux intensity, if it exists
     * @param name - the object's name
     * @param ra - the object's right ascension
     * @param dec - the object's declination
     * @param magnitude - the object's magnitude (extracted from fits file, not band explicit)
     * @param type - the object's type. Used to generate the prior for OzDES matching
     * @param filename - the filename this spectra belonged to. Used for storing data behind the scenes
     * @param helio - km/s heliocentric velocity correction
     * @param cmb - km/s 3K background velocity correction
     * @constructor
     */
    constructor(id, lambda, intensity, variance, sky, name, ra, dec, magnitude, type, filename, helio, cmb, node) {
        this.version = globalConfig.marzVersion;
        this.helio = defaultFor(helio, null);
        this.cmb = defaultFor(cmb, null);
        this.node = defaultFor(node, false);
        this.id = id;
        this.name = name;
        this.ra = ra;
        this.dec = dec;
        this.magnitude = magnitude;
        this.type = type;
        this.filename = filename;
        this.lambda = lambda;
        this.intensity = intensity;
        this.variance = variance;
        this.variancePlot = variance;
        this.comment = "";
        this.compute = true;
        if (variance != null && !this.node) {
            this.variancePlot = variance.slice();
            removeNaNs(this.variancePlot);
            normaliseViaShift(this.variancePlot, 0, globalConfig.varianceHeight, null);
        }
        this.autoQOP = null;
        this.sky = sky;
        this.intensitySubtractPlot = null;

        this.isProcessed = false;
        this.isProcessing = false;
        this.isMatched = false;
        this.isMatching = false;

        if (this.intensity != null && !this.node) {
            this.intensityPlot = this.intensity.slice();
            this.processedLambdaPlot = null;
        }

        this.processedLambda = null;
        this.processedContinuum = null;
        this.processedIntensity = null;
        this.processedVariance = null;

        this.templateResults = null;
        this.automaticResults = null;
        this.automaticBestResults = null;
        this.manualRedshift = null;
        this.manualTemplateID = null;

        this.merges = [];
        this.mergedUpdated = false;

        this.qopLabel = "";
        this.setQOP(0);
        this.imageZ = null;
        this.imageTID = null;
        this.image = null;
    }

    getHash() {
        return "" + this.id + this.name + this.getFinalRedshift() + this.getFinalTemplateID() + this.isProcessed + this.isMatched;
    };

    addMergeResult(initial, z, tid, qop, quasar, comment) {
        this.merges.push({
            z: z,
            tid: "" + tid,
            initials: initial,
            qop: qop,
            quasar: quasar,
            qopLabel: Spectra.getLabelForQOP(qop)
        });
        if (this.comment !== "") {
            this.comment += " | ";
        }
        this.comment += initial + " " + tid + " " + z.toFixed(5) + " " + qop + " {" + comment + "}";

    };

    setCompute(compute) {
        this.compute = compute;
        if (!compute) {
            this.isProcessed = true;
            this.isMatched = true;
        }
    };

    setVersion(version) {
        this.version = version;
    };

    static getLabelForQOP(qop) {
        if (qop >= 6) {
            return  "label-primary";
        } else if (qop >= 4) {
            return "label-success";
        } else if (qop >= 3) {
            return "label-info";
        } else if (qop >= 2) {
            return "label-warning";
        } else if (qop >= 1) {
            return "label-danger";
        } else {
            return "label-default";
        }
    };

    setQOP(qop) {
        if (isNaN(qop)) {
            return;
        }
        this.qop = qop;
        // Best coding practise would have this UI logic outside of this class
        this.qopLabel = Spectra.getLabelForQOP(qop);
        this.mergedUpdated = true;
    };

    setQOPMerge(qop) {
        this.setQOP(qop);
        this.mergedUpdated = false;
    };

    getRA() {
        return this.ra * 180 / Math.PI;
    };

    getDEC() {
        return this.dec * 180 / Math.PI;
    };

    getImage(drawingService) {
        if (this.getFinalRedshift() !== this.imageZ || this.imageTID !== this.getFinalTemplateID() || this.image == null) {
            this.imageTID = this.getFinalTemplateID();
            this.imageZ = this.getFinalRedshift();
            this.image = this.getImageUrl(drawingService);
        }
        return this.image;

    };

    getComment() {
        return this.comment;
    };

    setComment(comment) {
        this.comment = comment;
    };

    getImageUrl(drawingService) {
        var canvas = document.createElement('canvas');
        var ratio = window.devicePixelRatio || 1.0;
        var width = 318;
        var height = 118;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        var ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);
        drawingService.drawOverviewOnCanvas(this, canvas, width, height);
        return canvas.toDataURL();
    };

    getTemplateResults() {
        return this.templateResults;
    };

    getIntensitySubtracted() {
        if (this.intensitySubtractPlot == null) {
            if (this.intensityPlot == null) {
                return null;
            } else {
                this.intensitySubtractPlot = this.intensity.slice();
                subtractPolyFit(this.lambda, this.intensitySubtractPlot);
                return this.intensitySubtractPlot;
            }
        } else {
            return this.intensitySubtractPlot;
        }
    };

    hasRedshift() {
        return this.automaticBestResults != null || this.manualRedshift != null;
    };

    getAutomaticResults() {
        return this.automaticBestResults;
    };

    getBestAutomaticResult() {
        if (this.automaticBestResults != null) {
            return this.automaticBestResults[0];
        }
        return null;
    };

    getMerges() {
        return this.merges;
    };

    getMatches(number) {
        if (number == null) return this.automaticBestResults;
        if (this.automaticBestResults == null) return [];
        return this.automaticBestResults.slice(0, number);
    };

    getManual() {
        if (this.manualRedshift == null) return null;
        return {templateId: this.manualTemplateID, z: this.manualRedshift};
    };

    getNumBestResults() {
        if (this.automaticBestResults == null) return 0;
        return this.automaticBestResults.length;
    };

    hasMatches() {
        return (this.automaticBestResults != null && this.automaticBestResults.length > 1);
    };

    getFinalRedshift() {
        if (this.manualRedshift != null) {
            return this.manualRedshift;
        } else if (this.automaticBestResults != null) {
            return this.automaticBestResults[0].z;
        } else {
            return null;
        }
    };

    hasRedshiftToBeSaved() {
        return this.getFinalRedshift() != null;
    };

    getFinalTemplateID() {
        if (this.manualRedshift) {
            return this.manualTemplateID;
        } else if (this.automaticBestResults) {
            return this.automaticBestResults[0].templateId;
        } else {
            return null;
        }
    };

    getProcessingAndMatchingMessage() {
        return {
            processing: true,
            matching: true,
            id: this.id,
            name: this.name,
            lambda: this.lambda,
            type: this.type,
            intensity: this.intensity,
            variance: this.variance,
            helio: this.helio,
            cmb: this.cmb
        }
    };

    getProcessMessage() {
        return {
            processing: true,
            id: this.id,
            name: this.name,
            lambda: this.lambda,
            intensity: this.intensity,
            variance: this.variance,
            helio: this.helio,
            cmb: this.cmb
        };
    };

    getMatchMessage() {
        return {
            matching: true,
            id: this.id,
            name: this.name,
            type: this.type,
            lambda: this.processedLambda,
            intensity: this.processedIntensity,
            variance: this.processedVariance,
            helio: this.helio,
            cmb: this.cmb
        };
    };
}

export default Spectra;