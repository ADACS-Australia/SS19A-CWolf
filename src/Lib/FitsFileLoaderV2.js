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
    return val;
}


parseSingleExtensionFitsFile(q, originalFilename) {

}

parseMultiExtensionFitsFile(q, originalFilename) {
    // Re-check the 'properties' information in case more relevant information
    // is contained in the data extension header
}