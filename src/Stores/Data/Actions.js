import AppDispatcher from "../AppDispatcher";

const DataActionTypes = {
    ADD_FILES: 'DataActionTypes.ADD_FILES',
    SET_FITS_FILENAME: 'DataActionTypes.SET_FITS_FILENAME',
    SET_TYPES: 'DataActionTypes.SET_TYPES',
};

function addFiles(files) {
    AppDispatcher.dispatch({
        type: DataActionTypes.ADD_FILES,
        files: files
    })
}

function setFitsFilename(filename) {
    console.log("Setting fits file name", filename)
    AppDispatcher.dispatch({
        type: DataActionTypes.SET_FITS_FILENAME,
        filename: filename
    })
}

function setTypes(types) {
    AppDispatcher.dispatch({
        type: DataActionTypes.SET_TYPES,
        types: types
    })
}

export {
    addFiles,
    setFitsFilename,
    setTypes,
    DataActionTypes
};