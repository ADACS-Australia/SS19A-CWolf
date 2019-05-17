import AppDispatcher from "./AppDispatcher";

const StoreActionTypes = {
    STORE_READY: 'StoreActionTypes.STORE_READY',
};

function storeReady() {
    AppDispatcher.dispatch({
        type: StoreActionTypes.STORE_READY
    })
}

export {
    StoreActionTypes,
    storeReady,
}