import {PersonalActionTypes} from "./Actions";
import CookieManager from "../../Lib/CookieManager";

class PersonalStore {
    constructor(store) {
        this.store = store;
    }

    key() {
        return 'personal';
    }

    getInitialState() {
        return {
            initials: CookieManager.registerCookieValue("initials", "")
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case PersonalActionTypes.UPDATE_INITIALS:
                CookieManager.setCookie("initials", action.initials);
                return {
                    ...state,
                    initials: action.initials,
                };

            default:
                return state;
        }
    }
}

export default PersonalStore;