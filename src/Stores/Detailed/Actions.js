import AppDispatcher from "../AppDispatcher";

const DetailedActionTypes = {
    UPDATE_REDSHIFT: "DetailedActionTypes.UPDATE_REDSHIFT",
    UPDATE_TEMPLATE_OFFSET: "DetailedActionTypes.UPDATE_TEMPLATE_OFFSET",
    UPDATE_BOUNDS: "DetailedActionTypes.UPDATE_BOUNDS",
};

function updateRedShift(id, redshift) {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.UPDATE_REDSHIFT,
        id: id,
        redshift: redshift
    })
}

function updateTemplateOffset(id, templateOffset) {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.UPDATE_TEMPLATE_OFFSET,
        id: id,
        templateOffset: templateOffset
    })
}

function updateBounds(id, bounds) {
    AppDispatcher.dispatch({
        type: DetailedActionTypes.UPDATE_BOUNDS,
        id: id,
        bounds: bounds
    })
}

export {
    DetailedActionTypes,
    updateRedShift,
    updateTemplateOffset,
    updateBounds,
};