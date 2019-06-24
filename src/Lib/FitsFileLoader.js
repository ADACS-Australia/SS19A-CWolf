import {convertVacuumFromAir, defaultFor, MJDtoYMD, normaliseViaShift, removeNaNs} from "../Utils/methods";
import {getCMBCorrection, getHeliocentricVelocityCorrection} from "../Utils/helio";

import * as $q from "q";

import {setFitsFilename, setTypes} from "../Stores/Data/Actions";
import path from 'path';
import * as Enumerable from "linq";
import Spectra from "./Spectra";
import "./fits";
import {globalConfig} from "./config";

class FitsFileLoader {
    constructor(processorService, resultsManager, node) {
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
        this.resultGenerator = resultsManager;

        this.spectra = null;
        this.primaryIndex = 0;
        this.numPoints = null;

        this.processorService = processorService;
        this.log = console;
        this.subscribed = [];

        this.filedata = null;
    }
    
    subscribeToInput(fn) {
        this.subscribed.push(fn);
    }

    setFilename(ifilename) {
        const actualName = path.basename(ifilename);
        this.isLoading = true;
        this.hasFitsFile = true;
        this.originalFilename = actualName.replace(/\.[^/.]+$/, "");
        // todo: Important?
        //this.global.data.fitsFileName = this.originalFilename;
        this.filename = this.originalFilename.replace(/_/g, " ");
        this.thefilename = ifilename;
        this.actualName = actualName;
    }
    setFiledata(ifilename,ifiledata) {
        const actualName = path.basename(ifilename);
        this.isLoading = true;
        this.hasFitsFile = true;
        this.originalFilename = actualName.replace(/\.[^/.]+$/, "");
        // todo: Important?
        //this.global.data.fitsFileName = this.originalFilename;
        this.filename = this.originalFilename.replace(/_/g, " ");
        this.thefilename = ifilename;
        this.actualName = actualName;
        this.thefiledata = ifiledata;
    }
    provide(q) {
        console.log(" ========== PROVIDE ==============");
        //const q = this.$q.defer();
        this.isLoading = true;
        this.hasFitsFile = true;
        const fileData = this.thefiledata;
        this.fits = new window.astro.FITS(fileData, function () {
            console.log("window.astro.FITS done its thing now parse "+this.filename+" "+this.originalFilename);
            this.parseFitsFile(q, this.originalFilename);
            this.processorService.setPause();
        }.bind(this));
        return q.promise;
    }

    loadInFitsFile(file) {
        const q = $q.defer();
        this.isLoading = true;
        this.hasFitsFile = true;
        let pass = file;
        if (file.actualName != null) {
            this.originalFilename = file.actualName.replace(/\.[^/.]+$/, "");
            pass = file.file;
        } else {
            this.originalFilename = file.name.replace(/\.[^/.]+$/, "");
        }
        setTimeout(() => setFitsFilename(this.originalFilename), 0);
        this.filename = this.originalFilename.replace(/_/g, " ");
        this.log.debug("Loading FITs file");
        this.fits = new astro.FITS(pass, function () {
            this.log.debug("Loaded FITS file "+this.filename+" "+this.originalFilename);
            console.log("Loaded FITS file "+this.filename+" "+this.originalFilename);
            this.parseFitsFile(q, this.originalFilename);
            this.processorService.setPause();
        }.bind(this));
        return q.promise;
    };

    getHDUFromName(name) {
        const n = name.toUpperCase();
        for (let i = 0; i < this.fits.hdus.length; i++) {
            const h = this.fits.getHeader(i).cards['EXTNAME'];
            if (h != null && h.value.toUpperCase() === n) {
                this.log.debug(name + " index found at " + i);
                return i;
            }
        }
        return null;
    };

