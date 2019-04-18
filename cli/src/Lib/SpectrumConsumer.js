import { defaultFor } from '../Utils/methods';
//==================
class SpectrumConsumer {
    constructor($q, global, log, processorService, resultGenerator, node) {
        this.node = defaultFor(node, false);
        this.isLoading = false;
        this.hasFitsFile = false;
        this.originalFilename = null;
        this.filename = null;
        this.MJD = null;
        this.date = null;
        this.header0 = null;
        this.epoch = null;
        this.radecsys = null;
        this.JD = null;
        this.longitude = null;
        this.latitude = null;
        this.altitude = null;
        this.resultGenerator = resultGenerator;
        this.spectra = null;
        this.primaryIndex = 0;
        this.numPoints = null;
        this.$q = $q;
        this.processorService = processorService;
        this.global = global;
        this.log = log;
        this.subscribed = [];
        this.subscribedContexts = [];
    }
    consume(provider, context) {
        const q = this.$q.defer();
        provider.provide(q).then(function (spectraList) {
            provider.isLoading = false;
            for (let i = 0; i < this.subscribed.length; i++) {
                this.subscribed[i].apply(this.subscribedContexts[i], [spectraList]);
            }
            q.resolve(spectraList);
        }.bind(this));
        return q.promise;
    }
    subscribeToInput(fn, context) {
        this.subscribed.push(fn);
        this.subscribedContexts.push(context);
    }
}

export default SpectrumConsumer;
