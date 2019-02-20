/*
Flux setup.

Here we create two functions, one to get the list of Stores in the application that should subscribe to actions, and
another that should describe how the state from the stores should be passed down to components
*/

import PersonalStore from "../Stores/Personal/PersonalStore";
import MarzApp from "../Components/MarzApp";
import {Container} from 'flux/utils';

// Returns the list of flux stores that are subscribed to actions sent from within components
function getStores() {
    return [
        PersonalStore,
    ]
}

// Returns a dictionary that describes how the state is transposed from stores to components
function getState() {
    return {
        personal: PersonalStore.getState(),
    }
}

export default Container.createFunctional(MarzApp, getStores, getState);