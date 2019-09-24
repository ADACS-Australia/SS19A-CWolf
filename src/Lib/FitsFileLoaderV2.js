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

    // Map instruments to particular 'recipes' of read in functions
    instrumentPackages = [
//        {
//            "instrument": "LAMOST",
//            "headerkw": "TELESCOP",
//            "headervalue": "LAMOST",
//            "readfunc": parseLamostFitsFile
//        },
    ]

    wavelengthConversionFactors = {
    // These factors convert the named wavelength unit to angstrom
        'nm': 10.0
    }

    fluxConversionFactors = {
    // These factors convert the named flux unit to erg/s/cm/A
        'Wm2': 1000.0
    }

    constructor(processorService, resultsManager, node) {
        this.node = defaultFor(node, false);
        this.isLoading = false;
        this.hasFitsFile = false;
        this.originalFilename = null;
        this.filename = null;
        this.noExt = null;

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

    readHeaderValue(ext, kw) {
        // Attempt to read header keyword 'kw' from, in order:
        // - Extenstion ext
        // - Extension 0 (if ext != 0)
        // If neither succeeds, return 'undefined'
        var val = undefined
        try {
            val = this.fits.getHeader(ext).cards[kw].value
        } catch (TypeError) {}
        if (val === undefined && ext != 0) {
            try {
                val = this.fits.header0.cards[kw].value
            } catch (TypeError) {}
        }
        return val
    }

    readHeaderValueReturns(ext, kw, returns) {
        // As for readHeaderValue, but return 'returns' if the result is undef.
        var val = this.readHeaderValue(ext, kw)
        if (val === undefined) {
            return returns;
        }
        return val;
    }

    standardizeWavlUnit(wavlUnit) {
        // Convert the wavelength into one of the standard values, based on
        // what kind of variations there normally are
        if (wavlUnit.match(/ang/i) || wavlUnit.match(/aa/i)) {
            wavlUnit = "angstrom";
        } else if (wavlUnit.match(/nm/i) || wavlUnit.match(/nano/i)) {
            wavlUnit = "nm";
        } else if (wavlUnit.match(/cm/i) || wavlUnit.match(/centi/i)) {
            wavlUnit = "cm";
        } else if (wavlUnit.match(/micro/i)) {
            wavlUnit = "micron";
        }

        return wavlUnit;
    }

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
        this.noExt = this.fits.hdus.length
        // Check to see if this file matches one of the special file types
        // with a custom read in
        this.customFileType = null ;
        this.customFileRead = null ;
        for (var i = 0; i < this.instrumentPackages.length; i++) {
            pkg = this.instrumentPackages[i];
            if (this.header0.cards[pkg["headerkw"]] == pkg["headervalue"]) {
                this.customFileType = pkg["instrument"];
                this.customFileRead = pkg["readfunc"];
                break;
            }
        }
        if (this.customFileType) {
            spectra = (this.customFileRead)(q, originalFilename);
        } else if (this.noExt == 1) {
            // If single-extension, pass off to the single extension reader(s)
            spectra = this.parseSingleExtensionFitsFile(q, originalFilename, 0);
        } else {
            // If multi-extension, pass off to the multi-extension reader
            spectra = this.parseMultiExtensionFitsFile(q, originalFilename);
        }

        q.resolve(spectra);

    }


    getWavelengthAxis(ext) {
        var wavlAxis = 1 ; // Default if CTYPE not found
        var wavlAxisName = []

        for (var headerkw in this.getHeader(ext).cards) {
            try {
                    if ((this.getHeader(ext).cards[headerkw].value.match(/wave/i) || this.getHeader(ext).cards[headerkw].value.match(/lam/i)) && headerkw.indexOf("TYPE") !== -1) {
                        wavlAxisName.push(headerkw);
                    }
                } catch (TypeError) {}
        }

        if (wavlAxisName.length !== 1) {
            console.log("Unable to determine wavelength axis");
            q.reject("Unable to determine wavelength axis");
            return;
        }

        // Get the column index from the header keyword, by stripping off the
        // number at the end of the keyword
        // Need to subtract one because arrays in JavaScript are zero-indexed
        const wavColumnIndex = parseInt(wavlTypeKW[0][wavlTypeKW[0].length - 1]) - 1;
        return wavColumnIndex ;

    }

    getWavelengthsSpect(ext) {
        this.log.debug('Getting spectra wavelengths');
        const q = $q.defer();

        const wavlAxisIndex = this.getWavelengthAxis(ext) ;

        const crval = this.readHeaderValue(ext, "CRVAL${wavlAxisIndex}") || this.readHeaderValue(ext, "CV1_${wavlAxisIndex}");
        const crpix = this.readHeaderValue(ext, "CRPIX${wavlAxisIndex}") || this.readHeaderValue(ext, "CP1_${wavlAxisIndex}");
        const cdelt = this.readHeaderValue(ext, "CDELT${wavlAxisIndex}") || this.readHeaderValue(ext, "CD1_${wavlAxisIndex}");
        const scale = this.readHeaderValue(ext, "LOGSCALE") || "F";
        const needShift = this.readHeaderValue(ext, "VACUUM") || "T";

        if (crval == null || crpix == null || cdelt == null) {
            q.reject("Wavelength header values incorrect: CRVAL${wavlAxisIndex}=" + crval + ", CRPIX${wavlAxisIndex}=" + crpix + ", CDELT${wavlAxisIndex}=" + cdelt + ".");
        }

        const lambdas = [];
        const lambda = [];
        if (scale === "T" || scale === 1 || scale === true) {
            for (let i = 0; i < this.numPoints; i++) {
                lambda.push(Math.pow(10, ((i + 1 - crpix) * cdelt) + crval));
            }
        } else {
            for (let i = 0; i < this.numPoints; i++) {
                lambda.push(((i + 1 - crpix) * cdelt) + crval);
            }
        }

        // Do shifting, if necessary
        if (needShift === null || needShift === 0 || needShift === "F" || needShift === false ) {
            // Do shift
            convertVacuumFromAir(lambda);
        }


        lambdas.push(lambda);
        q.resolve(lambdas);

        return q.promise;
    }

    getWavelengthsTable(ext) {
        // Attempt to identify which table column the wavelength data are in
        var wavlTypeKW = [];
        var wavlColName = [];

        for (var headerkw in this.getHeader(ext).cards) {
            try {
                    if ((this.getHeader(ext).cards[headerkw].value.indexOf("wave") !== -1 || this.getHeader(ext).cards[headerkw].value.indexOf("lam") !== -1) && headerkw.indexOf("TYPE") !== -1) {
                        wavlTypeKW.push(headerkw);
                        wavlColName.push(this.getHeader(ext).cards[headerkw].value);
                    }
                } catch (TypeError) {}
        }

        if (wavlTypeKW.length !== 1) {
            console.log("Unable to determine table column for wavelength");
            q.reject("Unable to determine table column for wavelength");
            return;
        }

        // Get the column index from the header keyword, by stripping off the
        // number at the end of the keyword
        // Need to subtract one because arrays in JavaScript are zero-indexed
        const wavColumnIndex = parseInt(wavlTypeKW[0][wavlTypeKW[0].length - 1]) - 1;

        // Extract the column data
        var col_data = []
        this.getDataUnit(ext).getColumn("wave", function (column) {
            col_data = column;
        })

        // If 'log' was in the row name, we need to convert to 'actual' values
        if (wavlColName[0].indexOf("log") !== -1) {
            for (var i = 0; i < col_data.length(); i++) {
                col_data[i] = Math.pow(10, col_data[i]); // Just converting 'actual' values, no need to do e.g. deltas
            }
        }

        // Wavelength unit detection is done elsewhere

        q.resolve(col_data);

        return q.promise;

    }

    getWavelengthUnitTable(ext, colIndex) {

        // Now need to make sure that the wavelength data are in angstroms
        var wavlUnit = null ;
        // Attempt to read the straight-up header keyword types
        var foundWavlUnit = this.readHeaderValue(ext, "CTYPE${colIndex}") || this.readHeaderValue(ext, "TUNIT${colIndex}") || null ;
        if (foundWavlUnit === null) {
            wavlUnit = "pixel";
        }

        // Get the standard name for the wavl. unit
        wavlUnit = standardizeWavlUnit(wavlUnit);

        q.resolve(wavlUnit);

        return q.promise;

    }


    getWavelengthUnitSpect(ext) {
        var wavlUnit = null ;
        const wavlAxisIndex = this.getWavelengthAxis(ext) ;
        var foundWavlUnit = this.readHeaderValue(ext, "CUNIT${wavlAxisIndex}") || null ;

        if (foundWavlUnit == null) {
            wavalUnit = "pixel" ;
        }

        // Get the standard name for the wavl. unit
        wavlUnit = standardizeWavlUnit(wavlUnit);

        q.resolve(wavlUnit);

        return q.promise;

    }


    getIntensitySpect(ext) {
        // Check the shape of the data - if 1-d, just return the single column
        const dataDims = this.fits.getDataUnit(ext).naxis.length ;
        if (dataDims > 2) {
            console.log("Marz cannot handle input images with more than two dimensions");
            q.reject("Marz cannot handle input images with more than two dimensions");
            return;
        }

        var intensitySpects = [];

        var spectdata;
        this.fits.getDataUnit(ext).getFrame(0, function(data, q) {
            spectdata = Array.prototype.slice.call(data) ;
        }, q)

        if (dataDims === 1) {
            // Simply return the data
            intensitySpects.append(spectdata)
            q.resolve(intensitySpects);
            return q.promise ;
        }

        // Otherwise, we need to slice up the data into constituent parts
        // This needs to be based off the naxis values of the input DataUnit,
        // as well as any flags indicating what the various axes are
        var dataAxis = 1 ;  // Default value if we can't find something explicit
        var fluxAxes = [];
        for (var headerkw in this.getHeader(ext).cards) {
            try {
                    if ((this.getHeader(ext).cards[headerkw].value.match(/flux/i) || this.getHeader(ext).cards[headerkw].value.match(/inten/i)) && headerkw.indexOf("TYPE") !== -1) {
                        fluxAxes.push(headerkw);
                    }
                } catch (TypeError) {}
        }
        if (fluxAxes.length > 1) {
            console.log("Appear to be multiple intensity axes");
            q.reject("Appear to be multiple intensity axes");
            return;
        }

        // 0 is data is in rows (sequential), 1 otherwise
        const fluxAxis = parseInt(fluxAxes[0][fluxAxes[0].length - 1]) - 1;
        // Reverse of the above
        // const fluxAxisOpp = (fluxAxis + 1) % 2 ;
        var [rowLength, colLength] = this.fits.getDataUnit(ext).naxis;
        var startStep, startStop, iStep ;

        if (fluxAxis === 0) {
            startStep = rowLength;
            startStop = spectdata.length ;
            iStep = 1;
        } else {
            startStep = 1;
            startStop = spectdata.length - colLength * (rowLength - 1) ;
            iStep = colLength;
        }

        for (var start = 0; start < startStop ; start += startStep) {
                var spect = [];
                for (var i = 0; i < rowLength; i+= iStep) {
                    spect.push(spectdata[start + i]);
                }
                intensitySpects.push(spect) ;
            }

        q.resolve(intensitySpects);
        return q.promise ;
    }

    parseSingleExtensionFitsFile(q, originalFilename, ext) {

        // Read header information into properties
        var spectrum = {
            'properties': {}
        }
        spectrum.properties["name"] = this.readHeaderValue(ext, "OBJID") || this.readHeaderValue("OBJNAME") || ""
        spectrum.properties["ra"] = this.readHeaderValue(ext, "RA") || ""
        spectrum.properties["dec"] = this.readHeaderValue(ext, "DEC") || ""
        spectrum.properties["juliandate"] = this.readHeaderValue(ext, "JD") || this.readHeaderValue(ext, "JULIAN") || this.readHeaderValue(ext, "MJD") || this.readHeaderValue(ext, "UTMJD") || ""
        spectrum.properties["longitude"] = this.readHeaderValue(ext, "LONG_OBS") || this.readHeaderValue(ext, "LONGITUD") || ""
        spectrum.properties["latitude"] = this.readHeaderValue(ext, "LAT_OBS") || this.readHeaderValue(ext, "LATITUDE") || ""
        spectrum.properties["altitude"] = this.readHeaderValue(ext, "ALT_OBS") || this.readHeaderValue(ext, "ALTITUDE") || ""
        spectrum.properties["epoch"] = this.readHeaderValue(ext, "EPOCH") || ""
        spectrum.properties["radecsys"] = this.readHeaderValue(ext, "RADECSYS") || ""
        spectrum.properties["magnitude"] = this.readHeaderValue(ext, "MAG") || ""

        // Now need to determine which flavour of information read functions
        // we need to send to
        // This is basically two flavours - table read, and spectrum (1D image) read
        // See if the data attribute attached to the astro FITS object has table
        // or image properties
        const isTableData = this.fits.getDataUnit(1).hasOwnProperty("rows");
        const isLamost = this.fits.getHDU(0).header.cards["TELESCOP"].value == "LAMOST" || false
        var wavlReadFunc, instReadFunc, varReadFunc, skyReadFunc, detailReadFunc, wavlUnitReadFunc, intUnitReadFunc;
        if (isTableData) {
            // Assign table read functions
            wavlReadFunc = this.getWavelengthsTable;
            instReadFunc = this.getIntensityTable;
            varReadFunc = this.getVarianceTable;
            skyReadFunc = this.getSkyTable;
            detailReadFunc = this.getDetailTable;
            wavlUnitReadFunc = this.getWavelengthUnitTable;
        } else if (isLamost) {
            // Assign LAMOST read functions
        } else {
            // Assign spectrum read functions
            wavlReadFunc = this.getWavelengthsSpect;
            instReadFunc = this.getIntensitySpect;
            varReadFunc = this.getVarianceSpect;
            skyReadFunc = this.getSkySpect;
            detailReadFunc = this.getDetailSpect;
            wavlUnitReadFunc = this.getWavelengthUnitSpect;
        }


        $q.all([
            wavlReadFunc(0),
            instReadFunc(0),
            varReadFunc(0),
            skyReadFunc(0),
            detailReadFunc(0),
            wavlUnitReadFunc(0),
            intUnitReadFunc(0)
        ]).then(function (data) {
            // Do any required stuff after reading all in
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

        // Let's see how many of the data extensions have data...
        var exts_with_data = [];
        for (i = 0; i < this.noExt; i++) {
            exts_with_data.push(i);
        }
        if (exts_with_data.length === 0) {
            var spectra = parseSingleExtensionFitsFile(exts_with_data[0]);
            return spectra;
        }

        // OK, so there's multiple extensions with data. Now need to see if
        // it's one object per extension, or different products for the same
        // object
        // We do this by checking for an EXTNAME attribute on the data
        // extensions, and seeing if we can find a variance extension
        var var_ext_found = false;
        var var_ext;
        for (var i = 0; i < this.noExt; i++) {
            if (this.readHeaderValueReturns(i, "EXTNAME", "").match(/var/i)) {
                var_ext_found = true;
                var_ext = i;
                break;
            }
        }
        if (!var_ext_found) {
            // Need to loop over the separate extensions in sequence, as we
            // assume each one is a separate object
            var spectra = [];
            for (var j = 0; j < exts_with_data.length; j++) {
                spectra.push(this.parseSingleExtensionFitsFile(exts_with_data[j]));
            return spectra;
            }
        }

        // If we've hit this point, we have a true multi-extenstion spectra,
        // with different data products in each spectrum
        // Added complication - the main file type which does this (AAOmega)
        // has 400 spectra in each data extension which will need to be
        // matched up
        // Also need to find any non-science spectra (calibrators?)

        // First, throw an error at this point if there is more than one intensity
        // extension - such a file is too complex for generic read-in
        if (exts_with_data.length > 1) {
            console.log("There are multiple intensity extensions in a file with different data products in each extension");
            q.reject("There are multiple intensity extensions in a file with different data products in each extension");
            return;
        }

        // Specify the read-in functions
        var wavlReadFunc, instReadFund, varReadFunc, skyReadFunc, detailReadFunc, wavlUnitReadFunc, intUnitReadFunc;



        // Re-check the 'properties' information in case more relevant information
        // is contained in the data extension header
        var spectrum = {
            "properties": {}
        }

        //
    }

}

export default FitsFileLoader;