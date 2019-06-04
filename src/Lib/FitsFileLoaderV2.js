parseFitsFile(q, originalFilename) {
    // q is the promise object to resolve

    // Read the header to get the file structure, and define which reader
    // functions to hand the file off to
    this.log.debug("Attempting to determine file structure");
    this.header0 = this.fits.getHDU(0).header;
    const phu = this.header0
    this.originalFilename = originalFilename;

    var spectrumList = []

    // Read the basic information from the PHU
    // Get the object name
    var spectrum = {'properties': {}}
    try {
        basicSpecInfo.properties['name'] = (phu.cards["OBJID"] || phu.cards["OBJNAME"]).value;
    }
    catch (TypeError) {
        basicSpecInfo.properties['name'] = '';
    }
    // TODO: Repeat for other information
    // EXCEPT ID will need to be auto-generated once all read-in spectra are
    // known



    // Count the number of extensions within the file
    const noExt = this.fits.hdus.length()
    // If single-extension, pass off to the single extension reader(s)
    if (noExt == 1) {
        spectra = parseSingleExtensionFitsFile(q, originalFilename);
    } else {
        spectra = parseMultiExtensionFitsFile(q, originalFilename);
    }
    // If multi-extension, pass off to the multi-extension reader

    // Pass off to reader functions, and process returned information into
    // data structure
    // This step resolves the promise and binds 'this' correctly
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

getRawWavelengthsSpectrum(ext) {
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
            lambda.push(((i + 1 - crpix) * Math.pow(10, cdelt)) + Math.pow(10, crval));
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

}



parseSingleExtensionFitsFile(q, originalFilename) {

    // Read header information into properties
    var spectrum = {
        'properties': {}
    }
    spectrum.properties["name"] = readHeaderValue(0, "OBJID") || readHeaderValue("OBJNAME") || ""
    spectrum.properties["ra"] = readHeaderValue(0, "RA") || ""
    spectrum.properties["dec"] = readHeaderValue(0, "DEC") || ""
    spectrum.properties["jd"] = readHeaderValue(0, "JD") || readHeaderValue(0, "JULIAN") || readHeaderValue(0, "MJD") || readHeaderValue(0, "UTMJD") || ""
    spectrum.properties["longitude"] = readHeaderValue(0, "LONG_OBS") || readHeaderValue(0, "LONGITUD") || ""
    spectrum.properties["latitude"] = readHeaderValue(0, "LAT_OBS") || readHeaderValue(0, "LATITUDE") || ""
    spectrum.properties["altitude"] = readHeaderValue(0, "ALT_OBS") || readHeaderValue(0, "ALTITUDE") || ""
    spectrum.properties["epoch"] = readHeaderValue(0, "EPOCH") || ""
    spectrum.properties["radecsys"] = readHeaderValue(0, "RADECSYS") || ""

    // Now need to determine which flavour of information read functions
    // we need to send to
    // This is basically two flavours - table read, and spectrum (1D image) read

    $q.all([this.getWavelengths(), this.getIntensityData(), this.getVarianceData(), this.getSkyData(), this.getDetailsData()]).then(function (data) {

    });

}

parseMultiExtensionFitsFile(q, originalFilename) {
    // Re-check the 'properties' information in case more relevant information
    // is contained in the data extension header
    var spectrum = {
        'properties': {}
    }

    //
}