import {convertVacuumFromAir, defaultFor, MJDtoYMD, normaliseViaShift, removeNaNs} from "../Utils/methods";
import {getCMBCorrection, getHeliocentricVelocityCorrection} from "../Utils/helio";

import * as $q from "q";

import path from 'path';
import fs from 'fs';
import { Spectra } from './Spectra';
import './fits';
import { globalConfig, window } from './config';
//==================
class FitsFileLoader {
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

        this.processorService = processorService;
        this.global = global;
        this.log = log;
        //this.subscribed = [];
        //this.subscribedContexts = [];
    }
    setFilename(ifilename) {
        var actualName = path.basename(ifilename);
        this.isLoading = true;
        this.hasFitsFile = true;
        this.originalFilename = actualName.replace(/\.[^/.]+$/, "");
        this.global.data.fitsFileName = this.originalFilename;
        this.filename = this.originalFilename.replace(/_/g, " ");
        this.thefilename = ifilename;
        this.actualName = actualName;
    }
    provide(q) {
        console.log(" ========== PROVIDE ==============");
        //var q = this.$q.defer();
        this.isLoading = true;
        this.hasFitsFile = true;
        var fileData = fs.readFileSync(this.thefilename);
        this.fits = new window.astro.FITS(fileData, function () {
            console.log("window.astro.FITS done its thing now parse");
            this.parseFitsFile(q, this.originalFilename);
            this.processorService.setPause();
        }.bind(this));
        return q.promise;
    }
    ;
    loadInFitsFile(file) {
        var q = $q.defer();
        this.isLoading = true;
        this.hasFitsFile = true;
        this.fits = new window.astro.FITS(this.pass, function () {
            console.log("Loaded FITS file");
            this.parseFitsFileAndGiveMeASpectra(q, this.originalFilename);
            //this.parseFitsFile(q, this.originalFilename);
            this.processorService.setPause();
        }.bind(this));
        return q.promise;
    }
    ;
    getHDUFromName(name) {
        var n = name.toUpperCase();
        for (var i = 0; i < this.fits.hdus.length; i++) {
            var h = this.fits.getHeader(i).cards['EXTNAME'];
            if (h != null && h.value.toUpperCase() == n) {
                return i;
            }
        }
        return null;
    }
    ;
    /**
     * This function takes a promise object and resolves it on successful loading of a FITs file.
     *
     * The function will construct the wavelength array from header values, and then attempt to extract
     * intensity, variance, sky and fibre data.
     *
     * @param q
     */
    parseFitsFile(q, originalFilename) {
        this.header0 = this.fits.getHDU(0).header;
        this.MJD = this.header0.get('UTMJD');
        this.originalFilename = originalFilename;
        this.JD = this.MJD + 2400000.5;
        this.longitude = this.header0.get('LONG_OBS');
        this.latitude = this.header0.get('LAT_OBS');
        this.altitude = this.header0.get('ALT_OBS');
        this.epoch = this.header0.get('EPOCH');
        this.radecsys = this.header0.get('RADECSYS');
        this.inverseVariance = false;
        if (this.radecsys == "FK5") {
            this.radecsys = true;
        }
        else if (this.radecsys == "FK4") {
            this.radecsys = false;
        }
        else if (this.radecsys == null) {
            this.log.debug("RADECSYS header not set. Defaulting to FK5");
            this.radecsys = true;
        }
        else {
            throw "RADECSYS type " + this.radecsys + " is not supported. Please choose either FK4 or FK5";
        }
        this.date = MJDtoYMD(this.MJD);
        this.dataExt = this.getHDUFromName(globalConfig.dataExt);
        this.numPoints = this.fits.getHDU(this.dataExt).data.width;
        $q.all([this.getWavelengths(), this.getIntensityData(), this.getVarianceData(), this.getSkyData(), this.getDetailsData()]).then(function (data) {
            var lambda = data[0];
            var intensity = data[1];
            var variance = data[2];
            var sky = data[3];
            var details = data[4];
            var indexesToRemove = [];
            if (details != null) {
                if (details['FIBRE'] != null) {
                    for (var i = 0; i < details['FIBRE'].length; i++) {
                        if (details['FIBRE'][i] != 'P') {
                            indexesToRemove.push(i);
                        }
                    }
                }
                if (details['TYPE'] != null) {
                    for (var i = 0; i < details['TYPE'].length; i++) {
                        if (details['TYPE'][i].toUpperCase() == 'PARKED') {
                            indexesToRemove.push(i);
                        }
                    }
                }
            }
            this.log.debug("Have indexes to remove");
            indexesToRemove.sort();
            indexesToRemove = indexesToRemove.unique();
            var shouldPerformHelio = this.shouldPerformHelio();
            var shouldPerformCMB = this.shouldPerformCMB();
            this.resultGenerator.setHelio(shouldPerformHelio);
            this.resultGenerator.setCMB(shouldPerformCMB);
            var spectraList = [];
            this.log.debug("NUMBER OF SPECTRA="+intensity.length);
            for (let i = 0; i < intensity.length; i++) {
                if (indexesToRemove.indexOf(i) != -1 || !this.useSpectra(intensity[i])) {
                    continue;
                }
                const id = i + 1;
                var llambda = (lambda.length == 1) ? lambda[0].slice(0) : lambda[i];
                var int = intensity[i];
                var vari = variance == null ? null : variance[i];
                var skyy = sky == null ? null : (sky.length == 1) ? sky[0] : sky[i];
                var name = details == null || details['NAME'] == null ? "Unknown spectra " + id : details['NAME'][i];
                var ra = details == null || details['RA'] == null ? null : details['RA'][i];
                var dec = details == null || details['DEC'] == null ? null : details['DEC'][i];
                var mag = details == null || details['MAGNITUDE'] == null ? null : details['MAGNITUDE'][i];
                var type = details == null || details['TYPE'] == null ? null : details['TYPE'][i];
                var helio = null;
                var cmb = null;
                if (shouldPerformHelio) {
                    helio = getHeliocentricVelocityCorrection(ra * 180 / Math.PI, dec * 180 / Math.PI, this.JD, this.longitude, this.latitude, this.altitude, this.epoch, this.radecsys);
                }
                if (shouldPerformCMB) {
                    cmb = getCMBCorrection(ra * 180 / Math.PI, dec * 180 / Math.PI, this.epoch, this.radecsys);
                }

                const s = new Spectra(id, llambda, int, vari, skyy, name, ra, dec, mag, type, this.originalFilename, helio, cmb, this.node);
                // RS: Keep the extra bits to make it easier to write out
                s.juliandate = this.JD;
                s.longitude = this.longitude;
                s.latitude = this.latitude;
                s.altitude = this.altitude;
                s.epoch = this.epoch;
                s.radecsys = this.radecsys;
                s.setCompute(int != null && vari != null);
                spectraList.push(s);
            }
            this.log.debug("Spectra list made");
            q.resolve(spectraList);
        }.bind(this));
        return q.promise;
    }
    ;
    parseFitsFileAndGiveMeASpectra(q, originalFilename) {
        this.parseFitsFile(q, originalFilename).then(function (spectraList) {
            console.log("thening");
            this.isLoading = false;
            for (var i = 0; i < this.subscribed.length; i++) {
                this.subscribed[i].apply(this.subscribedContexts[i], [spectraList]);
            }
            q.resolve();
        }.bind(this));
    }
    shouldPerformHelio() {
        var flag = this.header0.get('DO_HELIO');
        if ((flag != null && (flag == 1 || flag == "T" || flag == true))) {
            this.log.debug("Performing heliocentric correction");
            return true;
        }
        else {
            this.log.debug("No heliocentric correction");
            return false;
        }
    }
    ;
    shouldPerformCMB() {
        var flag = this.header0.get('DO_CMB');
        if ((flag != null && (flag == 1 || flag == "T" || flag == true))) {
            this.log.debug("Performing CMB correction");
            return true;
        }
        else {
            this.log.debug("No CMB correction");
            return false;
        }
    }
    ;
    getWavelengths() {
        var q = $q.defer();
        this.getRawWavelengths().then(function (lambdas) {
            var needToShift = this.header0.get('VACUUM') == null || this.header0.get('VACUUM') == 0 || this.header0.get('VACUUM') == "F" || this.header0.get('VACUUM') == false;
            var logLinear = this.header0.get('LOGSCALE') != null && (this.header0.get('LOGSCALE') == 1 || this.header0.get('LOGSCALE') == "T" || this.header0.get('LOGSCALE') == true);
            if (logLinear) {
                this.log.debug("Log linear wavelength detected");
                for (var i = 0; i < lambdas.length; i++) {
                    for (var j = 0; j < lambdas[i].length; j++) {
                        lambdas[i][j] = Math.pow(10, lambdas[i][j]);
                    }
                }
            }
            if (needToShift) {
                this.log.debug("Shifting air wavelengths into vacuum");
                for (var i = 0; i < lambdas.length; i++) {
                    convertVacuumFromAir(lambdas[i]);
                }
            }
            q.resolve(lambdas);
        }.bind(this), function (err) {
            this.log.error(err);
            q.reject(err);
        }.bind(this));
        return q.promise;
    }
    ;
    getRawWavelengths() {
        this.log.debug("Getting spectra wavelengths");
        var q = $q.defer();
        var index = this.getHDUFromName(globalConfig.waveExt);
        if (index == null) {
            this.log.debug("Wavelength extension not found. Checking headings " + this.dataExt);
            let header = this.fits.getHDU(this.dataExt).header;
            var CRVAL1 = header.get('CRVAL1');
            var CRPIX1 = header.get('CRPIX1');
            var CDELT1 = header.get('CDELT1');
            if (CDELT1 == null) {
                CDELT1 = header.get('CD1_1');
            }
            if (CRVAL1 == null || CRPIX1 == null || CDELT1 == null) {
                q.reject("Wavelength header values incorrect: CRVAL1=" + CRVAL1 + ", CRPIX1=" + CRPIX1 + ", CDELT1=" + CDELT1 + ".");
            }
            var lambdas = [];
            var lambda = [];
            for (var i = 0; i < this.numPoints; i++) {
                const w = ((i + 1 - CRPIX1) * CDELT1) + CRVAL1;
                lambda.push(w);
                //this.log.debug("wavlength "+i+" "+w);
            }
            lambdas.push(lambda);
            q.resolve(lambdas);
        }
        else {
            var logg = this.log;
            var numPoints = this.numPoints;
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                var d = Array.prototype.slice.call(data);
                var lambdas = [];
                for (var i = 0; i < data.length / numPoints; i++) {
                    var s = d.slice(i * numPoints, (i + 1) * numPoints);
                    lambdas.push(s);
                }
                logg.debug(lambdas.length + " wavelength rows found");
                q.resolve(lambdas);
            }, q);
        }
        return q.promise;
    }
    ;
    /**
     * Attempts to extract the spectrum intensity data from the right extension.
     * On failure, will return null and not reject the deferred promise.
     *
     * @returns {deferred.promise}
     */
    getIntensityData() {
        var index = this.dataExt;
        if (index == null) {
            index = this.primaryIndex;
        }
        var q = $q.defer();
        try {
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                var d = Array.prototype.slice.call(data);
                var intensity = [];
                for (var i = 0; i < data.length / this.numPoints; i++) {
                    intensity.push(d.slice(i * this.numPoints, (i + 1) * this.numPoints));
                }
                q.resolve(intensity);
            }.bind(this), q);
        }
        catch (err) {
            console.warn(err);
            q.resolve(null);
        }
        return q.promise;
    }
    ;
    /**
     * Attempts to extract the spectrum variance data from the right extension.
     * On failure, will return null and not reject the deferred promise.
     *
     * @returns {deferred.promise}
     */
    getVarianceData() {
        var index = this.getHDUFromName(globalConfig.varExt);
        if (index == null) {
            index = this.getHDUFromName(globalConfig.ivarExt);
            if (index != null) {
                this.inverseVariance = true;
            }
        }
        var q = $q.defer();
        if (index == null) {
            q.resolve(null);
            return q.promise;
        }
        try {
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                var d = Array.prototype.slice.call(data);
                var variance = [];
                for (var i = 0; i < data.length / this.numPoints; i++) {
                    if (this.inverseVariance) {
                        var arr = d.slice(i * this.numPoints, (i + 1) * this.numPoints);
                        for (var j = 0; j < arr.length; j++) {
                            arr[j] = 1.0 / arr[j];
                        }
                        variance.push(arr);
                    }
                    else {
                        variance.push(d.slice(i * this.numPoints, (i + 1) * this.numPoints));
                    }
                }
                q.resolve(variance);
            }.bind(this), q);
        }
        catch (err) {
            q.resolve(null);
        }
        return q.promise;
    }
    ;
    /**
     * Attempts to extract the sky spectrum  from the right extension.
     * Does basic filtering on the sky (remove Nans and normalise to the right pixel height).
     *
     * Will return an array of sky data if data is found, which may contain one element or as many
     * elements as there are spectra.
     *
     * On failure, will return null and not reject the deferred promise.
     *
     * @returns {deferred.promise}
     */
    getSkyData() {
        this.log.debug("Getting sky");
        var index = this.getHDUFromName(globalConfig.skyExt);
        var q = $q.defer();
        if (index == null) {
            q.resolve(null);
            return q.promise;
        }
        try {
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                var d = Array.prototype.slice.call(data);
                var sky = [];
                for (var i = 0; i < data.length / this.numPoints; i++) {
                    var s = d.slice(i * this.numPoints, (i + 1) * this.numPoints);
                    try {
                        removeNaNs(s);
                        normaliseViaShift(s, 0, this.global.ui.detailed.skyHeight, null);
                    }
                    catch (ex) { }
                    sky.push(s);
                }
                q.resolve(sky);
            }.bind(this), q);
        }
        catch (err) {
            q.resolve(null);
        }
        return q.promise;
    }
    ;
    /**
     * Searches for tabular data in the fibres extension, and attempts to extract the fibre type, name, magnitude,
     * right ascension, declination and comment.
     *
     * On failure, will return null and not reject the deferred promise.
     *
     * @returns {deferred.promise}
     */
    getDetailsData() {
        this.log.debug("Getting details");
        var index = this.getHDUFromName(globalConfig.detailsExt);
        var q = $q.defer();
        if (index == null) {
            q.resolve(null);
            return q.promise;
        }
        try {
            this.getFibres(q, index, {});
        }
        catch (err) {
            q.resolve({});
        }
        return q.promise;
    }
    ;
    getFibres(q, index, cumulative) {
        this.log.debug("Getting fibres");
        if (this.fits.getDataUnit(index).columns.indexOf("TYPE") > -1) {
            this.fits.getDataUnit(index).getColumn("TYPE", function (data) {
                cumulative['FIBRE'] = data;
                this.getNames(q, index, cumulative);
            }.bind(this));
        }
        else {
            this.getNames(q, index, cumulative);
        }
    }
    ;
    getNames(q, index, cumulative) {
        this.log.debug("Getting names");
        if (this.fits.getDataUnit(index).columns.indexOf("NAME") > -1) {
            this.fits.getDataUnit(index).getColumn("NAME", function (data) {
                var names = [];
                for (var i = 0; i < data.length; i++) {
                    names.push(data[i].replace(/\s+/g, '').replace(/\u0000/g, ""));
                }
                cumulative['NAME'] = names;
                this.getRA(q, index, cumulative);
            }.bind(this));
        }
        else {
            this.getRA(q, index, cumulative);
        }
    }
    ;
    getRA(q, index, cumulative) {
        this.log.debug("Getting RA");
        if (this.fits.getDataUnit(index).columns.indexOf("RA") > -1) {
            this.fits.getDataUnit(index).getColumn("RA", function (data) {
                cumulative['RA'] = data;
                this.getDec(q, index, cumulative);
            }.bind(this));
        }
        else {
            this.getDec(q, index, cumulative);
        }
    }
    ;
    getDec(q, index, cumulative) {
        this.log.debug("Getting DEC");
        if (this.fits.getDataUnit(index).columns.indexOf("DEC") > -1) {
            this.fits.getDataUnit(index).getColumn("DEC", function (data) {
                cumulative['DEC'] = data;
                this.getMagnitudes(q, index, cumulative);
            }.bind(this));
        }
        else {
            this.getMagnitudes(q, index, cumulative);
        }
    }
    ;
    getMagnitudes(q, index, cumulative) {
        this.log.debug("Getting magnitude");
        if (this.fits.getDataUnit(index).columns.indexOf("MAGNITUDE") > -1) {
            this.fits.getDataUnit(index).getColumn("MAGNITUDE", function (data) {
                cumulative['MAGNITUDE'] = data;
                this.getComments(q, index, cumulative);
            }.bind(this));
        }
        else {
            this.getComments(q, index, cumulative);
        }
    }
    ;
    getComments(q, index, cumulative) {
        this.log.debug("Getting comment/objtype");
        var c = "COMMENT";
        if (this.fits.getDataUnit(index).columns.indexOf("OBJTYPE") > -1) {
            c = "OBJTYPE";
        }
        if (this.fits.getDataUnit(index).columns.indexOf(c) > -1) {
            this.fits.getDataUnit(index).getColumn(c, function (data) {
                this.global.data.types.length = 0;
                var ts = [];
                for (var i = 0; i < data.length; i++) {
                    var t = data[i].split(' ')[0];
                    t = t.trim().replace(/\W/g, '');
                    ts.push(t);
                    if (t != 'Parked' && this.global.data.types.indexOf(t) == -1) {
                        this.global.data.types.push(t);
                    }
                }
                cumulative['TYPE'] = ts;
                q.resolve(cumulative);
            }.bind(this));
        }
        else {
            q.resolve(cumulative);
        }
    }
    ;
    /**
     * Issues with some spectra containing almost all NaN values means I now check
     * each spectra before redshifting. This is a simple check at the moment,
     * but it can be extended if needed.
     *
     * Currently, if 90% or more of spectra values are NaN, throw it out. Realistically,
     * I could make this limit much lower.
     *
     * @param intensity
     * @returns {boolean}
     */
    useSpectra(intensity) {
        var c = 0;
        for (var i = 0; i < intensity.length; i++) {
            if (isNaN(intensity[i])) {
                c += 1;
            }
        }
        if (c > 0.9 * intensity.length) {
            return false;
        }
        return true;
    }
    ;
}

export default FitsFileLoader;
