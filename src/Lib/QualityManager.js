class QualityManager {
    constructor(store) {
        this.store = store;

        this.steps = 10000;
        this.numSpectra = 1;
    }

    getQuality() {
        return this.store.getState().getUi().quality;
    }
    
    static getType(qop) {
        switch (qop) {
            case 4: return "success";
            case 3: return "info";
            case 2: return "warning";
            case 1: return "danger";
            default: return "default";
        }
    };

    setMax(max) {
        const quality = this.getQuality();

        quality.max = 1 + 10000;
        this.numSpectra = max;
    };

    clear() {
        const quality = this.getQuality();

        quality.bars = [];
        quality.barHash = {};
    };

    changeSpectra(oldQop, newQop) {
        if (oldQop === newQop) {
            return;
        }
        if (oldQop !== 0) {
            this.addResult(oldQop, -1);
        }
        this.addResult(newQop);
    };

    addResult(qop, increment) {
        const quality = this.getQuality();

        if (qop === 0) { return; }
        if (typeof increment === 'undefined') increment = 1;
        if (quality.barHash["" + qop] == null) {
            if (increment > 0) {
                const res = {
                    qop: qop,
                    type: QualityManager.getType(qop),
                    value: 1.0 * this.steps / this.numSpectra,
                    label: increment
                };
                quality.barHash["" + qop] = res;
                quality.bars.push(res);
                quality.bars.sort((a,b) => (a.qop % 6) < (b.qop % 6));
            }
        } else {
            quality.barHash["" + qop].value += 1.0 * this.steps * increment / this.numSpectra;
            quality.barHash["" + qop].label += increment;
        }
    }
}

export default QualityManager;