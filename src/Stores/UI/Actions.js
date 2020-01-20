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
    SET_SKY: "UIActionTypes.SET_SKY",
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
    SET_MATCHED_INDEX: "UIActionTypes.SET_MATCHED_INDEX",
    TOGGLE_SPECTRAL_LINES: "UIActionTypes.TOGGLE_SPECTRAL_LINES",
    PREVIOUS_SPECTRAL_LINE: "UIActionTypes.PREVIOUS_SPECTRAL_LINE",
    NEXT_SPECTRAL_LINE: "UIActionTypes.NEXT_SPECTRAL_LINE",
    CLICK_SPECTRAL_LINE: "UIActionTypes.CLICK_SPECTRAL_LINE",
    PERFORM_FIT: "UIActionTypes.PERFORM_FIT",

    // TODO: refactor to Overview store?
    TOGGLE_SMALL_SIDEBAR: "UIActionTypes.TOGGLE_SMALL_SIDEBAR",
    READONLYVIEW: "UIActionTypes.READONLYVIEW",
    SIMPLEVIEW: "UIActionTypes.SIMPLEVIEW",
    OVERLAYVIEW: "UIActionTypes.OVERLAYVIEW",
    //

    SET_GRAPHICAL_LAYOUT: "UIActionTypes.SET_GRAPHICAL_LAYOUT",

    ACCEPT_AUTO_QOP: "UIActionTypes.ACCEPT_AUTO_QOP",
    SET_WAITING_FOR_SPECTRA: "UIActionTypes.SET_WAITING_FOR_SPECTRA",
    SET_SPECTRA_FOCUS: "UIActionTypes.SET_SPECTRA_FOCUS",

    SAVE_MANUAL: "UIActionTypes.SAVE_MANUAL",
    SET_ONLY_QOP_0: "UIActionTypes.SET_ONLY_QOP_0",

    SET_SPECTRA_COMMENT: "UIActionTypes.SET_SPECTRA_COMMENT",

    NEXT_MATCHED_DETAILS: "UIActionTypes.NEXT_MATCHED_DETAILS",
    PREV_MATCHED_DETAILS: "UIActionTypes.PREV_MATCHED_DETAILS",
    FIT_NOW: "UIActionTypes.FIT_NOW",
    RESET_ZOOM: "UIActionTypes.RESET_ZOOM",
    NEXT_TEMPLATE: "UIActionTypes.NEXT_TEMPLATE",
    PREV_TEMPLATE: "UIActionTypes.PREV_TEMPLATE",
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

function setSky(sky) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_SKY,
        sky: sky
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

function setMatchedIndex(matchedIndex, match) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_MATCHED_INDEX,
        matchedIndex: matchedIndex,
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

function selectReadOnlyView() {
    AppDispatcher.dispatch({
        type: UIActionTypes.READONLYVIEW,
    })
}

function selectSimpleView() {
    AppDispatcher.dispatch({
        type: UIActionTypes.SIMPLEVIEW,
    })
}

function selectOverlayView() {
    AppDispatcher.dispatch({
        type: UIActionTypes.OVERLAYVIEW,
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

function saveManual(qop) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SAVE_MANUAL,
        qop: qop
    })
}

function setOnlyQOP0(bOnlyQOP0) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_ONLY_QOP_0,
        bOnlyQOP0: bOnlyQOP0
    })
}

function setSpectraComment(comment) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_SPECTRA_COMMENT,
        comment: comment
    })
}

function nextMatchedDetails() {
    AppDispatcher.dispatch({
        type: UIActionTypes.NEXT_MATCHED_DETAILS,
    })
}

function prevMatchedDetails() {
    AppDispatcher.dispatch({
        type: UIActionTypes.PREV_MATCHED_DETAILS,
    })
}

function fitNow() {
    AppDispatcher.dispatch({
        type: UIActionTypes.FIT_NOW
    })
}

function resetZoom() {
    AppDispatcher.dispatch({
        type: UIActionTypes.RESET_ZOOM
    })
}

function nextTemplate() {
    AppDispatcher.dispatch({
        type: UIActionTypes.NEXT_TEMPLATE
    })
}

function prevTemplate() {
    AppDispatcher.dispatch({
        type: UIActionTypes.PREV_TEMPLATE
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
    setSky,
    resetToAutomatic,
    resetToManual,
    updateNumberMatched,
    updateNumberProcessed,
    setSmooth,
    setTemplateMatched,
    setContinuum,
    setRangeIndex,
    setMatchedIndex,
    toggleSpectralLines,
    previousSpectralLine,
    nextSpectralLine,
    clickSpectralLine,
    performFit,
    toggleSmallSidebar,
    selectReadOnlyView,
    selectSimpleView,
    selectOverlayView,
    setGraphicalLayout,
    acceptAutoQOP,
    setWaitingForSpectra,
    setSpectraFocus,
    saveManual,
    setOnlyQOP0,
    setSpectraComment,
    nextMatchedDetails,
    prevMatchedDetails,
    fitNow,
    resetZoom,
    nextTemplate,
    prevTemplate,
    UIActionTypes,
};