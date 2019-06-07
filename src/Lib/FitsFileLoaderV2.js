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

        /*
        this.MJD = null;
        this.date = null;
        this.header0 = null;
        this.epoch = null;
        this.radecsys = null;
        this.JD = null;
        this.longitude = null;
        this.latitude = null;
        this.altitude = null;
        */

        this.resultGenerator = resultsManager;

        // We will now add all the metadata into the 'spectra' array
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
        var actualName = path.basename(ifilename);
        this.isLoading = true;
        this.hasFitsFile = true;
        this.originalFilename = actualName.replace(/\.[^/.]+$/, "");
        this.global.data.fitsFileName = this.originalFilename;
        this.filename = this.originalFilename.replace(/_/g, " ");
        this.thefilename = ifilename;
        this.actualName = actualName;
    }
    setFiledata(ifilename,ifiledata) {
        var actualName = path.basename(ifilename);
        this.isLoading = true;
        this.hasFitsFile = true;
        this.originalFilename = actualName.replace(/\.[^/.]+$/, "");
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
        var fileData = this.thefiledata;
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

    parseFitsFile(q, originalFilename) {
        // q is the promise object to resolve

        // Read the header to get the file structure, and define which reader
        // functions to hand the file off to
        this.log.debug("Attempting to determine file structure");
        this.header0 = this.fits.getHDU(0).header;
        const phu = this.header0
        this.originalFilename = originalFilename;

        this.spectra = [];

        // Count the number of extensions within the file
        const noExt = this.fits.hdus.length()
        // If single-extension, pass off to the single extension reader(s)
        if (noExt == 1) {
            spectra = parseSingleExtensionFitsFile(q, originalFilename, 0);
        // If multi-extension, pass off to the multi-extension reader
        } else {
            spectra = parseMultiExtensionFitsFile(q, originalFilename);
        }

        q.resolve(spectra);

    }


    readHeaderValue(ext, kw) {
        // Attempt to read header keyword 'kw' from, in order:
        // - Extenstion ext
        // - Extension 0 (if ext != 0)
        // If neither succeeds, return 'undefined'
        var val = undefined
        try {
            val = this.fits.getHeader(ext).cards[kw].value
        } catch (TypeError) {}
        if (val === undefined and ext != 0) {
            try {
                val = this.fits.header0.cards[kw].value
            } catch (TypeError) {}
        }
        return val
    }

    getRawWavelengthsSpect(ext) {
        const q = $q.defer();
        const crval = readHeaderValue(ext, 'CRVAL1') || readHeaderValue(ext, 'CV1_1');
        const crpix = readHeaderValue(ext, 'CRPIX1') || readHeaderValue(ext, 'CP1_1');
        const cdelt = readHeaderValue(ext, 'CDELT1') || readHeaderValue(ext, 'CD1_1');
        const scale = readHeaderValue(ext, 'DC-FLAG') || 'F';

        if (crval == null || crpix == null || cdelt == null) {
            q.reject("Wavelength header values incorrect: CRVAL1=" + crval + ", CRPIX1=" + crpix + ", CDELT1=" + cdelt + ".");
        }

        const lambdas = [];
        const lambda = [];
        if (scale == 'T' || scale == 1) {
            for (let i = 0; i < this.numPoints; i++) {
                lambda.push(Math.pow(10, ((i + 1 - crpix) * cdelt) + crval));
            }
        } else {
            for (let i = 0; i < this.numPoints; i++) {
                lambda.push(((i + 1 - crpix) * cdelt) + crval);
            }
        }
        lambdas.push(lambda);
        q.resolve(lambdas)

        return q.promise;
    }

    getRawWavelengthsTable(ext) {
        // Attempt to identify which table column the wavelength data are in
        var wavlTypeKW = [];
        for (var headerkw in this.getHeader(ext).cards) {
            try {
                    if (this.getHeader(ext).cards[headerkw].indexOf('wave') !== -1 && headerkw.indexOf('TYPE') !== -1) {
                        wavlTypeKW.push(headerkw);
                    }
                } catch (TypeError) {}
        }

        if (wavlTypeKW.length !== 1) {
            console.log('Unable to determine table column for wavelength');
            q.reject('Unable to determine table column for wavelength');
            return;
        }

        // Get the column index from the header keyword, by stripping off the
        // number at the end of the keyword
        // Need to subtract one because arrays in JavaScript are zero-indexed
        const wavColumnIndex = parseInt(wavlTypeKW[0][wavlTypeKW[0].length - 1]) - 1;

        // Extract the column data
        var col_data = []
        this.getDataUnit(ext).getColumn('wave', function (column) {
            col_data = column;
        })

        q.resolve(col_data);

        return q.promise;

    }



    parseSingleExtensionFitsFile(q, originalFilename, ext) {

        // Read header information into properties
        var spectrum = {
            'properties': {}
        }
        spectrum.properties["name"] = readHeaderValue(ext, "OBJID") || readHeaderValue("OBJNAME") || ""
        spectrum.properties["ra"] = readHeaderValue(ext, "RA") || ""
        spectrum.properties["dec"] = readHeaderValue(ext, "DEC") || ""
        spectrum.properties["jd"] = readHeaderValue(ext, "JD") || readHeaderValue(ext, "JULIAN") || readHeaderValue(ext, "MJD") || readHeaderValue(ext, "UTMJD") || ""
        spectrum.properties["longitude"] = readHeaderValue(ext, "LONG_OBS") || readHeaderValue(ext, "LONGITUD") || ""
        spectrum.properties["latitude"] = readHeaderValue(ext, "LAT_OBS") || readHeaderValue(ext, "LATITUDE") || ""
        spectrum.properties["altitude"] = readHeaderValue(ext, "ALT_OBS") || readHeaderValue(ext, "ALTITUDE") || ""
        spectrum.properties["epoch"] = readHeaderValue(ext, "EPOCH") || ""
        spectrum.properties["radecsys"] = readHeaderValue(ext, "RADECSYS") || ""

        // Now need to determine which flavour of information read functions
        // we need to send to
        // This is basically two flavours - table read, and spectrum (1D image) read
        // See if the data attribute attached to the astro FITS object has table
        // or image properties
        const isTableData = this.data0.data.hasAttribute('rows');
        var wavlReadFunc, instReadFund, varReadFunc, skyReadFunc, detailReadFunc;
        if (isTableData) {
            // Assign table read functions
            wavlReadFunc = getRawWavelengthsTable;
            instReadFunc = getIntensityTable;
            varReadFunc = getVarianceTable;
            skyReadFunc = getSkyTable;
            detailReadFunc = getDetailTable;
        } else {
            // Assign spectrum read functions
            wavlReadFunc = getRawWavelengthsSpect;
            instReadFunc = getIntensitySpect;
            varReadFunc = getVarianceSpect;
            skyReadFunc = getSkySpect;
            detailReadFunc = getDetailSpect;
        }


        $q.all([
            wavlReadFunc(),
            instReadFunc(),
            varReadFunc(),
            skyReadFunc(),
            detailReadFunc()
        ]).then(function (data) {

        }).bind(this);

        // Note that the calling function resolves the promise, not this one
        return spectra;

    }

    parseMultiExtensionFitsFile(q, originalFilename) {
        // See if we are dealing with one of the following:
        // - Different data product (flux, var, sky etc) in each extension;
        // - Different object in each extension;
        // - Single extension with independent PHU
        // In the last two cases, we can re-use parseSingleExtensionFits

        // Re-check the 'properties' information in case more relevant information
        // is contained in the data extension header
        var spectrum = {
            'properties': {}
        }

        //
    }

}