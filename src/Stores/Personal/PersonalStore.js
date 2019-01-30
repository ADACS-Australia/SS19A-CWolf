import AppDispatcher from "../AppDispatcher";
import ActionTypes from "../ActionTypes"
import {ReduceStore} from "flux/utils";

class PersonalStore extends ReduceStore {
    constructor() {
        super(AppDispatcher);
    }

    getInitialState() {
        return {
            initials: localStorage.initials || ""
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case ActionTypes.UPDATE_INITIALS:
                localStorage.initials = action.initials;
                return {
                    ...state,
                    initials: action.initials,
                };

            default:
                return state;
        }
    }
}

export default new PersonalStore();