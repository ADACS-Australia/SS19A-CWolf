import AppDispatcher from "../AppDispatcher";
import {ReduceStore} from "flux/utils";
import {UIActionTypes} from "./Actions";

class UIStore extends ReduceStore {
    constructor() {
        super(AppDispatcher);
    }

    getInitialState() {
        return {
            ui: [
                {
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
            ]
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case UIActionTypes.SET_MERGE:

                // Set the merge state
                state.ui[action.index].merge = action.merge;

                return {
                    ...state
                };

            case UIActionTypes.UPDATE_REDSHIFT:

                // Update the redshift
                state.ui[action.index].detailed.redshift = action.redshift;

                return {
                    ...state,
                };

            case UIActionTypes.UPDATE_TEMPLATE_OFFSET:

                // Update the template offset
                state.ui[action.index].detailed.templateOffset = action.templateOffset;

                return {
                    ...state,
                };

            default:
                return state;
        }
    }
}

export default new UIStore();