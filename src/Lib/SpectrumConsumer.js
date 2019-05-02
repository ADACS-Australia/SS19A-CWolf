import { defaultFor } from '../Utils/methods';
import * as $q from "q";
//==================
class SpectrumConsumer {
    constructor(processorService, resultGenerator, node) {
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
        this.processorService = processorService;
        this.global = null;//TODO? global;
        this.log = console;
        this.subscribed = [];
    }
    consume(provider, context) {
        const q = $q.defer();
        provider.provide(q).then(function (spectraList) {
            provider.isLoading = false;
            for (let i = 0; i < this.subscribed.length; i++) {
                this.subscribed[i](spectraList);
            }
            q.resolve(spectraList);
        }.bind(this));
        return q.promise;
    }
    subscribeToInput(fn, context) {
        this.subscribed.push(fn);
    }
}

export default SpectrumConsumer;
