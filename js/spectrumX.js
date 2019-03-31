fs = require('fs');
classes = require('./classes.js');
helio = require('./helio.js');
class SpectrumX {
    constructor(name) {
        this.id = "";
        this.name = name;
        this.rightAscension = null;
        this.declination = null;
        this.magnitude = null;
        this.type = "";
        this.wavelength = [];
        this.intensity = [];
        this.variance = [];
        this.sky = [];
        this.helio = null;
        this.cmb = null;

        //
        this.longitude = null;
        this.latitude = null;
        this.altitude = null;
        this.juliandate = "";
        this.epoch = ""
        this.radecsys = "";
    }
    fromDictionary(dict)
    {
        if (dict["wavelength"]) {
            this.wavelength = dict["wavelength"];
        }
        if (dict["intensity"]) {
            this.intensity = dict["intensity"];
        }
        if (dict["variance"]) {
            this.variance = dict["variance"];
        }
        if (dict["id"]) {
            this.name = dict["id"];
        }
        if (dict["name"]) {
            this.name = dict["name"];
        }
        if (dict["type"]) {
            this.type = dict["type"];
        }
        if (dict["helio"]) {
            this.helio = dict["helio"];
            if (this.isDict(this.helio)) {
                this.rightAscension = this.helio["ra"];
                this.declination = this.helio["dec"];
                this.longitude = this.helio["longitude"];
                this.latitude = this.helio["latitude"];
                this.altitude = this.helio["altitude"];
                this.juliandate = this.helio["juliandate"];
                this.epoch = this.helio["epoch"];
                this.radecsys = this.helio["radecsys"];
            }
        }
        if (dict["cmb"]) {
            this.cmb = dict["cmb"];
            if (this.isDict(this.cmb)) {
                this.rightAscension = this.cmb["ra"];
                this.declination = this.cmb["dec"];
                this.epoch = this.cmb["epoch"];
                this.radecsys = this.cmb["radecsys"];
            }
        }
    }
    saveasJSON(filename) {
        fs.writeFile(filename, JSON.stringify(this,null,4), function (err) {
            //if (err) {
            //    return console.error(err);
            //}
            //debug("File saved to " + filename);
        });
    }
    fromJSON(filename) {
        var fileData = fs.readFileSync(filename);
        var dict = JSON.parse(fileData);
        this.fromDictionary(dict);
    }
    provide(q) {
        var spectra = new Spectra(this.id, this.wavelength, this.intensity, this.variance, this.sky,
             this.name, this.rightAscension, this.declination, this.magnitude, this.type, null, this.getHelio(), this.getCMB(), false);
        var spectraList = [spectra];
        q.resolve(spectraList); 
        return q.promise;    
    }
    // Description properties
    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getRightAscension() {
        return this.rightAscension;
    }
    setRightAscension(rightAscension) {
        this.rightAscension = rightAscension;
    }
    getDeclination() {
        return this.declination;
    }
    setDeclination(declination) {
        this.declination = declination;
    }
    getMagnitude() {
        return this.magnitude;
    }
    setMagnitude(magnitude) {
        this.magnitude = magnitude;
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
    // Spectra data arrays
    getWavelength() {
        return this.wavelength;
    }  
    setWavelength(wavelength) {
        this.wavelength = wavelength;
    }
    getIntensity() {
        return this.intensity;
    }  
    setIntensity(intensity) {
        this.intensity = intensity;
    }
    getVariance() {
        return this.variance;
    }  
    setVariance(variance) {
        this.variance = variance;
    }
    getSky() {
        return this.sky;
    }  
    setSky(sky) {
        this.sky = sky;
    }
    getHelio() {
        if (this.helio) {
            if (this.isDict(this.helio)) {
                return getHeliocentricVelocityCorrection(
                    this.getRightAscension()  * 180 / Math.PI,
                    this.getDeclination() * 180 / Math.PI,
                    this.juliandate, this.longitude, this.latitude, this.altitude, this.epoch, this.radecsys);
            }
        }
        return this.helio
    }
    getCMB() {
        if (this.cmb) {
            if (this.isDict(this.cmb)) {
                return getCMBCorrection(
                    this.getRightAscension()  * 180 / Math.PI,
                    this.getDeclination() * 180 / Math.PI,
                    this.epoch, this.radecsys
                )
            }
        }
        return this.cmb;
    }
    // Good enough method to tell if v is a dictionary or not
    isDict(v) {
        return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
    }
}

module.exports = function() {
    this.SpectrumX = SpectrumX;
};
