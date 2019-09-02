import {globalConfig} from "./config";
import {updateNumberMatched, updateNumberProcessed} from "../Stores/UI/Actions";
import {setShouldUpdateXcorData} from "../Stores/Detailed/Actions";

class SpectraManager {
    constructor(store) {
        this.store = store;
        
        this.finishedCallback = null;
        this.log = console;
        this.autoQOPs = false;
        this.pacer = null;
    }
    
    setFinishedCallback(fn) {
        this.finishedCallback = fn;
    };

    setAssignAutoQOPs (autoQOPs) {
        this.autoQOPs = autoQOPs;
    };

    getData() {
        return this.store.getState().s[this.store.getState().index].data;
    }

    setMatchedResultsNode(results) {
        const data = this.getData();
        
        this.setMatchedResults(results);
        const spectra = data.spectraHash[results.id];
        if (spectra == null || spectra.name !== results.name) return;
        spectra.processedLambda = null;
        spectra.processedContinuum = null;
        spectra.processedIntensity2 = null;
        spectra.processedVariance = null;
    };

    setMatchedResults(results) {
        const data = this.getData();

        const spectra = data.spectraHash[results.id];
        if (spectra == null || spectra.name !== results.name) return;
        spectra.automaticResults = results.results.coalesced;
        spectra.templateResults = results.results.templates;
        spectra.setVersion(globalConfig.marzVersion);
        spectra.autoQOP = results.results.autoQOP;
        spectra.automaticBestResults = results.results.coalesced;
        spectra.isMatching = false;
        spectra.isMatched = true;

        if (this.autoQOPs === true && spectra.qop === 0) {
            spectra.setQOP(results.results.autoQOP);
        }

        if (this.pacer == null) {
            this.log.debug("Matched " + results.id);
        } else {
            this.pacer.tick();
        }

        if (this.isFinishedMatching() && !this.isProcessing()) {
            if (this.finishedCallback) {
                this.finishedCallback();
            }
        }

        setTimeout(() => updateNumberMatched(), 0);
        setTimeout(() => setShouldUpdateXcorData(), 0);
    };
    setSpectra(spectraList) {
        const data = this.getData();
        data.spectra.length = 0;
        if (this.pacer != null) {
            this.pacer.total = spectraList.length;
        }
        data.spectraHash = {};
        for (let i = 0; i < spectraList.length; i++) {
            data.spectra.push(spectraList[i]);
            data.spectraHash[spectraList[i].id] = spectraList[i];
        }
    };
    setProcessedResults(results) {
        const data = this.getData();

        const spectra = data.spectraHash[results.id];
        if (spectra.name !== results.name) return;
        spectra.processedLambda = results.lambda;
        spectra.processedIntensity = results.intensity;
        spectra.processedContinuum = results.continuum;
        spectra.isProcessing = false;
        spectra.isProcessed = true;

        setTimeout(() => updateNumberProcessed(), 0)
    };
    isFinishedMatching() {
        return this.getNumberMatched() === this.getNumberTotal();
    };
    isProcessing() {
        return this.getNumberProcessed() < this.getNumberTotal();
    };
    getNumberMatched() {
        const data = this.getData();

        let num = 0;
        for (let i = 0; i < data.spectra.length; i++) {
            if (data.spectra[i].isMatched) {
                num++;
            }
        }
        return num;
    };

    getNumberProcessed() {
        const data = this.getData();

        let num = 0;
        for (let i = 0; i < data.spectra.length; i++) {
            if (data.spectra[i].isProcessed) {
                num++;
            }
        }
        return num;
    };

    getNumberTotal() {
        const data = this.getData();

        return data.spectra.length;
    };

    setPacer(pacer) {
        this.pacer = pacer;
    }
}

export default SpectraManager;