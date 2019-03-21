import AppDispatcher from "../AppDispatcher";

const PersonalActionTypes = {
    UPDATE_INITIALS: 'PersonalActionTypes.UPDATE_INITIALS',
}

function updateInitials(initials) {
    AppDispatcher.dispatch({
        type: PersonalActionTypes.UPDATE_INITIALS,
        initials: initials
    })
}

export {
    updateInitials,
    PersonalActionTypes
};