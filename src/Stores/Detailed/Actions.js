import AppDispatcher from "../AppDispatcher";
import {UIActionTypes} from "../UI/Actions";

const DetailedActionTypes = {
    SET_SHOULD_UPDATE_BASE_DATA: "DetailedActionTypes.SET_SHOULD_UPDATE_BASE_DATA",
    CLEAR_SHOULD_UPDATE_BASE_DATA: "DetailedActionTypes.CLEAR_SHOULD_UPDATE_BASE_DATA",
    SET_SHOULD_UPDATE_XCOR_DATA: "DetailedActionTypes.SET_SHOULD_UPDATE_XCOR_DATA",
    CLEAR_SHOULD_UPDATE_XCOR_DATA: "DetailedActionTypes.CLEAR_SHOULD_UPDATE_XCOR_DATA",
    SET_SHOULD_UPDATE_TEMPLATE_DATA: "DetailedActionTypes.SET_SHOULD_UPDATE_TEMPLATE_DATA",
    CLEAR_SHOULD_UPDATE_TEMPLATE_DATA: "DetailedActionTypes.CLEAR_SHOULD_UPDATE_TEMPLATE_DATA",
    SET_SHOULD_UPDATE_SKY_DATA: "DetailedActionTypes.SET_SHOULD_UPDATE_SKY_DATA",
    CLEAR_SHOULD_UPDATE_SKY_DATA: "DetailedActionTypes.CLEAR_SHOULD_UPDATE_SKY_DATA",
    SET_SHOULD_UPDATE_SMOOTH_DATA: "DetailedActionTypes.SET_SHOULD_UPDATE_SMOOTH_DATA",
    CLEAR_SHOULD_UPDATE_SMOOTH_DATA: "DetailedActionTypes.CLEAR_SHOULD_UPDATE_SMOOTH_DATA",
};

function setShouldUpdateBaseData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.SET_SHOULD_UPDATE_BASE_DATA
    })
}

function clearShouldUpdateBaseData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.CLEAR_SHOULD_UPDATE_BASE_DATA
    })
}

function setShouldUpdateXcorData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.SET_SHOULD_UPDATE_XCOR_DATA
    })
}

function clearShouldUpdateXcorData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.CLEAR_SHOULD_UPDATE_XCOR_DATA
    })
}

function setShouldUpdateTemplateData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.SET_SHOULD_UPDATE_TEMPLATE_DATA
    })
}

function clearShouldUpdateTemplateData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.CLEAR_SHOULD_UPDATE_TEMPLATE_DATA
    })
}

function setShouldUpdateSkyData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.SET_SHOULD_UPDATE_SKY_DATA
    })
}

function clearShouldUpdateSkyData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.CLEAR_SHOULD_UPDATE_SKY_DATA
    })
}

function setShouldUpdateSmoothData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.SET_SHOULD_UPDATE_SMOOTH_DATA
    })
}

function clearShouldUpdateSmoothData() {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.CLEAR_SHOULD_UPDATE_SMOOTH_DATA
    })
}

export {
    setShouldUpdateBaseData,
    clearShouldUpdateBaseData,
    setShouldUpdateXcorData,
    clearShouldUpdateXcorData,
    setShouldUpdateSkyData,
    clearShouldUpdateSkyData,
    setShouldUpdateSmoothData,
    clearShouldUpdateSmoothData,
    setShouldUpdateTemplateData,
    clearShouldUpdateTemplateData,
    DetailedActionTypes,
};