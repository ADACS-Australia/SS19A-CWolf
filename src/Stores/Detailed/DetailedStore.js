import {DetailedActionTypes} from "./Actions";
import Enumerable from "linq";

const defaultBound = {
    xMin: 3300,
    xMax: 7200,
    yMin: -500,
    yMax: 1000,
    top: 30,
    bottom: 30,
    left: 60,
    right: 20,
    width: 300,
    height: 300,
    lockedBounds: false,
    callout: false
};

const defaultView = {
    defaultMin: 3300,
    defaultMax: 7200,
    mainBound: {...defaultBound},
    bounds: [{...defaultBound}]
};

const defaultState = {
    requested: false,

    annotationColour: "#F00",
    xcor: true,
    xcorData: null,
    xcorHeight: 100,
    xcorLineColour: "#F00",
    xcorPlotColour: "#333",
    xcorLineHighlight: "#FFA600",
    xcorBound: {
        top: 15,
        left: 5,
        right: 5,
        bottom: 5,
        height: 100,
        width: 300,
        callout: true,
        xcorCallout: true
    },

    callout: false,
    maxCallouts: 8,
    minCalloutWidth: 350,
// array of [min lambda, max lambda, relative importance of
// viewing that cutout] to define callout windows
    callouts: Enumerable.from([[1000, 1100, 5], [1200, 1260, 10], [1500, 1600, 2], [1850, 2000, 3],
        [2700, 2900, 4], [3700, 3780, 10], [3800, 4100, 7], [4250, 4400, 5], [4800, 5100, 8], [6500, 6800, 9], [6700, 6750, 6]]),
    baseBottom: 40,
    baseTop: 30,
    templateScale: '1',
    minScale: 0.2,
    maxScale: 5,

    axesColour: '#444',
    zeroLineColour: '#111',
    stepColour: '#DDD',
    dragInteriorColour: 'rgba(38, 147, 232, 0.2)',
    dragOutlineColour: 'rgba(38, 147, 232, 0.6)',
    spacingFactor: 1.4,
    calloutSpacingFactor: 1.3,
    templateFactor: 1.5,

    zoomOutWidth: 40,
    zoomOutXOffset: 10,
    zoomOutYOffset: 50,
    downloadYOffset: -10,
    zoomOutHeight: 40,

    cursorColour: 'rgba(104, 0, 103, 0.9)',
    cursorTextColour: '#FFFFFF',
    cursorXGap: 2,
    cursorYGap: 2,

    data: Enumerable.empty(),
    baseData: null,
    template: null,

    labelWidth: 120,
    labelHeight: 60,
    labelFont: '10pt Verdana',
    labelFill: '#222',

    minDragForZoom: 20,
    displayingSpectralLines: true,
    spectralLineColours: ['rgba(0, 115, 255, 1)', 'rgba(0, 115, 255, 1)', 'rgba(30, 200, 50, 1)'],
    spectralLineTextColour: '#FFFFFF',

    templatePixelOffset: 30,

    focusDataX: null,
    focusDataY: null,
    focusCosmeticColour: 'rgba(104, 0, 103, 0.9)',
    focusCosmeticMaxRadius: 6,


    zoomXRatio: 0.98,

    height: 100,
    width: 300,

    startRawTruncate: 5,

    lastXDown: null,
    lastYDown: null,
    currentMouseX: null,
    currentMouseY: null,

    ratio: window.devicePixelRatio || 1.0,
    scale: 1.0,
    canvasWidth: 0.0,
    canvasHeight: 0.0,

    view: {
        ...defaultView
    },

    // For triggering the update of base data
    shouldUpdateBaseData: false,

    // For triggering the update of sky data
    shouldUpdateSkyData: false,

    // For triggering the update of template data
    shouldUpdateTemplateData: false,

    // For triggering the update of xcor data
    shouldUpdateXcorData: false,

    // For triggering the update of smooth data
    shouldUpdateSmoothData: false,
};

class DetailedStore {
    constructor(store) {
        this.store = store;
    }

    key() {
        return 'detailed';
    }

    getInitialState() {
        return {
            ...defaultState
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case DetailedActionTypes.SET_SHOULD_UPDATE_BASE_DATA:
                // Set the base data update flag
                state.shouldUpdateBaseData = true;

                return {...state};

            case DetailedActionTypes.CLEAR_SHOULD_UPDATE_BASE_DATA:
                // Clear the base data update flag
                state.shouldUpdateBaseData = false;

                return {...state};

            case DetailedActionTypes.SET_SHOULD_UPDATE_XCOR_DATA:
                // Set the base data update flag
                state.shouldUpdateXcorData = true;

                return {...state};

            case DetailedActionTypes.CLEAR_SHOULD_UPDATE_XCOR_DATA:
                // Clear the base data update flag
                state.shouldUpdateXcorData = false;

                return {...state};

            case DetailedActionTypes.SET_SHOULD_UPDATE_TEMPLATE_DATA:
                // Set the base data update flag
                state.shouldUpdateTemplateData = true;

                return {...state};

            case DetailedActionTypes.CLEAR_SHOULD_UPDATE_TEMPLATE_DATA:
                // Clear the base data update flag
                state.shouldUpdateTemplateData = false;

                return {...state};

            case DetailedActionTypes.SET_SHOULD_UPDATE_SKY_DATA:
                // Set the base data update flag
                state.shouldUpdateSkyData = true;

                return {...state};

            case DetailedActionTypes.CLEAR_SHOULD_UPDATE_SKY_DATA:
                // Clear the base data update flag
                state.shouldUpdateSkyData = false;

                return {...state};

            case DetailedActionTypes.SET_SHOULD_UPDATE_SMOOTH_DATA:
                // Set the base data update flag
                state.shouldUpdateSmoothData = true;

                return {...state};

            case DetailedActionTypes.CLEAR_SHOULD_UPDATE_SMOOTH_DATA:
                // Clear the base data update flag
                state.shouldUpdateSmoothData = false;

                return {...state};

            default:
                return state;
        }
    }
}

export default DetailedStore;