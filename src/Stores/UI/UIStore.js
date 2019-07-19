import {setTemplateId, UIActionTypes, updateRedShift} from "./Actions";
import {
    setShouldUpdateBaseData,
    setShouldUpdateSkyData,
    setShouldUpdateTemplateData,
    setShouldUpdateXcorData
} from "../Detailed/Actions";
import {spectraLineService} from "../../Components/General/DetailedCanvas/spectralLines";
import {templateManager as templatesService} from "../../Lib/TemplateManager";
import {getFit, getQuasarFFT, getStandardFFT, matchTemplate} from "../../Utils/methods";

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
                smooth: 3,
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
            },
            waitingOnFit: false,
            fitZ: null,
            fitTID: null,
            lineSelected: null,
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
                    setTimeout(() => {
                        setShouldUpdateBaseData();
                        setShouldUpdateSkyData();
                        setShouldUpdateTemplateData();
                        setShouldUpdateXcorData();
                    }, 0);
                }

                // Update the active spectra
                state.active = action.spectra;

                return {
                    ...state,
                };

            case UIActionTypes.SET_TEMPLATE_ID:

                // Update the template id
                state.detailed.templateId = action.id;

                setTimeout(() => {
                    setShouldUpdateTemplateData();
                }, 0);

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

            case UIActionTypes.SET_SMOOTH:
                // Update the smooth value
                state.detailed.smooth = action.smoothValue;

                return {
                    ...state,
                };

            case UIActionTypes.SET_TEMPLATE_MATCHED:
                // Update the matched value
                state.dataSelection.matched = action.matched;

                return {
                    ...state,
                };

            case UIActionTypes.SET_CONTINUUM:
                // Update the continuum value
                state.detailed.continuum = action.continuum;

                return {
                    ...state,
                };

            case UIActionTypes.SET_RANGE_INDEX:
                // Update the range index value
                state.detailed.rangeIndex = action.rangeIndex;

                return {
                    ...state,
                };

            case UIActionTypes.SELECT_MATCH:
                // Set the match redshift and template ID
                state.detailed.redshift = action.redshift;
                state.detailed.templateId = action.templateId;

                return {
                    ...state,
                };

            case UIActionTypes.TOGGLE_SPECTRAL_LINES:
                // Toggle the spectral line display
                state.detailed.spectralLines = !state.detailed.spectralLines;

                return {
                    ...state,
                };

            case UIActionTypes.PREVIOUS_SPECTRAL_LINE:
                const prev = spectraLineService.getPrevious(state.lineSelected);
                if (prev != null)
                    UIStore.clickSpectralLine(prev, state);
                else {
                    const lines = spectraLineService.getAll();
                    if (lines.length > 0)
                        UIStore.clickSpectralLine(lines[0].id, state)
                }
                
                return {
                    ...state
                };

            case UIActionTypes.NEXT_SPECTRAL_LINE:
                const next = spectraLineService.getNext(state.lineSelected);
                if (next != null) {
                    UIStore.clickSpectralLine(next, state);
                } else {
                    const lines = spectraLineService.getAll();
                    if (lines.length > 0) {
                        UIStore.clickSpectralLine(lines[0].id, state);
                    }
                }

                return {
                    ...state
                };

            case UIActionTypes.CLICK_SPECTRAL_LINE:
                UIStore.clickSpectralLine(action.id, state);
                return {
                    ...state
                };

            case UIActionTypes.PERFORM_FIT:
                console.log("Performing fit")
                state.fitTID = state.detailed.templateId;
                state.fitZ = state.detailed.redshift;
                state.waitingOnFit = true;
                if (state.active != null) {
                    if (state.active.processedIntensity == null) {
                        console.log("Added to priority queue")
                        this.store.getState().s[this.store.getState().index].data.addToPriorityQueue(state.active, true);
                        return {
                            ...state
                        };
                    }
                }
                const tid = state.detailed.templateId;
                if (tid == null || tid === "0" || state.active == null) {
                    state.waitingOnFit = false;
                } else {
                    console.log("dofit")
                    this.doFit(state);
                }

                return {
                    ...state
                };

            case UIActionTypes.TOGGLE_SMALL_SIDEBAR:
                state.sidebarSmall = !state.sidebarSmall;

                return {
                    ...state
                };

            case UIActionTypes.SET_GRAPHICAL_LAYOUT:
                state.graphicalLayout = action.graphical;

                return {
                    ...state
                };

            default:
                return state;
        }
    }

    static clickSpectralLine(id, state) {
        if (state.detailed.spectraFocus != null) {
            state.detailed.spectralLines = true;
            state.lineSelected = id;
            const currentWavelength = spectraLineService.getFromID(id).wavelength;
            const desiredWavelength = state.detailed.spectraFocus;
            const z = desiredWavelength/currentWavelength - 1;
            state.detailed.redshift = z.toFixed(5);
            state.detailed.oldRedshift = state.detailed.redshift;
        }
    }

    doFit(state) {
        const s = state.active;
        if (state.fitTID === '0') {
            state.fitTID = state.detailed.templateId;
        }
        if (state.fitTID !== '0') {
            const template = templatesService.getFFTReadyTemplate(state.fitTID);
            let fft = null;
            if (templatesService.isQuasar(state.fitTID)) {
                fft = getQuasarFFT(s.processedLambda, s.processedIntensity.slice(), s.processedVariance.slice());
            } else {
                fft = getStandardFFT(s.processedLambda, s.processedIntensity.slice(), s.processedVariance.slice());
            }

            const results = matchTemplate([template], fft);
            const currentZ = parseFloat(state.fitZ);
            let helio = 0;
            let cmb = 0;
            if (state.active != null && state.active.helio != null) {
                helio = state.active.helio;
                cmb = state.active.cmb;
            }
            const bestZ = getFit(template, results.xcor, currentZ, helio, cmb);
            state.detailed.redshift = bestZ.toFixed(5);
        }
        state.waitingOnFit = false;
    };
}

export default UIStore;