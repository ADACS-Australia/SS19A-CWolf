import CookieManager from "./CookieManager";
import {defaultFor} from "../Utils/methods";
import SpectraManager from "./SpectraManager"
import QualityManager from "./QualityManager";
import LocalStorageManager from "./LocalStorageManager";
import {
    setActive,
    setTemplateId,
    updateNumberMatched,
    updateNumberProcessed,
    updateRedShift
} from "../Stores/UI/Actions";

class SpectraController {
    constructor(store, resultsManager) {
        this.store = store;

        this.spectraManager = new SpectraManager(store);
        this.qualityManager = new QualityManager(store);
        this.localStorageManager = new LocalStorageManager(store);
        this.resultsManager = resultsManager;
    }

    hasSpectra() {
        return this.getData().spectra.length > 0;
    };

    getNumberMatched() {
        return this.spectraManager.getNumberMatched();
    };

    getNumberProcessed() {
        return this.spectraManager.getNumberProcessed();
    };

    isFinishedMatching() {
        return this.getNumberMatched() === this.getNumberTotal();
    };

    isMatching() {
        return !this.isProcessing() && (this.getNumberMatched() < this.getNumberTotal());
    };

    isProcessing() {
        return this.getNumberProcessed() < this.getNumberTotal();
    };

    getNumberTotal() {
        return this.spectraManager.getNumberTotal();
    };

    setNextSpectra(index) {
        const data = this.getData();
        const ui = this.getUI();
        if (ui.detailed.onlyQOP0) {
            const original = ui.active;
            let notBackToStart = true;
            let s = original;
            while (notBackToStart) {
                s = this.getNextSpectra(s, true);
                if (s.qop === 0) {
                    this.setActive(s);
                    return true;
                } else if (s === original) {
                    notBackToStart = false;
                }
            }
            return false;
        } else {
            this.setActive(this.getNextSpectra(ui.active));
            return true;
        }
    };

    setActive(spectra, addToHistory) {
        const data = this.getData();
        const ui = this.getUI();

        if (typeof addToHistory === 'undefined') addToHistory = true;
        if (spectra == null) {
            return;
        }

        if (addToHistory) {
            data.history.push(spectra);
            if (data.history.length > 1000) {
                data.history.shift();
            }
        } else {
            data.history.pop();
        }

        console.log("Setting active", spectra)

        // Set the active spectra
        setActive(spectra);

        let id = spectra.getFinalTemplateID();
        let z = spectra.getFinalRedshift();
        if (spectra.getMerges().length > 0) {
            const merges = spectra.getMerges();
            const mergeIndex = ui.mergeDefault;
            id = merges[mergeIndex].tid;
            z = merges[mergeIndex].z;
        }

        if (id != null && z != null) {
            setTemplateId(id);
            updateRedShift(z);
        } else {
            setTemplateId("0");
            updateRedShift("0");
        }
    };

    setSpectra(spectraList) {
        const data = this.getData();
        const ui = this.getUI();
        this.spectraManager.setSpectra(spectraList);

        this.qualityManager.setMax(spectraList.length);
        this.qualityManager.clear();

        for (let i = 0; i < spectraList.length; i++) {
            const result = this.localStorageManager.loadSpectra(spectraList[i]);
            if (result != null) {
                this.loadLocalStorage(spectraList[i], result);
            }
        }

        if (data.spectra.length > 0) {
            if (ui.detailed.onlyQOP0) {
                this.setActive(data.spectra[data.spectra.length - 1]);
                if (!this.setNextSpectra()) {
                    this.setActive(data.spectra[0]);
                }
            } else {
                this.setActive(data.spectra[0]);
            }
        }
    };

    loadLocalStorage(spectra, vals) {
        spectra.isMatched = true;

        spectra.setQOP(parseInt(vals['qop']));
        this.qualityManager.addResult(spectra.qop);
        spectra.manualTemplateID = vals['id'];
        spectra.manualRedshift = parseFloat(vals['z']);
        spectra.setComment(vals['com']);

        setTimeout(() => updateNumberMatched(), 0)
    };

