import AppDispatcher from "../AppDispatcher";
import ActionTypes from "../ActionTypes"

function updateInitials(initials) {
    AppDispatcher.dispatch({
        type: ActionTypes.UPDATE_INITIALS,
        initials: initials
    })
}

export {
    updateInitials
};