/*
Flux setup.

Here we create two functions, one to get the list of Stores in the application that should subscribe to actions, and
another that should describe how the state from the stores should be passed down to components
*/

import MarzApp from "../Components/MarzApp";
import {Container} from 'flux/utils';
import Store from "../Stores/Store";

// Returns the list of flux stores that are subscribed to actions sent from within components
function getStores() {
    return [
        Store,
    ]
}

// Returns a dictionary that describes how the state is transposed from stores to components
function getState() {
    const state = Store.getState();
    const index = state.index;
    return {
        personal: state.personal,
        detailed: state.s[index].detailed,
        data: state.s[index].data,
        ui: state.s[index].ui,
        settings: state.settings,
        template: state.template
    }
}

export default Container.createFunctional(MarzApp, getStores, getState);