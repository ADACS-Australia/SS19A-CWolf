import AppDispatcher from "../AppDispatcher";
import {ReduceStore} from "flux/utils";
import {PersonalActionTypes} from "./Actions";

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
            case PersonalActionTypes.UPDATE_INITIALS:
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