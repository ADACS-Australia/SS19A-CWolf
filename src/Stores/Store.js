import AppDispatcher from "./AppDispatcher";
import {ReduceStore} from "flux/utils";
import UIStore from "./UI/UIStore";
import PersonalStore from "./Personal/PersonalStore";
import DataStore from "./Data/DataStore";
import DetailedStore from "./Detailed/DetailedStore";
import * as Enumerable from "linq";

class Store extends ReduceStore {
    constructor() {
        super(AppDispatcher);
    }

    getInitialState() {
        // Register all stores that we manage here
        this.stores = Enumerable.from([
            new UIStore(this),
            new DataStore(this),
            new DetailedStore(this)
        ]);

        // Create any singleton objects
        this.personalStore = new PersonalStore(this);

        // Create the resulting initial dictionary state object
        const result = {
            personal: this.personalStore.getInitialState(),
            index: 0,
            s: [{}]
        };
        this.stores.forEach(s => {
            result.s[0][s.key()] = s.getInitialState();

            // Create accessor
            result.s[0]['get' + s.key().toUpperCase() + s.key().substring(1)] = i => this.getState().s[i][s.key()];
        });

        return result;
    }

    reduce(state, action) {
        // First reduce singletons
        this.personalStore.reduce(state, action);

        // Then reduce any indexed spectra
        this.stores.forEach(s => {
            state.s[state.index][s.key()] = s.reduce(state.s[state.index][s.key()], action);
        });

        return {
            ...state
        }
    }
}

export default new Store();