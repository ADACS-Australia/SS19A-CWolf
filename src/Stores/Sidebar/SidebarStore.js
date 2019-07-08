import {SidebarActionTypes} from "./Actions";
import CookieManager from "../../Lib/CookieManager";
import {templateManager} from "../../Lib/TemplateManager";
import * as Enumerable from "linq";
import {DataActionTypes} from "../Data/Actions";

class SidebarStore {
    constructor(store) {
        this.store = store;
    }

    key() {
        return 'sidebar';
    }

    getInitialState() {
        const temps = [{value: '*', label: "Any template"}];
        Enumerable.from(templateManager.getTemplates()).forEach(template =>
            temps.push({value: template.id, label: template.name})
        );
        const types = [{value: '*', label: "Any type"}];
        return {
            qops: [
                {value: '*', label: "Any QOP"},
                {value: 4, label: "QOP 4"},
                {value: 3, label: "QOP 3"},
                {value: 2, label: "QOP 2"},
                {value: 1, label: "QOP 1"},
                {value: 6, label: "QOP 6"},
                {value: 0, label: "QOP 0"}
            ],
            redshifts: [
                {value: '*', label: 'All redshifts'},
                {value: '-0.002:0.005', label: 'Stellar redshifts [-0.002:0.1]'},
                {value: '0.005:0.3', label: 'Close galaxy redshifts [0:0.3]'},
                {value: '0.3:1.5', label: 'Distant galaxy redshifts [0.3:1.5]'},
                {value: '0.005:1.5', label: 'All galaxy redshifts [0:1.5]'},
                {value: '1:9', label: 'Distant redshifts [1:9]'}
            ],
            temps: temps,
            types: types,
            filters: {
                typeFilter: '*',
                templateFilter: '*',
                redshiftFilter: '*',
                qopFilter: '*'
            },
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case DataActionTypes.SET_TYPES:

                const types = [{value: '*', label: "Any type"}];
                Enumerable.from(action.types).forEach(t =>
                    types.push({value: t, label: t})
                );

                state.types = types;

                return {
                    ...state
                };

            default:
                return state;
        }
    }
}

export default SidebarStore;