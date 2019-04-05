import ProcessorManager from "./ProcessorManager";
import CookieManager from "./CookieManager";
import TemplateManager from "./TemplateManager";
import SpectraController from "./SpectraController";

class Processor {
    constructor(store, resultsManager) {
        this.processorManager = new ProcessorManager(store);
        // todo: Maybe process should be false
        this.templateManager = new TemplateManager();

        // todo: refactor to top
        this.spectraManager = new SpectraController(store, resultsManager);

        this.processorManager.setInactiveTemplateCallback(() => this.templateManager.getInactiveTemplates());
        this.processorManager.setProcessedCallback(results => this.spectraManager.setProcessedResults(results));
        this.processorManager.setMatchedCallback(results => this.spectraManager.setMatchedResults(results));

        this.coreCookie = "numCores";
        this.processTogetherCookie = "processTogether";
        this.processTogether = CookieManager.registerCookieValue(this.processTogetherCookie, this.getDefaultProcessType());

        this.setDefaultNumberOfCores();

        this.processorManager.setProcessTogether(this.processTogether);
    }

    getDefaultProcessType() {
        return true;
    };

    getProcessTogether() {
        return this.processTogether;
    };

    setDefaultProcessTogether() {
        this.processTogether = CookieManager.setToDefault(this.processTogetherCookie);
    };

    setProcessTogether(value) {
        this.processTogether = value;
        CookieManager.setCookie(this.processTogetherCookie, this.processTogether);
        this.processorManager.setProcessTogether(value);
    };

    setDefaultNumberOfCores() {
        let defaultValue = 2;
        try {
            if (navigator != null && navigator.hardwareConcurrency != null) {
                defaultValue = navigator.hardwareConcurrency;
            }
        } catch (err) {
            log.warn("Could not fetch navigator.hardwareConcurrency");
        }
        const c = CookieManager.registerCookieValue(this.coreCookie, defaultValue);
        this.setNumberProcessors(c);
    };

    getNumberProcessors() {
        return this.processorManager.getNumberProcessors();
    };

    setNumberProcessors(num) {
        if (num < 1) {
            num = 1;
        } else if (num > 32) {
            num = 32;
        }
        CookieManager.setCookie(this.coreCookie, num);
        this.processorManager.setNumberProcessors(num);
    };

    toggleProcessing() {
        this.processorManager.toggleProcessing();
    };

    processSpectra(spectra) {
        this.processorManager.processSpectra(spectra);
    };

    addSpectraListToQueue(spectraList) {
        this.processorManager.addSpectraListToQueue(spectraList);
    };

    addToPriorityQueue(spectra, start) {
        this.processorManager.addToPriorityQueue(spectra, start);
    };

    shouldProcess(spectra) {
        return ProcessorManager.shouldProcess(spectra);
    };

    shouldMatch(spectra) {
        return ProcessorManager.shouldMatch(spectra);
    };

    shouldProcessAndMatch(spectra) {
        return ProcessorManager.shouldProcessAndMatch(spectra);
    };

    isPaused() {
        return this.processorManager.isPaused();
    };

    setPause() {
        this.processorManager.setPause();
    };

    setRunning() {
        this.processorManager.setRunning();
    };

    togglePause() {
        this.processorManager.togglePause();
    };

    sortJobs() {
        this.processorManager.sortJobs();
    };
}

export default Processor;