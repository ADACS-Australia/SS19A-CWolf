import AppDispatcher from "../AppDispatcher";

const SettingsActionTypes = {
    RESET_DOWNLOAD_AUTOMATICALLY: 'SettingsActionTypes.RESET_DOWNLOAD_AUTOMATICALLY',
    UPDATE_DOWNLOAD_AUTOMATICALLY: 'SettingsActionTypes.UPDATE_DOWNLOAD_AUTOMATICALLY',
    RESET_SAVE_AUTOMATICALLY: 'SettingsActionTypes.RESET_SAVE_AUTOMATICALLY',
    UPDATE_SAVE_AUTOMATICALLY: 'SettingsActionTypes.UPDATE_SAVE_AUTOMATICALLY',
    RESET_ASSIGN_AUTO_QOPS: 'SettingsActionTypes.RESET_ASSIGN_AUTO_QOPS',
    UPDATE_ASSIGN_AUTO_QOPS: 'SettingsActionTypes.UPDATE_ASSIGN_AUTO_QOPS',
    RESET_PROCESS_TOGETHER: 'SettingsActionTypes.RESET_PROCESS_TOGETHER',
    UPDATE_PROCESS_TOGETHER: 'SettingsActionTypes.UPDATE_PROCESS_TOGETHER',
    RESET_NUMBER_PROCESSORS: 'SettingsActionTypes.RESET_NUMBER_PROCESSORS',
    UPDATE_NUMBER_PROCESSORS: 'SettingsActionTypes.UPDATE_NUMBER_PROCESSORS',
    RESET_NUM_AUTOMATIC: 'SettingsActionTypes.RESET_NUM_AUTOMATIC',
    UPDATE_NUM_AUTOMATIC: 'SettingsActionTypes.UPDATE_NUM_AUTOMATIC',
};

function updateDownloadAutomatically(downloadAutomatically) {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.UPDATE_DOWNLOAD_AUTOMATICALLY,
        downloadAutomatically: downloadAutomatically
    })
}

function resetDownloadAutomatically() {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.RESET_DOWNLOAD_AUTOMATICALLY,
    })
}

function updateSaveAutomatically(saveAutomatically) {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.UPDATE_SAVE_AUTOMATICALLY,
        saveAutomatically: saveAutomatically
    })
}

function resetSaveAutomatically() {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.RESET_SAVE_AUTOMATICALLY,
    })
}

function updateAssignAutoQOPs(assignAutoQOPs, cookieIt) {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.UPDATE_ASSIGN_AUTO_QOPS,
        assignAutoQOPs: assignAutoQOPs,
        cookieIt: cookieIt
    })
}

function resetAssignAutoQOPs() {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.RESET_ASSIGN_AUTO_QOPS,
    })
}

function updateProcessTogether(processTogether) {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.UPDATE_PROCESS_TOGETHER,
        processTogether: processTogether
    })
}

function resetProcessTogether() {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.RESET_PROCESS_TOGETHER,
    })
}

function updateNumberProcessors(numberProcessors) {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.UPDATE_NUMBER_PROCESSORS,
        numberProcessors: parseInt(numberProcessors)
    })
}

function resetNumberProcessors() {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.RESET_NUMBER_PROCESSORS
    })
}

function updateNumAutomatic(numAutomatic) {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.UPDATE_NUM_AUTOMATIC,
        numAutomatic: parseInt(numAutomatic)
    })
}

function resetNumAutomatic() {
    AppDispatcher.dispatch({
        type: SettingsActionTypes.RESET_NUM_AUTOMATIC
    })
}

function resetToDefaults() {
    resetDownloadAutomatically();
    resetSaveAutomatically();
    resetNumberProcessors();
    resetAssignAutoQOPs();
    resetProcessTogether();
    resetNumAutomatic();
}

export {
    updateDownloadAutomatically,
    resetDownloadAutomatically,
    updateSaveAutomatically,
    resetSaveAutomatically,
    updateAssignAutoQOPs,
    resetAssignAutoQOPs,
    updateProcessTogether,
    resetProcessTogether,
    updateNumberProcessors,
    resetNumberProcessors,
    updateNumAutomatic,
    resetNumAutomatic,
    resetToDefaults,
    SettingsActionTypes
};