import CookieManager from "./CookieManager";
import ResultsGenerator from "./ResultsGenerator";
import {saveAs} from 'file-saver';
import {templateManager} from "./TemplateManager";

class ResultsManager {
    constructor(store) {
        this.downloading = false;
        this.store = store;
        this.resultsGenerator = new ResultsGenerator(null, templateManager, false)
    }

    setHelio(val) {
        this.resultsGenerator.setHelio(val);
    };

    setCMB(val) {
        this.resultsGenerator.setCMB(val);
    };

    downloadResults() {
        if (this.downloading) {
            return;
        }
        console.log("Downloading results");
        this.downloading = true;
        if (!this.store.getState().personal.initials) {
            alert("Please enter your initials in the header and try again.");
            this.downloading = false;
            return;
        }

        this.resultsGenerator.data = this.store.getState().getData();
        const results = this.resultsGenerator.getResultsCSV(this.store.getState().personal.initials);
        console.log(results);
        if (results.length > 0) {
            const blob = new window.Blob([results], {type: 'text/plain'});
            saveAs(blob, this.getFilename());
        }
        this.downloading = false;
    };

    getFilename() {
        return this.store.getState().getData().fitsFileName + "_" + this.store.getState().personal.initials + ".mz";
    };

    getResultFromSpectra(spectra) {
        return this.resultsGenerator.getResultFromSpectra(spectra);
    };

    getLocalStorageResult(spectra) {
        return this.resultsGenerator.getLocalStorageResult(spectra);
    };

    getResultsCSV(initials) {
        return this.resultsGenerator.getResultsCSV(initials);
    };

    convertResultToMimicSpectra(result) {
        var helio = result["HelioCor"] == null ? null : result["HelioCor"];
        let spectra = new Spectra({id:result["ID"], name:result["Name"],
            ra:result["RA"], dec:result["DEC"],magnitude:result["Mag"], type:result["Type"], filename:result.filename, helio:helio});
        spectra.automaticBestResults = [{templateId: result["AutoTID"], z: result["AutoZ"], value: result["AutoXCor"]}];
        spectra.setComment(result["Comment"]);
        spectra.setQOP(parseInt(result["QOP"]));
        spectra.setVersion(result['v']);
        if (spectra.qop > 0) {
            spectra.manualTemplateID = result["FinTID"];
            spectra.manualRedshift = result["FinZ"];
        }
        return spectra;
    };
}

export default ResultsManager;