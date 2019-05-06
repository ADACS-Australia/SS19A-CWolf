import fs from 'fs';
import {Spectra} from "../Lib/Spectra";
import {getHeliocentricVelocityCorrection, getCMBCorrection} from '../Utils/helio'
class SpectrumX {
    constructor(name) {
        this.wavelength = [];
        this.intensity = [];
        this.variance = [];
        this.sky = [];
        this.dohelio = false;
        this.docmb = false;

        //
        this.properties = {};
        this.properties.id = "";
        this.properties.name = name;
        this.properties.ra = null;
        this.properties.dec = null;
        this.properties.magnitude = null;
        this.properties.type = "";
        this.properties.longitude = null;
        this.properties.longitude = null;
        this.properties.latitude = null;
        this.properties.altitude = null;
        this.properties.juliandate = "";
        this.properties.epoch = ""
        this.properties.radecsys = "";
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
        if (dict["sky"]) {
            this.sky = dict["sky"];
        }
        if (dict["dohelio"]) {
            this.dohelio = dict["dohelio"];
        }
        if (dict["docmb"]) {
            this.docmb = dict["docmb"];
        }

        if (dict["properties"]) {
            this.properties = dict["properties"];
            // TODO: The code below is not required (unless I want some kind of checking here)
            if (this.properties["id"]) {
                this.properties.id = this.properties["id"];
            }
            if (this.properties["name"]) {
                this.properties.name = this.properties["name"];
            }
            if (this.properties["type"]) {
                this.properties.type = this.properties["type"];
            }
            if (this.properties["ra"]) {
                this.properties.ra = this.properties["ra"];
            }
            if (this.properties["dec"]) {
                this.properties.dec = this.properties["dec"];
            }
            if (this.properties["magnitude"]) {
                this.properties.magnitude = this.properties["magnitude"];
            }
            if (this.properties["longitude"]) {
                this.properties.longitude = this.properties["longitude"];
            }
            if (this.properties["latitude"]) {
                this.properties.latitude = this.properties["latitude"];
            }
            if (this.properties["altitude"]) {
                this.properties.altitude = this.properties["altitude"];
            }
            if (this.properties["juliandate"]) {
                this.properties.juliandate = this.properties["juliandate"];
            }
            if (this.properties["epoch"]) {
                this.properties.epoch = this.properties["epoch"];
            }
            if (this.properties["radecsys"]) {
                this.properties.radecsys = this.properties["radecsys"];
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
        var spectra = new Spectra(this.properties.id, this.wavelength, this.intensity, this.variance, this.sky,
             this.properties.name, this.properties.ra, this.properties.dec, this.properties.magnitude, this.properties.type, null, this.getHelio(), this.getCMB(), false);
        var spectraList = [spectra];
        q.resolve(spectraList); 
        return q.promise;    
    }
    // Description properties
    getId() {
        return this.properties.id;
    }
    setId(id) {
        this.properties.id = id;
    }
    getName() {
        return this.properties.name;
    }
    setName(name) {
        this.properties.name = name;
    }
    getRightAscension() {
        return this.properties.ra;
    }
    setRightAscension(rightAscension) {
        this.properties.ra = rightAscension;
    }
    getDeclination() {
        return this.properties.dec;
    }
    setDeclination(declination) {
        this.properties.dec = declination;
    }
    getMagnitude() {
        return this.properties.magnitude;
    }
    setMagnitude(magnitude) {
        this.properties.magnitude = magnitude;
    }
    getType() {
        return this.properties.type;
    }
    setType(type) {
        this.properties.type = type;
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
    getDoHelio() {
        return this.dohelio;
    }
    getHelio() {
        if (this.dohelio) {
            return getHeliocentricVelocityCorrection(
                this.getRightAscension()  * 180 / Math.PI,
                this.getDeclination() * 180 / Math.PI,
                this.properties.juliandate, this.properties.longitude, this.properties.latitude, this.properties.altitude, this.properties.epoch, this.properties.radecsys);
        }
        return null;
    }
    getDoCMB() {
        return this.docmb;
    }
    getCMB() {
        if (this.docmb) {
            return getCMBCorrection(
                this.getRightAscension()  * 180 / Math.PI,
                this.getDeclination() * 180 / Math.PI,
                this.properties.epoch, this.properties.radecsys
            )
        }
        return null;
    }
    // Good enough method to tell if v is a dictionary or not
    isDict(v) {
        return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
    }
}

export default SpectrumX;
