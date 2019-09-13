import AppDispatcher from "../AppDispatcher";
import {DataActionTypes} from "../Data/Actions";

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
    //
    SET_SMOOTH: "UIActionTypes.SET_SMOOTH",
    SET_TEMPLATE_MATCHED: "UIActionTypes.SET_TEMPLATE_MATCHED",
    SET_CONTINUUM: "UIActionTypes.SET_CONTINUUM",
    SET_RANGE_INDEX: "UIActionTypes.SET_RANGE_INDEX",
    SELECT_MATCH: "UIActionTypes.SELECT_MATCH",
    TOGGLE_SPECTRAL_LINES: "UIActionTypes.TOGGLE_SPECTRAL_LINES",
    PREVIOUS_SPECTRAL_LINE: "UIActionTypes.PREVIOUS_SPECTRAL_LINE",
    NEXT_SPECTRAL_LINE: "UIActionTypes.NEXT_SPECTRAL_LINE",
    CLICK_SPECTRAL_LINE: "UIActionTypes.CLICK_SPECTRAL_LINE",
    PERFORM_FIT: "UIActionTypes.PERFORM_FIT",

    // TODO: refactor to Overview store?
    TOGGLE_SMALL_SIDEBAR: "UIActionTypes.TOGGLE_SMALL_SIDEBAR",
    //

    SET_GRAPHICAL_LAYOUT: "UIActionTypes.SET_GRAPHICAL_LAYOUT",

    ACCEPT_AUTO_QOP: "UIActionTypes.ACCEPT_AUTO_QOP",
    SET_WAITING_FOR_SPECTRA: "UIActionTypes.SET_WAITING_FOR_SPECTRA",
    SET_SPECTRA_FOCUS: "UIActionTypes.SET_SPECTRA_FOCUS"
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

function setVariance(variance) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_VARIANCE,
        variance: variance
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

function setSmooth(smoothValue) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_SMOOTH,
        smoothValue: smoothValue
    })
}

function setTemplateMatched(matched) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_TEMPLATE_MATCHED,
        matched: matched
    })
}

function setContinuum(continuum) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_CONTINUUM,
        continuum: continuum
    })
}

function setRangeIndex(rangeIndex) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_RANGE_INDEX,
        rangeIndex: rangeIndex
    })
}

function selectMatch(match) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SELECT_MATCH,
        redshift: match.z,
        templateId: match.templateId
    })
}

function toggleSpectralLines() {
    AppDispatcher.dispatch({
        type: UIActionTypes.TOGGLE_SPECTRAL_LINES,
    })
}

function previousSpectralLine() {
    AppDispatcher.dispatch({
        type: UIActionTypes.PREVIOUS_SPECTRAL_LINE,
    })
}

function nextSpectralLine() {
    AppDispatcher.dispatch({
        type: UIActionTypes.NEXT_SPECTRAL_LINE,
    })
}

function clickSpectralLine(id) {
    AppDispatcher.dispatch({
        type: UIActionTypes.CLICK_SPECTRAL_LINE,
        id: id,
    })
}

function performFit() {
    AppDispatcher.dispatch({
        type: UIActionTypes.PERFORM_FIT,
    })
}

function toggleSmallSidebar() {
    AppDispatcher.dispatch({
        type: UIActionTypes.TOGGLE_SMALL_SIDEBAR,
    })
}

function setGraphicalLayout(graphical) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_GRAPHICAL_LAYOUT,
        graphical: graphical
    })
}

function acceptAutoQOP() {
    AppDispatcher.dispatch({
        type: UIActionTypes.ACCEPT_AUTO_QOP,
    })
}

function setWaitingForSpectra(waiting) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_WAITING_FOR_SPECTRA,
        waiting: waiting
    })
}

function setSpectraFocus(focus) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_SPECTRA_FOCUS,
        focus: focus
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
    setSmooth,
    setTemplateMatched,
    setContinuum,
    setRangeIndex,
    selectMatch,
    toggleSpectralLines,
    previousSpectralLine,
    nextSpectralLine,
    clickSpectralLine,
    performFit,
    toggleSmallSidebar,
    setGraphicalLayout,
    acceptAutoQOP,
    setWaitingForSpectra,
    setSpectraFocus,
    UIActionTypes,
};