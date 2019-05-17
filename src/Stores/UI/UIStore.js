import {setTemplateId, UIActionTypes, updateRedShift} from "./Actions";
import {
    setShouldUpdateBaseData,
    setShouldUpdateSkyData,
    setShouldUpdateTemplateData,
    setShouldUpdateXcorData
} from "../Detailed/Actions";

class UIStore {
    constructor(store) {
        this.store = store;
    }

    key() {
        return 'ui';
    }

    getInitialState() {
        return {
            merge: false,
            mergeDefault: 0,
            mergeInitials: [],
            active: null,
            graphicalLayout: true,
            sidebarSmall: false,
            dataSelection: {
                processed: true,
                matched: true,
                variance: false
            },
            quality: {
                max: 0,
                bars: [],
                barHash: {}
            },
            detailed: {
                bounds: {
                    redshiftMin: 0,
                    redshiftMax: 5,
                    maxMatches: 5,
                    maxSmooth: 7
                },
                templateOffset: 0,
                onlyQOP0: true,
                templateId: '0',
                continuum: true,
                redshift: "0",
                oldRedshift: "0",
                matchedActive: true,
                matchedIndex: null,
                rangeIndex: 0,
                ranges: [100, 99.5, 99, 98],
                mergeIndex: 0,
                smooth: "3",
                width: 300,
                spectraFocus: null,
                spectralLines: true,
                waitingForSpectra: false,
                lockedBounds: false,
                lockedBoundsCounter: 1,
                skyHeight: 125
            },
            colours: {
                unselected: '#E8E8E8',
                raw: "#111111",
                processed: "#005201",
                matched: "#AA0000",
                sky: "#009DFF",
                template: '#8C0623',
                variance: '#E3A700',
                merges: ["#009DFF", "#005201"]
            }
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case UIActionTypes.SET_MERGE:

                // Set the merge state
                state.merge = action.merge;

                return {
                    ...state
                };

            case UIActionTypes.UPDATE_REDSHIFT:

                // Update the redshift
                state.detailed.redshift = action.redshift;

                return {
                    ...state,
                };

            case UIActionTypes.UPDATE_TEMPLATE_OFFSET:

                // Update the template offset
                state.detailed.templateOffset = action.templateOffset;

                return {
                    ...state,
                };

            case UIActionTypes.SET_ACTIVE:
                // Check if the old active is different to the new active
                if (state.active !== action.spectra) {
                    setTimeout(() => setShouldUpdateBaseData(), 0);
                    setTimeout(() => setShouldUpdateSkyData(), 0);
                    setTimeout(() => setShouldUpdateTemplateData(), 0);
                    setTimeout(() => setShouldUpdateXcorData(), 0);
                }

                // Update the active spectra
                state.active = action.spectra;

                return {
                    ...state,
                };

            case UIActionTypes.SET_TEMPLATE_ID:

                // Update the template id
                state.detailed.templateId = action.id;

                return {
                    ...state,
                };

            case UIActionTypes.SET_PROCESSED:
                // Check if the old active is different to the new processed state
                setTimeout(() => setShouldUpdateBaseData(), 0);

                // Update the processed/raw data
                state.dataSelection.processed = action.processed;

                return {
                    ...state,
                };

            case UIActionTypes.SET_VARIANCE:
                // Check if the old active is different to the new variance state
                setTimeout(() => setShouldUpdateBaseData(), 0);

                // Update the processed/raw data
                state.dataSelection.variance = action.variance;

                return {
                    ...state,
                };

            case UIActionTypes.RESET_TO_AUTOMATIC:
                const autoSpectra = state.active;
                if (autoSpectra != null) {
                    const best = autoSpectra.getBestAutomaticResult();
                    if (best != null) {
                        setTimeout(() => setTemplateId(best.templateId), 0);
                        setTimeout(() => updateRedShift(best.z), 0);
                    }
                }
                
                return {
                    ...state
                };

            case UIActionTypes.RESET_TO_MANUAL:
                const manualSpectra = state.active;
                if (manualSpectra != null) {
                    const best = manualSpectra.getManual();
                    if (best != null) {
                        setTimeout(() => setTemplateId(best.templateId), 0);
                        setTimeout(() => updateRedShift(best.z), 0);
                    }
                }

                return {
                    ...state
                };

            case UIActionTypes.UPDATE_NUMBER_MATCHED:
                return {
                    ...state
                };

            case UIActionTypes.UPDATE_NUMBER_PROCESSED:
                return {
                    ...state
                };

            default:
                return state;
        }
    }
}

export default UIStore;