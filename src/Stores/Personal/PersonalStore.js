import {PersonalActionTypes} from "./Actions";
import CookieManager from "../../Lib/CookieManager";

class PersonalStore {
    constructor() {
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
                console.log(action)
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