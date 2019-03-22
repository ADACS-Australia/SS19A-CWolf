import AppDispatcher from "../AppDispatcher";

const DataActionTypes = {
    ADD_FILES: 'DataActionTypes.ADD_FILES',
};

function addFiles(files, index) {
    AppDispatcher.dispatch({
        type: DataActionTypes.ADD_FILES,
        index: index,
        files: files
    })
}

export {
    addFiles,
    DataActionTypes
};