import AppDispatcher from "../AppDispatcher";

const UIActionTypes = {
    SET_MERGE: 'UIActionTypes.SET_MERGE',
    UPDATE_REDSHIFT: "UIActionTypes.UPDATE_REDSHIFT",
    UPDATE_TEMPLATE_OFFSET: "UIActionTypes.UPDATE_TEMPLATE_OFFSET",
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

export {
    setMerge,
    updateTemplateOffset,
    updateRedShift,
    UIActionTypes
};