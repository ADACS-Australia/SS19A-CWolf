/**
 * The processor is responsible for hosting the worker and communicating with it.
 * @param $q - the angular promise creation object
 */
export class Processor {
    constructor($q, node, worker) {
        this.flaggedForDeletion = false;
        this.node = node;
        this.$q = $q;
        if (worker == null) {
            this.worker = new Worker('./worker.js');
        }
        else {
            this.worker = worker;
        }
        if (node) {
            try {
                this.worker.on('message', this.respond.bind(this));
            }
            catch (err) { }
        }
        else {
            try {
                this.worker.addEventListener('message', this.respond.bind(this), false);
            }
            catch (err) { console.log("errorr "+err);}
        }
    }
    respond(e) {
        console.log("Processor responding and resolving promise:");
        console.log(e);
        this.promise.resolve(e);
        this.promise = null;
        if (this.flaggedForDeletion) {
            this.worker = null;
        }
    }
    ;
    flagForDeletion() {
        this.flaggedForDeletion = true;
    }
    ;
    isIdle() {
        return this.promise == null;
    }
    ;
    workOnSpectra(data) {
        this.promise = this.$q.defer();
        if (this.node) {
            this.worker.send(data);
        }
        else {
            this.worker.postMessage(data);
        }
        return this.promise.promise;
    }
    ;
}