    /**
     * This function takes a promise object and resolves it on successful loading of a FITs file.
     *
     * The function will construct the wavelength array from header values, and then attempt to extract
     * intensity, variance, sky and fibre data.
     *
     * @param q
     */
    parseFitsFile(q, originalFilename) {
        this.log.debug("Getting headers");
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
        if (this.radecsys === "FK5") {
            this.radecsys = true;
        } else if (this.radecsys === "FK4") {
            this.radecsys = false;
        } else if (this.radecsys == null) {
            this.log.debug("RADECSYS header not set. Defaulting to FK5");
            this.radecsys = true;
        } else {
            throw "RADECSYS type " + this.radecsys + " is not supported. Please choose either FK4 or FK5";
        }
        this.date = MJDtoYMD(this.MJD);
        this.dataExt = this.getHDUFromName(globalConfig.dataExt);
        this.numPoints = this.fits.getHDU(this.dataExt).data.width;

        $q.all([this.getWavelengths(), this.getIntensityData(), this.getVarianceData(), this.getSkyData(), this.getDetailsData()]).then(function (data) {
            this.log.debug("Load promises complete");
            const lambda = data[0];
            const intensity = data[1];
            const variance = data[2];
            const sky = data[3];
            const details = data[4];
            let indexesToRemove = [];
            if (details != null) {
                if (details['FIBRE'] != null) {
                    for (let i = 0; i < details['FIBRE'].length; i++) {
                        if (details['FIBRE'][i] !== 'P') {
                            indexesToRemove.push(i);
                        }
                    }
                }
                if (details['TYPE'] != null) {
                    for (let i = 0; i < details['TYPE'].length; i++) {
                        if (details['TYPE'][i].toUpperCase() === 'PARKED') {
                            indexesToRemove.push(i)
                        }
                    }
                }
            }
            this.log.debug("Have indexes to remove");
            indexesToRemove = Enumerable.from(indexesToRemove).orderBy(x => x);
            indexesToRemove = indexesToRemove.distinct().toArray();

            const shouldPerformHelio = this.shouldPerformHelio();
            const shouldPerformCMB = this.shouldPerformCMB();

            this.resultGenerator.setHelio(shouldPerformHelio);
            this.resultGenerator.setCMB(shouldPerformCMB);

            const spectraList = [];
            for (let i = 0; i < intensity.length; i++) {
                if (indexesToRemove.indexOf(i) !== -1 || !this.useSpectra(intensity[i])) {
                    continue;
                }
                const id = i + 1;
                const llambda = (lambda.length === 1) ? lambda[0].slice(0) : lambda[i];
                const int = intensity[i];
                const vari = variance == null ? null : variance[i];
                const skyy = sky == null ? null : (sky.length === 1) ? sky[0] : sky[i];
                const name = details == null || details['NAME'] == null ? "Unknown spectra " + id : details['NAME'][i];
                const ra = details == null || details['RA'] == null ? null : details['RA'][i];
                const dec = details == null || details['DEC'] == null ? null : details['DEC'][i];
                const mag = details == null || details['MAGNITUDE'] == null ? null : details['MAGNITUDE'][i];
                const type = details == null || details['TYPE'] == null ? null : details['TYPE'][i];

                let helio = null;
                let cmb = null;
                if (shouldPerformHelio) {
                    helio = getHeliocentricVelocityCorrection(ra * 180 / Math.PI, dec * 180 / Math.PI, this.JD, this.longitude, this.latitude, this.altitude, this.epoch, this.radecsys);
                }
                if (shouldPerformCMB) {
                    cmb = getCMBCorrection(ra * 180 / Math.PI, dec * 180 / Math.PI, this.epoch, this.radecsys);
                }
                const s = new Spectra(id, llambda, int, vari, skyy, name, ra, dec, mag, type, this.originalFilename, helio, cmb, this.node);
                s.setCompute(int != null && vari != null);
                spectraList.push(s);
            }
            this.log.debug("Spectra list made");
            this.isLoading = false;
            //for (let i = 0; i < this.subscribed.length; i++) {
            //    this.subscribed[i](spectraList);
            //}
            //this.log.debug("Returning FITs object");
            q.resolve(spectraList);

        }.bind(this))
    };

    shouldPerformHelio() {
        const flag = this.header0.get('DO_HELIO');
        if ((flag != null && (flag === 1 || flag === "T" || flag === true))) {
            this.log.debug("Performing heliocentric correction");
            return true;
        } else {
            this.log.debug("No heliocentric correction");
            return false;
        }
    };

    shouldPerformCMB() {
        const flag = this.header0.get('DO_CMB');
        if ((flag != null && (flag === 1 || flag === "T" || flag === true))) {
            this.log.debug("Performing CMB correction");
            return true;
        } else {
            this.log.debug("No CMB correction");
            return false;
        }
    };

