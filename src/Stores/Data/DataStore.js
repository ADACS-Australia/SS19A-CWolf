import AppDispatcher from "../AppDispatcher";
import {ReduceStore} from "flux/utils";
import {DataActionTypes} from "./Actions";
import {setMerge} from "../UI/Actions";

class DataStore extends ReduceStore {
    constructor() {
        super(AppDispatcher);
    }

    getInitialState() {
        return {
            data: [
                {
                    fits: [],
                    types: [],
                    fitsFileName: null,
                    spectra: [],
                    spectraHash: {},
                    history: [],

                    numDrag: 0
                }
            ]
        }
    }

    addFiles(oldState, files, index) {
        // Copy the state
        const state = {
            ...oldState
        };

        if (files.length === 3) {
            let numRes = 0;
            const res = [];
            let numFits = 0;
            let fits = null;
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                if (f.name.endsWith('.mz')) {
                    numRes++;
                    res.push(f);
                } else if (f.name.endsWith('.fits')) {
                    numFits++;
                    fits = f;
                }
            }
            if (numRes === 2 && numFits === 1) {
                mergeService.loadMerge(fits, res);
                return;
            }
        }

        setTimeout(() => setMerge(index, false), 0);

        for (let i = 0; i < files.length; i++) {
            if (!files[i].name.endsWith('fits') && !files[i].name.endsWith('fit')) {
                resultsLoaderService.loadResults(files[i]);
            }
        }
        let first = true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].name.endsWith('fits') || files[i].name.endsWith('fit')) {
                state.data[index].numDrag++;
                if (first) {
                    first = false;
                    state.data[index].fits.length = 0;
                }
                state.data[index].fits.push(files[i]);
            }
        }

        return state;
    }

    reduce(state, action) {
        switch (action.type) {
            case DataActionTypes.ADD_FILES:
                return this.addFiles(state, action.files, action.index);

            default:
                return state;
        }
    }
}

export default new DataStore();