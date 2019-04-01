import CookieManager from "./CookieManager";
import ResultsGenerator from "./ResultsGenerator";

class ResultsManager {
    constructor(templatesService) {
        this.resultsGenerator = new ResultsGenerator(templatesService);
        this.downloading = false;

        this.numAutomaticCookie = "numAutomatic";

        this.setNumAutomatic(CookieManager.registerCookieValue(this.numAutomaticCookie, 1));
    }
    
    setHelio(val) {
        this.resultsGenerator.setHelio(val);
    };

    setCMB(val) {
        this.resultsGenerator.setCMB(val);
    };

    setNumAutomatic(num) {
        if (num <= 5) {
            this.resultsGenerator.setNumAutomatic(num);
            CookieManager.setCookie(this.numAutomaticCookie, num);
        }
    };

    getNumAutomatic() {
        return this.resultsGenerator.numAutomatic;
    };

    downloadResults() {
        if (this.downloading) {
            return;
        }
        log.debug("Downloading results");
        this.downloading = true;
        personalService.ensureInitials().then(function() {
            var results = this.resultsGenerator.getResultsCSV();
            console.log(results);
            if (results.length > 0) {
                var blob = new window.Blob([results], {type: 'text/plain'});
                saveAs(blob, this.getFilename());
            }
            this.downloading = false;
        }, function() {
            this.downloading = false;
        });
    };

    getFilename() {
        return global.data.fitsFileName + "_" + personalService.getInitials() + ".mz";
    };

    getResultFromSpectra(spectra) {
        return this.resultsGenerator.getResultFromSpectra(spectra);
    };

    getLocalStorageResult(spectra) {
        return ResultsGenerator.getLocalStorageResult(spectra);
    };

    getResultsCSV() {
        log.debug("Getting result CSV");
        return this.resultsGenerator.getResultsCSV(personalService.getInitials());
    };

    convertResultToMimicSpectra(result) {
        var helio = result["HelioCor"] == null ? null : result["HelioCor"];
        var spectra = new Spectra(result["ID"], null, null, null, null, result["Name"],
            result["RA"], result["DEC"],result["Mag"], result["Type"], result.filename, helio);
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