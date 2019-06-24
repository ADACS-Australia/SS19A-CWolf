import AppDispatcher from "./AppDispatcher";
import {ReduceStore} from "flux/utils";
import UIStore from "./UI/UIStore";
import PersonalStore from "./Personal/PersonalStore";
import DataStore from "./Data/DataStore";
import DetailedStore from "./Detailed/DetailedStore";
import * as Enumerable from "linq";
import SettingsStore from "./Settings/SettingsStore";
import TemplateStore from "./Templates/TemplateStore";

class Store extends ReduceStore {
    constructor() {
        super(AppDispatcher);
    }

    getProps() {
        const state = this.getState();
        const index = state.index;
        return {
            personal: state.personal,
            settings: state.settings,
            template: state.template,
            detailed: state.s[index].detailed,
            data: state.s[index].data,
            ui: state.s[index].ui,
        }
    }

    getInitialState() {
        // Register all stores that we manage here
        this.stores = Enumerable.from([
            new UIStore(this),
            new DataStore(this),
            new DetailedStore(this),
        ]);

        // Create any singleton objects
        this.personalStore = new PersonalStore(this);
        this.settingsStore = new SettingsStore(this);
        this.templateStore = new TemplateStore(this);

        // Create the resulting initial dictionary state object
        const result = {
            personal: this.personalStore.getInitialState(),
            settings: this.settingsStore.getInitialState(),
            template: this.templateStore.getInitialState(),
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
        state.personal = this.personalStore.reduce(state.personal, action);
        state.settings = this.settingsStore.reduce(state.settings, action);
        state.template = this.templateStore.reduce(state.template, action);

        // Then reduce any indexed stores
        this.stores.forEach(s => {
            state.s[state.index][s.key()] = s.reduce(state.s[state.index][s.key()], action);
        });

        return {
            ...state
        }
    }
}

export default new Store();