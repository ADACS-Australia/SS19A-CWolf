import Spectra from "../Lib/Spectra";
import SpectrumX from "../Lib/spectrumX"
class SpectrumJSONProvider {
    constructor() {
        this.provision = [];
    }
    fromJSON(dict) {
        this.provision.length = 0;
        if (Array.isArray(dict)) {
            for (let i=0; i < dict.length; i++) {
                const thisSpectrum = new SpectrumX(i.toString());
                thisSpectrum.fromDictionary(dict[i]);
                this.provision.push(thisSpectrum)
            }
        } else {
            const thisSpectrum = new SpectrumX("json");
            thisSpectrum.fromDictionary(dict);
            this.provision.push(thisSpectrum)
        }
    }
    getDoHelio() {
        return this.provision[0].getHelio();
    }
    getDoCMB() {
        return this.provision[0].getCMB();
    }
    provide(q) {
        const spectraList = [];
        for (let i=0; i < this.provision.length; i++) {
            const me = this.provision[i];
            const spectra = new Spectra(me.properties.id, me.wavelength, me.intensity, me.variance, me.sky,
                me.properties.name, me.properties.ra, me.properties.dec, me.properties.magnitude, me.properties.type, null, me.getHelio(), me.getCMB(), false);
            spectraList.push(spectra)
        }
        q.resolve(spectraList); 
        return q.promise;    
    }
}

export default SpectrumJSONProvider;
