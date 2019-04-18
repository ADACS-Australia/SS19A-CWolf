import Spectra from './Spectra';
import { globalConfig } from './config';
import { describe } from '../Utils/methods';
class SpectraManager {
    constructor(data, log) {
        this.data = data;
        this.finishedCallback = null;
        this.log = log;
        this.autoQOPs = false;
        this.pacer = null;
    }
    setFinishedCallback(fn) {
        this.finishedCallback = fn;
    }
    setAssignAutoQOPs(autoQOPs) {
        this.autoQOPs = autoQOPs;
    }
    setMatchedResultsNode(results) {
        this.setMatchedResults(results);
        const spectra = this.data.spectraHash[results.id];
        if (spectra == null || spectra.name != results.name)
            return;
        spectra.processedLambda = null;
        spectra.processedContinuum = null;
        spectra.processedIntensity2 = null;
        spectra.processedVariance = null;
    }
    setMatchedResults(results) {
        let spectra = this.data.spectraHash[results.id];
        if (spectra == null || spectra.name != results.name)
            return;
        spectra.automaticResults = results.results.coalesced;
        spectra.templateResults = results.results.templates;
        spectra.setVersion(globalConfig.marzVersion);
        spectra.autoQOP = results.results.autoQOP;
        spectra.automaticBestResults = results.results.coalesced;
        spectra.isMatching = false;
        spectra.isMatched = true;
        if (this.autoQOPs == true && spectra.qop == 0) {
            spectra.setQOP(results.results.autoQOP);
        }
        if (this.pacer == null) {
            this.log.debug("Matched " + results.id);
        }
        else {
            this.pacer.tick();
        }
        if (this.isFinishedMatching() && !this.isProcessing()) {
            if (this.finishedCallback) {
                this.finishedCallback();
            }
        }
    }
    setSpectra(spectraList) {
        this.data.spectra.length = 0;
        if (this.pacer != null) {
            this.pacer.total = spectraList.length;
        }
        this.data.spectraHash = {};
        for (let i = 0; i < spectraList.length; i++) {
            this.data.spectra.push(spectraList[i]);
            this.data.spectraHash[spectraList[i].id] = spectraList[i];
        }
    }
    setProcessedResults(results) {
        const spectra = this.data.spectraHash[results.id];
        if (spectra.name != results.name)
            return;
        spectra.processedLambda = results.lambda;
        spectra.processedIntensity = results.intensity;
        spectra.processedContinuum = results.continuum;
        spectra.isProcessing = false;
        spectra.isProcessed = true;
    }
    isFinishedMatching() {
        return this.getNumberMatched() == this.getNumberTotal();
    }
    isProcessing() {
        return this.getNumberProcessed() < this.getNumberTotal();
    }
    getNumberMatched() {
        let num = 0;
        for (let i = 0; i < this.data.spectra.length; i++) {
            if (this.data.spectra[i].isMatched) {
                num++;
            }
        }
        return num;
    }
    getNumberProcessed() {
        let num = 0;
        for (let i = 0; i < this.data.spectra.length; i++) {
            if (this.data.spectra[i].isProcessed) {
                num++;
            }
        }
        return num;
    }
    getNumberTotal() {
        return this.data.spectra.length;
    }
    setPacer(pacer) {
        this.pacer = pacer;
    }
}

export default SpectraManager;
