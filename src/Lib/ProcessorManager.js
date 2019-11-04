import {defaultFor} from "../Utils/methods";
import * as $q from "q";
import BrowserWorker from './worker/browser.worker';
import CliWorker from './worker/cli.worker';

/**
 * The processor is responsible for hosting the worker and communicating with it.
 * @param $q - the angular promise creation object
 */
class Processor {
    constructor(node, worker) {
        this.flaggedForDeletion = false;
        this.node = node;
        this.$q = $q;
        if (worker == null) {
            if (node)
                this.worker = new CliWorker();
            else
                this.worker = new BrowserWorker();
        } else {
            this.worker = worker;
        }
        if (node) {
            try {
                this.worker.on('message', this.respond.bind(this));
            } catch (err) {
            }

        } else {
            try {
                this.worker.addEventListener('message', this.respond.bind(this), false);
            } catch (err) {
            }
        }
    }
    
    respond(e) {
        this.promise.resolve(e);
        this.promise = null;
        if (this.flaggedForDeletion) {
            this.worker = null;
        }
    };

    flagForDeletion() {
        this.flaggedForDeletion = true;
    };

    isIdle() {
        return this.promise == null;
    };

    workOnSpectra(data) {
        this.promise = this.$q.defer();
        if (this.node) {
            this.worker.send(data);
        } else {
            this.worker.postMessage(data);
        }
        return this.promise.promise;
    };
}


class ProcessorManager {
    constructor(node) {
        this.processing = true;
        this.node = defaultFor(node, false);
        this.getInactiveTemplates = null;
        this.processedCallback = null;
        this.processedCallbackContext = null;
        this.matchedCallback = null;
        this.matchedCallbackContext = null;

        this.processTogether = true;

        this.processors = [];
        this.jobs = [];
        this.priorityJobs = [];

        this.node = false;
    }
    
    setNode() {
        this.node = true;
    };
    
    setProcessTogether(processTogether) {
        this.processTogether = processTogether;
    };

    setInactiveTemplateCallback(fn) {
        this.getInactiveTemplates = fn;
    };

    toggleProcessing() {
        this.processing = !this.processing;
    };

    setProcessedCallback(fn, context) {
        this.processedCallback = fn;
        this.processedCallbackContext = context;
    };

    setMatchedCallback(fn, context) {
        this.matchedCallback = fn;
        this.matchedCallbackContext = context;
    };

    setNumberProcessors(num) {
        if (num < this.processors.length) {
            while (this.processors.length > num) {
                this.processors[0].flagForDeletion();
                this.processors.splice(0, 1);
            }
        } else if (num > this.processors.length) {
            while (this.processors.length < num) {
                this.processors.push(new Processor(this.node));
            }
        }
    };

    setWorkers(workers) {
        while (this.processors.length > 0) {
            this.processors[0].flagForDeletion();
            this.processors.splice(0, 1);
        }
        for (let i = 0; i < workers.length; i++) {
            this.processors.push(new Processor(true, workers[i]));
        }
    };

    processSpectra(spectra) {
        spectra.inactiveTemplates = this.getInactiveTemplates();
        spectra.node = this.node;
        const processor = this.getIdleProcessor();
        processor.workOnSpectra(spectra, this.node).then(function(result) {
            if (result.data.processing) {
                this.processedCallback.apply(this.processedCallbackContext, [result.data]);
            }
            if (result.data.matching) {
                this.matchedCallback.apply(this.matchedCallbackContext, [result.data]);
            }
            this.processJobs();
        }.bind(this), function(reason) {
            console.warn(reason);
        });
    };
    getNumberProcessors() {
        return this.processors.length;
    };
    getIdleProcessor() {
        for (let i = 0; i < this.processors.length; i++) {
            if (this.processors[i].isIdle()) {
                return this.processors[i];
            }
        }
        return null;
    };
    addSpectraListToQueue(spectraList) {
        this.jobs.length = 0;
        for (let i = 0; i < spectraList.length; i++) {
            this.jobs.push(spectraList[i]);
        }
        this.sortJobs();
        this.setRunning();
    };
    sortJobs() {
        this.jobs.sort(function(a,b) {
            if (a.qop === 0 && b.qop !== 0) {
                return -1;
            } else if (a.qop !== 0 && b.qop === 0) {
                return 1;
            } else {
                return a.id > b.id ? 1 : -1;
            }
        });
    };
    addToPriorityQueue(spectra, start) {
        spectra.isMatched = false;
        this.priorityJobs.push(spectra);
        if (start) {
            this.processJobs();
        }
    };
    hasIdleProcessor() {
        return this.getIdleProcessor() != null;
    };
    static shouldProcess(spectra) {
        return !spectra.isProcessing && !spectra.isProcessed;
    };
    static shouldMatch(spectra) {
        return spectra.isProcessed && !spectra.isMatching && (!spectra.isMatched || spectra.templateResults == null);
    };
    static shouldProcessAndMatch(spectra) {
        return !spectra.isProcessing && !spectra.isProcessed;
    };
    processJobs() {
        let findingJobs = true;
        while (findingJobs && this.hasIdleProcessor()) {
            findingJobs = this.processAJob();
        }
    };
    isPaused() {
        return !this.processing;
    };
    setPause() {
        this.processing = false;
    };
    setRunning() {
        this.processing = true;
        this.processJobs();
    };
    togglePause() {
        this.processing = !this.processing;
        if (this.processing) {
            this.processJobs();
        }
    };
    /**
     * Processes priority jobs processing then matching, and then normal
     * jobs processing and matching if processing is enabled.
     */
    processAJob() {
        let i;
        for (i = 0; i < this.priorityJobs.length; i++) {
            if (ProcessorManager.shouldProcess(this.priorityJobs[i])) {
                this.priorityJobs[i].isProcessing = true;
                this.processSpectra(this.priorityJobs[i].getProcessMessage());
                return true;
            }
        }
        for (i = 0; i < this.priorityJobs.length; i++) {
            if (ProcessorManager.shouldMatch(this.priorityJobs[i])) {
                this.priorityJobs[i].isMatching = true;
                this.processSpectra(this.priorityJobs[i].getMatchMessage());
                return true;
            }
        }
        if (this.processing) {
            if (this.processTogether) {
                for (i = 0; i < this.jobs.length; i++) {
                    if (ProcessorManager.shouldProcessAndMatch(this.jobs[i])) {
                        this.jobs[i].isProcessing = true;
                        this.processSpectra(this.jobs[i].getProcessingAndMatchingMessage());
                        return true;
                    }
                }
            } else {
                for (i = 0; i < this.jobs.length; i++) {
                    if (ProcessorManager.shouldProcess(this.jobs[i])) {
                        this.jobs[i].isProcessing = true;
                        this.processSpectra(this.jobs[i].getProcessMessage());
                        return true;
                    }
                }
                for (i = 0; i < this.jobs.length; i++) {
                    if (ProcessorManager.shouldMatch(this.jobs[i])) {
                        this.jobs[i].isMatching = true;
                        this.processSpectra(this.jobs[i].getMatchMessage());
                        return true;
                    }
                }
            }
        }
        return false;
    };
}

export default ProcessorManager;