    getSpectra(id) {
        const data = this.getData();

        if (id == null) return data.spectra;
        return data.spectraHash[id];
    };

    getNextSpectra(spectra, loop) {
        const data = this.getData();

        if (typeof loop === 'undefined') loop = false;
        if (spectra == null) return null;
        for (let i = 0; i < data.spectra.length; i++) {
            if (data.spectra[i] === spectra) {
                if (loop === false && i + 1 === data.spectra.length) {
                    return null;
                } else {
                    return data.spectra[(i + 1) % data.spectra.length];
                }
            }
        }
        return null;
    };

    getPreviousSpectra(spectra) {
        const data = this.getData();

        if (spectra == null) return;
        for (let i = 1; i < data.spectra.length; i++) {
            if (data.spectra[i] === spectra) {
                return data.spectra[i - 1];
            }
        }
        return null;
    };

    setProcessedResults(results) {
        const data = this.getData();
        const spectra = data.spectraHash[results.id];
        console.debug("Processed " + results.id);
        if (spectra.name !== results.name) return;
        this.spectraManager.setProcessedResults(results);
        spectra.processedLambdaPlot = results.lambda;
        spectra.processedVariance = results.variance;
        spectra.processedVariancePlot = results.processedVariancePlot;
        spectra.processedIntensity = results.intensity;
        if (!this.isProcessing() && this.isFinishedMatching()) {
            if (data.fits.length > 0) {
                data.fits.shift();
            }
        }
    };

    getUI() {
        return this.store.getState().s[this.store.getState().index].ui;
    }

    getData() {
        return this.store.getState().s[this.store.getState().index].data;
    }

    setMatchedResults(results) {
        const data = this.getData();
        const ui = this.getUI();

        const spectra = data.spectraHash[results.id];
        const oldqop = spectra.qop;
        const prior = spectra.automaticResults;

        this.spectraManager.setMatchedResults(results);

        if (this.spectraManager.autoQOPs && oldqop === 0) {
            this.qualityManager.changeSpectra(oldqop, spectra.autoQOP);
        }

        spectra.processedIntensity2 = results.results.intensity2;

        if (this.saveAutomatically) {
            this.localStorageManager.saveSpectra(spectra, this.resultsManager);
        }

        if (this.isFinishedMatching() && !this.isProcessing() && prior == null) {
            if (this.downloadAutomatically) {
                console.log("Downloading from matching");
                this.resultsManager.downloadResults();
            }
        }

        if (ui.active === spectra) {
            this.setActive(spectra);
        }

        if (this.isFinishedMatching()) {
            if (data.fits.length > 0) {
                data.fits.shift();
            }
        }
    };

    setManualResults(spectra, templateId, redshift, qop) {
        spectra.manualTemplateID = templateId;
        spectra.manualRedshift = parseFloat(redshift);
        const oldQop = spectra.qop;
        spectra.setQOP(qop);
        this.qualityManager.changeSpectra(oldQop, qop);
        if (saveAutomatically) {
            localStorageManager.saveSpectra(spectra);
        }
    };

    getBestResults(resultsList) {
        const best = [{
            templateId: resultsList[0].id,
            z: resultsList[0].top[0].z,
            value: resultsList[0].top[0].value
        }];
        const threshold = 0.05;
        let i;
        const merged = [];
        for (i = 0; i < resultsList.length; i++) {
            const tr = resultsList[i];
            for (let j = 0; j < tr.top.length; j++) {
                const trr = tr.top[j];
                merged.push({id: tr.id, z: trr.z, value: trr.value});
            }
        }
        merged.sort(function(a,b) {
            return a.value - b.value;
        });

        i = 0;
        while (best.length < 10) {
            let valid = true;
            for (let k = 0; k < best.length; k++) {
                if (best[k].templateId === merged[i].id && Math.abs(merged[i].z - best[k].z) < threshold) {
                    valid = false;
                }
            }
            if (valid) {
                best.push({templateId: merged[i].id, z: merged[i].z, value: merged[i].value});
            }
            i++;
        }
        return best;
    }
}

export default SpectraController;