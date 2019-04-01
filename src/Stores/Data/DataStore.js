import {DataActionTypes} from "./Actions";
import {setMerge} from "../UI/Actions";
import FitsFileLoader from "../../Lib/FitsFileLoader";
import ResultsManager from "../../Lib/ResultsManager";
import Processor from "../../Lib/Processor";

class DataStore {
    constructor(store) {
        this.store = store;
    }

    key() {
        return 'data';
    }

    getInitialState() {
        const state = {
            fits: [],
            types: [],
            fitsFileName: null,
            spectra: [],
            spectraHash: {},
            history: [],

            numDrag: 0,
        };

        // todo: Refactor to top level store
        state.resultsManager = new ResultsManager();
        state.processorService = new Processor(this.store, state.resultsManager);
        state.fitsFileLoader = new FitsFileLoader(state.processorService, state.resultsManager);

        state.fitsFileLoader.subscribeToInput(s => state.processorService.spectraManager.setSpectra(s));
        state.fitsFileLoader.subscribeToInput(spectraList => state.processorService.addSpectraListToQueue(spectraList));

        return state;
    }

    addFiles(oldState, files) {
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

        setTimeout(() => setMerge(false), 0);

        const lastNumDrag = state.numDrag;
        const lastFitsLength = state.fits.length;

        for (let i = 0; i < files.length; i++) {
            if (!files[i].name.endsWith('fits') && !files[i].name.endsWith('fit')) {
                resultsLoaderService.loadResults(files[i]);
            }
        }
        let first = true;
        for (let i = 0; i < files.length; i++) {
            if (files[i].name.endsWith('fits') || files[i].name.endsWith('fit')) {
                state.numDrag++;
                if (first) {
                    first = false;
                    state.fits.length = 0;
                }
                state.fits.push(files[i]);
            }
        }

        if (lastNumDrag !== state.numDrag || lastFitsLength !== state.fits.length)
        {
            if (state.fits.length > 0)
            {
                state.fitsFileLoader.loadInFitsFile(state.fits[0]).then(function() { console.log('Fits file loaded');});
            }
        }


        return state;
    }

    reduce(state, action) {
        switch (action.type) {
            case DataActionTypes.ADD_FILES:
                return this.addFiles(state, action.files);

            case DataActionTypes.SET_FITS_FILENAME:
                state.fitsFileName = action.filename;
                return {
                    ...state
                };

            case DataActionTypes.SET_TYPES:
                state.types = action.types;
                return {
                    ...state
                };

            default:
                return state;
        }
    }
}

export default DataStore;