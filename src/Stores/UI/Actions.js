import AppDispatcher from "../AppDispatcher";

const UIActionTypes = {
    SET_MERGE: 'UIActionTypes.SET_MERGE',
    UPDATE_REDSHIFT: "UIActionTypes.UPDATE_REDSHIFT",
    UPDATE_TEMPLATE_OFFSET: "UIActionTypes.UPDATE_TEMPLATE_OFFSET",
    SET_ACTIVE: "UIActionTypes.SET_ACTIVE",
    SET_TEMPLATE_ID: "UIActionTypes.SET_TEMPLATE_ID",
    SET_PROCESSED: "UIActionTypes.SET_PROCESSED",
    SET_VARIANCE: "UIActionTypes.SET_VARIANCE",
    RESET_TO_AUTOMATIC: "UIActionTypes.RESET_TO_AUTOMATIC",
    RESET_TO_MANUAL: "UIActionTypes.RESET_TO_MANUAL",
    // TODO: refactor these somewhere more relevant
    UPDATE_NUMBER_PROCESSED: "UIActionTypes.UPDATE_NUMBER_PROCESSED",
    UPDATE_NUMBER_MATCHED: "UIActionTypes.UPDATE_NUMBER_MATCHED",
};

function setMerge(merge) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_MERGE,
        merge: merge,
    })
}

function updateRedShift(redshift) {
    AppDispatcher.dispatch({
        type: UIActionTypes.UPDATE_REDSHIFT,
        redshift: redshift
    })
}

function updateTemplateOffset(templateOffset) {
    AppDispatcher.dispatch({
        type: UIActionTypes.UPDATE_TEMPLATE_OFFSET,
        templateOffset: templateOffset
    })
}

function setActive(spectra) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_ACTIVE,
        spectra: spectra
    })
}

function setTemplateId(id) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_TEMPLATE_ID,
        id: id
    })
}

function setProcessed(processed) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_PROCESSED,
        processed: processed
    })
}

function setVariance(processed) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_VARIANCE,
        processed: processed
    })
}

function resetToAutomatic() {
    AppDispatcher.dispatch({
        type: UIActionTypes.RESET_TO_AUTOMATIC,
    })
}

function resetToManual() {
    AppDispatcher.dispatch({
        type: UIActionTypes.RESET_TO_MANUAL
    })
}

function updateNumberProcessed() {
    AppDispatcher.dispatch({
        type: UIActionTypes.UPDATE_NUMBER_PROCESSED,
    })
}

function updateNumberMatched() {
    AppDispatcher.dispatch({
        type: UIActionTypes.UPDATE_NUMBER_MATCHED,
    })
}

export {
    setMerge,
    updateTemplateOffset,
    updateRedShift,
    setActive,
    setTemplateId,
    setProcessed,
    setVariance,
    resetToAutomatic,
    resetToManual,
    updateNumberMatched,
    updateNumberProcessed,
    UIActionTypes,
};