    getWavelengths() {
        const q = $q.defer();
        this.getRawWavelengths().then(function (lambdas) {
            const needToShift = this.header0.get('VACUUM') == null || this.header0.get('VACUUM') === 0 || this.header0.get('VACUUM') === "F" || this.header0.get('VACUUM') === false;
            const logLinear = this.header0.get('LOGSCALE') != null && (this.header0.get('LOGSCALE') === 1 || this.header0.get('LOGSCALE') === "T" || this.header0.get('LOGSCALE') === true);

            if (logLinear) {
                this.log.debug("Log linear wavelength detected");
                for (let i = 0; i < lambdas.length; i++) {
                    for (let j = 0; j < lambdas[i].length; j++) {
                        lambdas[i][j] = Math.pow(10, lambdas[i][j]);
                    }
                }
            }
            if (needToShift) {
                this.log.debug("Shifting air wavelengths into vacuum");
                for (let i = 0; i < lambdas.length; i++) {
                    convertVacuumFromAir(lambdas[i]);
                }
            }

            q.resolve(lambdas);
        }.bind(this), function (err) {
            this.log.error(err);
            q.reject(err);
        }.bind(this));

        return q.promise;
    };

    getRawWavelengths() {
        this.log.debug("Getting spectra wavelengths");
        const q = $q.defer();
        const index = this.getHDUFromName(globalConfig.waveExt);
        if (index == null) {
            this.log.debug("Wavelength extension not found. Checking headings");
            const header = this.fits.getHDU(this.dataExt).header;
            const CRVAL1 = header.get('CRVAL1');
            const CRPIX1 = header.get('CRPIX1');
            let CDELT1 = header.get('CDELT1');
            if (CDELT1 == null) {
                CDELT1 = header.get('CD1_1');
            }
            if (CRVAL1 == null || CRPIX1 == null || CDELT1 == null) {
                q.reject("Wavelength header values incorrect: CRVAL1=" + CRVAL1 + ", CRPIX1=" + CRPIX1 + ", CDELT1=" + CDELT1 + ".");
            }
            const lambdas = [];
            const lambda = [];
            for (let i = 0; i < this.numPoints; i++) {
                lambda.push(((i + 1 - CRPIX1) * CDELT1) + CRVAL1);
            }
            lambdas.push(lambda);
            q.resolve(lambdas);

        } else {
            const logg = this.log;
            const numPoints = this.numPoints;
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                const d = Array.prototype.slice.call(data);
                const lambdas = [];
                for (let i = 0; i < data.length / numPoints; i++) {
                    const s = d.slice(i * numPoints, (i + 1) * numPoints);
                    lambdas.push(s);
                }
                logg.debug(lambdas.length + " wavelength rows found");
                q.resolve(lambdas);
            }, q);
        }
        return q.promise;
    };

    /**
     * Attempts to extract the spectrum intensity data from the right extension.
     * On failure, will return null and not reject the deferred promise.
     *
     * @returns {deferred.promise}
     */
    getIntensityData() {
        this.log.debug("Getting spectra intensity");
        let index = this.dataExt;
        if (index == null) {
            index = this.primaryIndex;
        }
        const q = $q.defer();
        try {
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                const d = Array.prototype.slice.call(data);
                const intensity = [];
                for (let i = 0; i < data.length / this.numPoints; i++) {
                    intensity.push(d.slice(i * this.numPoints, (i + 1) * this.numPoints));
                }
                q.resolve(intensity)
            }.bind(this), q);
        } catch (err) {
            console.warn(err);
            q.resolve(null);
        }
        return q.promise;
    };

    /**
     * Attempts to extract the spectrum variance data from the right extension.
     * On failure, will return null and not reject the deferred promise.
     *
     * @returns {deferred.promise}
     */
    getVarianceData() {
        this.log.debug("Getting spectra variance");
        let index = this.getHDUFromName(globalConfig.varExt);
        if (index == null) {
            index = this.getHDUFromName(globalConfig.ivarExt);
            if (index != null) {
                this.inverseVariance = true;
            }
        }
        const q = $q.defer();
        if (index == null) {
            q.resolve(null);
            return q.promise;
        }
        try {
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                const d = Array.prototype.slice.call(data);
                const variance = [];
                for (let i = 0; i < data.length / this.numPoints; i++) {
                    if (this.inverseVariance) {
                        const arr = d.slice(i * this.numPoints, (i + 1) * this.numPoints);
                        for (let j = 0; j < arr.length; j++) {
                            arr[j] = 1.0 / arr[j];
                        }
                        variance.push(arr);
                    } else {
                        variance.push(d.slice(i * this.numPoints, (i + 1) * this.numPoints));
                    }
                }
                q.resolve(variance)
            }.bind(this), q);
        } catch (err) {
            q.resolve(null);
        }
        return q.promise;
    };

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
        const index = this.getHDUFromName(globalConfig.skyExt);
        const q = $q.defer();
        if (index == null) {
            q.resolve(null);
            return q.promise;
        }
        try {
            this.fits.getDataUnit(index).getFrame(0, function (data, q) {
                const d = Array.prototype.slice.call(data);
                const sky = [];
                for (let i = 0; i < data.length / this.numPoints; i++) {
                    const s = d.slice(i * this.numPoints, (i + 1) * this.numPoints);
                    try {
                        removeNaNs(s);
                        normaliseViaShift(s, 0, this.global.ui.detailed.skyHeight, null);
                    } catch (ex) {
                    }
                    sky.push(s);
                }
                q.resolve(sky)
            }.bind(this), q);
        } catch (err) {
            q.resolve(null);
        }
        return q.promise;
    };

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
        const index = this.getHDUFromName(globalConfig.detailsExt);
        const q = $q.defer();
        if (index == null) {
            q.resolve(null);
            return q.promise;
        }
        try {
            this.getFibres(q, index, {});
        } catch (err) {
            q.resolve({});
        }
        return q.promise;
    };

    getFibres(q, index, cumulative) {
        this.log.debug("Getting fibres");
        if (this.fits.getDataUnit(index).columns.indexOf("TYPE") > -1) {
            this.fits.getDataUnit(index).getColumn("TYPE", function (data) {
                cumulative['FIBRE'] = data;
                this.getNames(q, index, cumulative);
            }.bind(this));
        } else {
            this.getNames(q, index, cumulative);
        }
    };

    getNames(q, index, cumulative) {
        this.log.debug("Getting names");
        if (this.fits.getDataUnit(index).columns.indexOf("NAME") > -1) {
            this.fits.getDataUnit(index).getColumn("NAME", function (data) {
                const names = [];
                for (let i = 0; i < data.length; i++) {
                    names.push(data[i].replace(/\s+/g, '').replace(/\u0000/g, ""));
                }
                cumulative['NAME'] = names;
                this.getRA(q, index, cumulative);
            }.bind(this));
        } else {
            this.getRA(q, index, cumulative);
        }
    };

    getRA(q, index, cumulative) {
        this.log.debug("Getting RA");
        if (this.fits.getDataUnit(index).columns.indexOf("RA") > -1) {
            this.fits.getDataUnit(index).getColumn("RA", function (data) {
                cumulative['RA'] = data;
                this.getDec(q, index, cumulative);
            }.bind(this));
        } else {
            this.getDec(q, index, cumulative);
        }
    };

    getDec(q, index, cumulative) {
        this.log.debug("Getting DEC");
        if (this.fits.getDataUnit(index).columns.indexOf("DEC") > -1) {
            this.fits.getDataUnit(index).getColumn("DEC", function (data) {
                cumulative['DEC'] = data;
                this.getMagnitudes(q, index, cumulative);
            }.bind(this));
        } else {
            this.getMagnitudes(q, index, cumulative);
        }
    };
    
    getMagnitudes(q, index, cumulative) {
        this.log.debug("Getting magnitude");
        if (this.fits.getDataUnit(index).columns.indexOf("MAGNITUDE") > -1) {
            this.fits.getDataUnit(index).getColumn("MAGNITUDE", function (data) {
                cumulative['MAGNITUDE'] = data;
                this.getComments(q, index, cumulative);
            }.bind(this));
        } else {
            this.getComments(q, index, cumulative);
        }
    };

    getComments(q, index, cumulative) {
        this.log.debug("Getting comment/objtype");
        let c = "COMMENT";
        if (this.fits.getDataUnit(index).columns.indexOf("OBJTYPE") > -1) {
            c = "OBJTYPE"
        }
        if (this.fits.getDataUnit(index).columns.indexOf(c) > -1) {
            this.fits.getDataUnit(index).getColumn(c, function (data) {
                let types = [];
                const ts = [];
                for (let i = 0; i < data.length; i++) {
                    let t = data[i].split(' ')[0];
                    t = t.trim().replace(/\W/g, '');
                    ts.push(t);
                    if (t !== 'Parked' && types.indexOf(t) === -1) {
                        types.push(t);
                    }
                }
                setTypes(types);
                cumulative['TYPE'] = ts;
                q.resolve(cumulative);
            }.bind(this));
        } else {
            q.resolve(cumulative);
        }
    };

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
        let c = 0;
        for (let i = 0; i < intensity.length; i++) {
            if (isNaN(intensity[i])) {
                c += 1;
            }
        }
        return c <= 0.9 * intensity.length;
    };
}

export default FitsFileLoader;