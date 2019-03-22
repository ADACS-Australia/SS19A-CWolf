import AppDispatcher from "../AppDispatcher";

const UIActionTypes = {
    SET_MERGE: 'UIActionTypes.SET_MERGE',
    UPDATE_REDSHIFT: "UIActionTypes.UPDATE_REDSHIFT",
    UPDATE_TEMPLATE_OFFSET: "UIActionTypes.UPDATE_TEMPLATE_OFFSET",
};

function setMerge(index, merge) {
    AppDispatcher.dispatch({
        type: UIActionTypes.SET_MERGE,
        index: index,
        merge: merge,
    })
}

function updateRedShift(index, redshift) {
    AppDispatcher.dispatch({
        type: UIActionTypes.UPDATE_REDSHIFT,
        index: index,
        redshift: redshift
    })
}

function updateTemplateOffset(index, templateOffset) {
    AppDispatcher.dispatch({
        type: UIActionTypes.UPDATE_TEMPLATE_OFFSET,
        index: index,
        templateOffset: templateOffset
    })
}

export {
    setMerge,
    updateTemplateOffset,
    updateRedShift,
    UIActionTypes
};