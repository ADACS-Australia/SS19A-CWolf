import Spectra from "../Lib/Spectra";
import SpectrumX from "../Lib/spectrumX"
class SpectrumJSONProvider {
    constructor() {
        this.provision = [];
    }
    fromJSON(dict) {
        try {
        this.provision.length = 0;
        if (Array.isArray(dict)) {
            for (let i=0; i < dict.length; i++) {
                const thisSpectrum = new SpectrumX(i.toString());
                thisSpectrum.fromDictionary(dict[i]);
                thisSpectrum.setId(i+1);
                this.provision.push(thisSpectrum)
            }
        } else {
            const thisSpectrum = new SpectrumX("json");
            thisSpectrum.fromDictionary(dict);
            thisSpectrum.setId(1);
            this.provision.push(thisSpectrum)
        }
        } catch (err) {
            console.log("error "+err);
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
            const spectra = new Spectra({id:me.properties.id, wavelength:me.wavelength, intensity:me.intensity, variance:me.variance, sky:me.sky,
                name:me.properties.name, ra:me.properties.ra, dec:me.properties.dec, magnitude:me.properties.magnitude, type:me.properties.type, helio:me.getHelio(), cmb: me.getCMB()});
            spectraList.push(spectra)
        }
        q.resolve(spectraList); 
        return q.promise;    
    }
}

export default SpectrumJSONProvider;
