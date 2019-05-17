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
    }

    setNumberProcessors(num) {

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