import {defaultFor, distance, getMax, getMin, shiftWavelength} from '../../../Utils/methods';
import Enumerable from "linq";
import SpectralLines from "./spectralLines";
import {adjustRedshift} from "../../../Utils/dsp";
import {getStrengthOfLine} from "./spectralAnalysis";

import download_image from '../../../Assets/images/download.png';
import lens_image from '../../../Assets/images/lens.png';

const spectraLineService = new SpectralLines();

const dataStore = {
    ui: {
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
    },
    data: {
        fits: [],
        types: [],
        fitsFileName: null,
        spectra: [],
        spectraHash: {},
        history: []
    },
    filters: {
        typeFilter: '*',
        templateFilter: '*',
        redshiftFilter: '*',
        qopFilter: '*'
    },
    personal: {
        initials: ""
    }
};

class CanvasRenderer {

    setScale(extra) {
        extra = defaultFor(extra, 1.0);
        this.scale = this.ratio * extra;
    };

    constructor(props, canvas, parent) {
        // Save the canvas element and get it's 2d rendering context for use later
        this.canvas = canvas;
        this.c = canvas.getContext("2d");

        // Save the props so we have access to the application state
        this.props = props;

        // Save the parent for use later
        this.parent = parent;

        // todo
        this.ui = dataStore.ui;
        // this.detailed = global.ui.detailed;
        this.detailed = dataStore.ui.detailed;

        this.requested = false;

        this.annotationColour = "#F00";
        this.xcor = true;
        this.xcorData = null;
        this.xcorHeight = 100;
        this.xcorLineColour = "#F00";
        this.xcorPlotColour = "#333";
        this.xcorLineHighlight = "#FFA600";
        this.xcorBound = {
            top: 15,
            left: 5,
            right: 5,
            bottom: 5,
            height: this.xcorHeight,
            width: 300,
            callout: true,
            xcorCallout: true
        };

        this.callout = false;
        this.maxCallouts = 8;
        this.minCalloutWidth = 350;
        // array of [min lambda, max lambda, relative importance of
        // viewing that cutout] to define callout windows
        this.callouts = Enumerable.from([[1000, 1100, 5], [1200, 1260, 10], [1500, 1600, 2], [1850, 2000, 3],
            [2700, 2900, 4], [3700, 3780, 10], [3800, 4100, 7], [4250, 4400, 5], [4800, 5100, 8], [6500, 6800, 9], [6700, 6750, 6]]);
        this.defaultMin = 3300;
        this.defaultMax = 7200;
        this.mainBound = {
            xMin: this.defaultMin,
            xMax: this.defaultMax,
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
        this.bounds = [this.mainBound];
        this.baseBottom = 40;
        this.baseTop = 30;
        this.templateScale = '1';
        this.minScale = 0.2;
        this.maxScale = 5;

        this.axesColour = '#444';
        this.zeroLineColour = '#111';
        this.stepColour = '#DDD';
        this.dragInteriorColour = 'rgba(38, 147, 232, 0.2)';
        this.dragOutlineColour = 'rgba(38, 147, 232, 0.6)';
        this.spacingFactor = 1.4;
        this.calloutSpacingFactor = 1.3;
        this.templateFactor = 1.5;

        this.zoomOutWidth = 40;
        this.zoomOutXOffset = 10;
        this.zoomOutYOffset = 50;
        this.downloadYOffset = -10;
        this.zoomOutHeight = 40;
        this.zoomOutImg = new Image();
        this.zoomOutImg.src = lens_image;
        this.downloadImg = new Image();
        this.downloadImg.src = download_image;

        this.cursorColour = 'rgba(104, 0, 103, 0.9)';
        this.cursorTextColour = '#FFFFFF';
        this.cursorXGap = 2;
        this.cursorYGap = 2;

        this.data = Enumerable.empty();
        this.baseData = null;
        this.template = null;

        this.labelWidth = 120;
        this.labelHeight = 60;
        this.labelFont = '10pt Verdana';
        this.labelFill = '#222';

        this.minDragForZoom = 20;
        this.displayingSpectralLines = true;
        this.spectralLineColours = ['rgba(0, 115, 255, 1)', 'rgba(0, 115, 255, 1)', 'rgba(30, 200, 50, 1)'];
        this.spectralLineTextColour = '#FFFFFF';

        this.templatePixelOffset = 30;

        this.focusDataX = null;
        this.focusDataY = null;
        this.focusCosmeticColour = 'rgba(104, 0, 103, 0.9)';
        this.focusCosmeticMaxRadius = 6;


        this.zoomXRatio = 0.8;

        this.height = 100;
        this.width = 300;

        this.startRawTruncate = 5;

        this.lastXDown = null;
        this.lastYDown = null;
        this.currentMouseX = null;
        this.currentMouseY = null;

        this.ratio = window.devicePixelRatio || 1.0;
        this.scale = 1.0;
        this.canvasWidth = 0.0;
        this.canvasHeight = 0.0;

        this.setScale();

        // this.$watchCollection('[ui.dataSelection.processed, detailed.continuum]', function() {
        //     addBaseData();
        //     redraw();
        // });
        // this.$watchCollection('[detailed.templateId, ui.active.templateResults]', function() {
        //     addXcorData();
        //     redraw();
        // });
        // this.$watchCollection('[detailed.redshift, detailed.templateId, ui.dataSelection.matched, detailed.continuum]', function() {
        //     addTemplateData();
        //     redraw();
        // });
        // this.$watch('ui.dataSelection.variance', function() {
        //     addBaseData();
        //     redraw();
        // });
        // this.$watch('ui.dataSelection.sky', function() {
        //     addSkyData();
        //     redraw();
        // });
        // this.$watch('detailed.templateOffset', function(newV, oldV) {
        //     if (newV != oldV) {
        //         redraw();
        //     }
        // });
        // this.$watchCollection('[detailed.lockedBoundsCounter, detailed.lockedBounds]', function() {
        //     if (this.detailed.lockedBounds == false) {
        //         bounds[0].lockedBounds = false;
        //         redraw();
        //     }
        // });
        // this.$watch('detailed.rangeIndex', function(newV, oldV) {
        //     bounds[0].lockedBounds = false; // Unlock the bounds to rescale
        //     redraw()
        // });
        // this.$watch('getActiveHash()', function() {
        //     addBaseData();
        //     addSkyData();
        //     addTemplateData();
        //     addXcorData();
        //     this.detailed.lockedBounds = false;
        //     bounds[0].lockedBounds = false;
        //     redraw();
        // });
        // this.$watch('detailed.smooth', function() {
        //     smoothData('data');
        //     redraw();
        // });
        // this.$watchCollection('[detailed.width, detailed.height, detailed.spectralLines, ui.sidebarSmall]', function() {
        //     redraw();
        // });
    }

    convertCanvasXCoordinateToDataPoint(bound, x) {
        return bound.xMin + ((x - bound.left) / (bound.width)) * (bound.xMax - bound.xMin);
    };

    convertCanvasYCoordinateToDataPoint(bound, y) {
        return bound.yMin + (1 - ((y - bound.top) / (bound.height))) * (bound.yMax - bound.yMin);
    };

    convertDataXToCanvasCoordinate(bound, x) {
        return bound.left + ((x - bound.xMin) / (bound.xMax - bound.xMin)) * bound.width;
    };

    convertDataYToCanvasCoordinate(bound, y) {
        return bound.top + (1 - ((y - bound.yMin) / (bound.yMax - bound.yMin))) * bound.height;
    };

    checkDataXInRange(bound, x) {
        return x >= bound.xMin && x <= bound.xMax;
    };

    checkDataYInRange(bound, y) {
        return y >= bound.yMin && y <= bound.yMax;
    };

    checkDataXYInRange(bound, x, y) {
        return this.checkDataXInRange(bound, x) && this.checkDataYInRange(bound, y);
    };

    checkCanvasYInRange(bound, y) {
        return y >= bound.top && y <= (bound.top + bound.height);
    };

    checkCanvasXInRange(bound, x) {
        return x >= bound.left && x <= (bound.left + bound.width)
    };

    checkCanvasInRange(bound, x, y) {
        if (bound == null) {
            return false;
        }
        return this.checkCanvasXInRange(bound, x) && this.checkCanvasYInRange(bound, y);
    };

    windowToCanvas(e) {
        let result = {};
        let rect = this.canvas.getBoundingClientRect();
        result.x = e.clientX - rect.left;
        result.y = e.clientY - rect.top;
        result.dataX = null;
        result.dataY = null;
        result.bound = null;
        if (this.xcor) {
            if (result.x > this.xcorBound.left && result.x < this.xcorBound.left + this.xcorBound.width
                && result.y > this.xcorBound.top - 15 && result.y < this.xcorBound.top + this.xcorBound.height) {
                result.dataX = this.convertCanvasXCoordinateToDataPoint(this.xcorBound, result.x);
                result.dataY = this.convertCanvasYCoordinateToDataPoint(this.xcorBound, result.y);
                result.bound = this.xcorBound;
            }
        }
        if (result.bound == null) {
            for (let i = 0; i < this.bounds.length; i++) {
                if (this.checkCanvasInRange(this.bounds[i], result.x, result.y)) {
                    result.dataX = this.convertCanvasXCoordinateToDataPoint(this.bounds[i], result.x);
                    result.dataY = this.convertCanvasYCoordinateToDataPoint(this.bounds[i], result.y);
                    result.bound = this.bounds[i];
                    break;
                }
            }
        }
        result.inside = (result.dataX != null && result.dataY != null);
        return result;
    };

    canvasMouseDown(loc) {
        if (loc.inside) {
            this.lastXDown = loc.x;
            this.lastYDown = loc.y;
        }
        if (loc.bound && loc.bound.xcorCallout) {
            this.xcorEvent(loc.dataX);
        }
    };

    canvasMouseUp(loc) {
        this.currentMouseX = loc.x;
        this.currentMouseY = loc.y;
        if (this.lastXDown != null && this.lastYDown != null && this.currentMouseX != null && this.currentMouseY != null &&
            distance(this.lastXDown, this.lastYDown, this.currentMouseX, this.currentMouseY) > this.minDragForZoom && loc.bound != null && loc.bound.callout == false) {
            this.x1 = this.convertCanvasXCoordinateToDataPoint(loc.bound, this.lastXDown);
            this.x2 = this.convertCanvasXCoordinateToDataPoint(loc.bound, this.currentMouseX);
            this.y1 = this.convertCanvasYCoordinateToDataPoint(loc.bound, this.lastYDown);
            this.y2 = this.convertCanvasYCoordinateToDataPoint(loc.bound, this.currentMouseY);
            loc.bound.xMin = Math.min(this.x1, this.x2);
            loc.bound.xMax = Math.max(this.x1, this.x2);
            loc.bound.yMin = Math.min(this.y1, this.y2);
            loc.bound.yMax = Math.max(this.y1, this.y2);
            loc.bound.lockedBounds = true;
        } else {
            if (loc.bound && loc.bound.callout === false &&
                loc.x > (loc.bound.left + loc.bound.width + this.zoomOutXOffset - this.zoomOutWidth) &&
                loc.x < (loc.bound.left + loc.bound.width + this.zoomOutXOffset) &&
                loc.y < (loc.bound.top + this.zoomOutHeight + this.zoomOutYOffset) &&
                loc.y > loc.bound.top + this.zoomOutYOffset) {
                loc.bound.lockedBounds = false;
                this.redraw();
            } else if (loc.bound && loc.bound.callout === false &&
                loc.x > (loc.bound.left + loc.bound.width + this.zoomOutXOffset - this.zoomOutWidth) &&
                loc.x < (loc.bound.left + loc.bound.width + this.zoomOutXOffset) &&
                loc.y < (loc.bound.top + this.zoomOutHeight + this.downloadYOffset) &&
                loc.y > loc.bound.top + this.downloadYOffset) {
                this.downloadImage();
            } else if (this.checkCanvasInRange(loc.bound, loc.x, loc.y)) {
                this.focusDataX = this.convertCanvasXCoordinateToDataPoint(loc.bound, loc.x);
                this.focusDataY = this.convertCanvasYCoordinateToDataPoint(loc.bound, loc.y);
                // todo
                // global.ui.detailed.spectraFocus = focusDataX;
                // global.ui.detailed.waitingForSpectra = true;
                // this.$apply();
            }
        }
        this.lastXDown = null;
        this.lastYDown = null;
        this.redraw()
    };

    xcorEvent(z) {
        this.detailed.redshift = z.toFixed(5);
        // todo
        // this.$apply();
    };

    canvasMouseMove(loc) {
        if (!loc.inside) return;
        this.currentMouseX = loc.x;
        this.currentMouseY = loc.y;
        if (loc.bound != null && loc.bound.xcorCallout !== true) {
            this.handleRedrawRequest();
            if (this.lastXDown != null && this.lastYDown != null) {
                if (distance(loc.x, loc.y, this.lastXDown, this.lastYDown) < this.minDragForZoom || loc.bound == null || loc.bound.callout) {
                    return;
                }
                this.c.strokeStyle = this.dragOutlineColour;
                this.c.fillStyle = this.dragInteriorColour;
                this.w = loc.x - this.lastXDown;
                this.h = loc.y - this.lastYDown;
                this.c.fillRect(this.lastXDown + 0.5, this.lastYDown, this.w, this.h);
                this.c.strokeRect(this.lastXDown + 0.5, this.lastYDown, this.w, this.h);
            }
        } else if (loc.bound != null && loc.bound.xcorCallout === true) {
            if (this.lastXDown != null && this.lastXDown != null) {
                this.xcorEvent(loc.dataX);
            } else {
                this.handleRedrawRequest();
                this.plotZLine2(loc.bound, loc.x);
            }
        }
    };

    mouseOut(loc) {
        this.currentMouseX = null;
        this.currentMouseY = null;
        this.redraw();
    };

    isScrollingUp(e) {
        if (e.originalEvent) {
            e = e.originalEvent;
        }
        //pick correct delta variable depending on event
        delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
        return (e.detail || delta > 0);
    };

    zoomIn(res) {
        if (res.inside && res.bound && !res.bound.callout) {
            const r0 = (res.dataX - res.bound.xMin) / (res.bound.xMax - res.bound.xMin);
            const r1 = (res.dataY - res.bound.yMin) / (res.bound.yMax - res.bound.yMin);
            const w = res.bound.xMax - res.bound.xMin;
            const h = res.bound.yMax - res.bound.yMin;
            res.bound.xMin = res.dataX - r0 * w * this.zoomXRatio;
            res.bound.xMax = res.bound.xMin + (w * this.zoomXRatio);
            res.bound.yMin = res.dataY - r1 * h * this.zoomXRatio;
            res.bound.yMax = res.bound.yMin + (h * this.zoomXRatio);
            res.bound.lockedBounds = true;
        }
        this.redraw();
    };

    zoomOut(res) {
        if (res.inside && res.bound && !res.bound.callout) {
            const r0 = (res.dataX - res.bound.xMin) / (res.bound.xMax - res.bound.xMin);
            const r1 = (res.dataY - res.bound.yMin) / (res.bound.yMax - res.bound.yMin);
            const w = res.bound.xMax - res.bound.xMin;
            const h = res.bound.yMax - res.bound.yMin;
            res.bound.xMin = res.dataX - r0 * w * (1 / this.zoomXRatio);
            res.bound.xMax = res.bound.xMin + (w * (1 / this.zoomXRatio));
            res.bound.yMin = res.dataY - r1 * h * (1 / this.zoomXRatio);
            res.bound.yMax = res.bound.yMin + (h * (1 / this.zoomXRatio));
            res.bound.lockedBounds = true;
            let rawData = null;
            if (this.data.length > 0) {
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i].id === 'data') {
                        rawData = this.data[i];
                    }
                }
            }
            res.bound.lockedBounds = true;
            if (rawData != null && rawData.x && rawData.x.length > 0) {
                if (res.bound.xMin < rawData.x[0] || res.bound.xMax > rawData.x[rawData.x.length - 1]) {
                    res.bound.lockedBounds = false;
                }
            }
        }
        this.redraw();
    };

    handleEvent(e) {
        const res = this.windowToCanvas(e);
        //e.preventDefault();
        //e.stopPropagation();
        if (e.type === 'mousedown' || e.type === "touchstart") {
            this.canvasMouseDown(res);
        } else if (e.type === 'mouseup' || e.type === 'touchend') {
            this.canvasMouseUp(res);
        } else if (e.type === 'mousemove' || e.type === 'touchmove') {
            this.canvasMouseMove(res);
        } else if (e.type === 'mouseout') {
            this.mouseOut(res);
        } else if (e.type === 'mousewheel') {
            if (this.isScrollingUp(e)) {
                this.zoomIn(res);
            } else {
                this.zoomOut(res);
            }
        }
    };

    refreshSettings() {
        this.canvasHeight = this.parent.clientHeight;
        this.canvasWidth = this.parent.clientWidth;
        this.canvas.width = this.canvasWidth * this.scale;
        this.canvas.height = this.canvasHeight * this.scale;
        this.canvas.style.width = this.canvasWidth + "px";
        this.canvas.style.height = this.canvasHeight + "px";
        this.c.scale(this.scale, this.scale);
        this.callout = this.canvasHeight > 450;
        this.xcor = this.xcorData && (this.canvasHeight > 300);
        this.xcorBound.width = this.canvasWidth - this.xcorBound.left - this.xcorBound.right;
        this.xcorBound.height = this.xcorHeight - this.xcorBound.top - this.xcorBound.bottom;
        this.bounds[0].top = this.xcor ? this.baseTop + this.xcorHeight : this.baseTop;
        this.bounds[0].bottom = this.callout ? Math.floor(this.canvasHeight * 0.3) + this.baseBottom : this.baseBottom;
        this.bounds[0].width = this.canvasWidth - this.bounds[0].left - this.bounds[0].right;
        this.bounds[0].height = this.canvasHeight - this.bounds[0].top - this.bounds[0].bottom;
    };

    getBounds(bound) {
        if (bound.lockedBounds) return;
        let c = 0;
        if (!bound.callout) {
            bound.xMin = 9e9;
            bound.xMax = -9e9;
        }
        bound.yMin = 9e9;
        bound.yMax = -9e9;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data.id === "data" && i < this.startRawTruncate) continue;
            if (this.data[i].bound) {
                c++;
            }
            if (!bound.callout) {
                if (this.data[i].bound && this.data[i].xMin != null && this.data[i].xMax != null) {
                    bound.xMin = this.data[i].xMin;
                    bound.xMax = this.data[i].xMax;
                }
            }
        }
        let currentRangeIndex = this.detailed.rangeIndex;

        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].bound) {
                bound.yMin = this.data[i].yMins[currentRangeIndex];
                bound.yMax = this.data[i].yMaxs[currentRangeIndex];
            }
        }
        if (c === 0) {
            if (!bound.callout) {
                bound.xMin = 3300;
                bound.xMax = 7200;
            }
            bound.yMin = -500;
            bound.yMax = 1000;
        } else {
            bound.yMin = bound.yMax - (bound.callout ? this.calloutSpacingFactor : this.spacingFactor) * (bound.yMax - bound.yMin);
        }
    };

    clearPlot(download) {
        download = defaultFor(download, false);
        /*c.save();
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.restore();*/
        this.c.rect(0, 0, this.canvas.width, this.canvas.height);
        if (download) {
            this.c.fillStyle = "#ffffff";
        } else {
            this.c.fillStyle = "rgb(249, 249, 249)";
        }
        this.c.fill();
    };

    plotZeroLine(bound, colour) {
        if (typeof colour === "undefined") colour = this.zeroLineColour;
        const y = this.convertDataYToCanvasCoordinate(bound, 0);
        if (y > (bound.top + bound.height) || y < bound.top) {
            return;
        }
        this.c.strokeStyle = this.zeroLineColour;
        this.c.beginPath();
        this.c.moveTo(bound.left, Math.floor(y) + 0.5);
        this.c.lineTo(bound.left + bound.width, Math.floor(y) + 0.5);
        this.c.stroke();
    };

    plotAxes(bound, colour) {
        if (typeof colour === "undefined") colour = this.axesColour;
        this.c.strokeStyle = colour;
        this.c.beginPath();
        this.c.moveTo(bound.left - 0.5, bound.top + 0.5);
        this.c.lineTo(bound.left - 0.5, bound.top + bound.height + 0.5);
        this.c.lineTo(bound.left + bound.width - 0.5, bound.top + bound.height + 0.5);
        if (bound.callout) {
            this.c.lineTo(bound.left - 0.5 + bound.width, bound.top + 0.5);
            this.c.lineTo(bound.left - 0.5, bound.top + 0.5);
        } else {
            this.c.moveTo(bound.left + bound.width - 0.5, bound.top + 0.5);
            this.c.lineTo(bound.left + bound.width - 0.5, bound.top + bound.height + 0.5);
        }
        this.c.stroke();
    };

    plotAxesLabels(onlyLabels, bound) {
        this.c.font = this.labelFont;
        this.c.strokeStyle = this.stepColour;
        this.c.fillStyle = this.labelFill;
        this.c.textAlign = 'center';
        this.c.textBaseline = "top";

        const startX = this.convertCanvasXCoordinateToDataPoint(bound, bound.left);
        const endX = this.convertCanvasXCoordinateToDataPoint(bound, bound.left + bound.width);
        const xRange = endX - startX;
        let numLabels = bound.width / this.labelWidth;
        let xStep = xRange / numLabels;
        let base = 10;
        let exponent = Math.floor(Math.log(xStep) / Math.log(base));
        if (exponent === 0 && Math.floor(Math.log(xStep) / Math.log(5)) > 0) {
            base = 5;
            exponent = Math.floor(Math.log(xStep) / Math.log(5));
        }
        xStep = Math.max(1, Math.floor(xStep / Math.pow(base, exponent))) * Math.pow(base, exponent);
        const firstX = startX - startX % xStep;
        const y = bound.top + bound.height + 5;
        this.c.beginPath()
        for (let i = firstX + xStep; i < endX; i += xStep) {
            const x = this.convertDataXToCanvasCoordinate(bound, i) + 0.5;
            if (onlyLabels) {
                this.c.fillText(parseFloat((i).toPrecision(4)).toString(), x, y);
            } else {
                this.c.moveTo(x, bound.top);
                this.c.lineTo(x, bound.top + bound.height);
            }
        }
        this.c.textAlign = 'right';
        this.c.textBaseline = "middle";

        const endY = this.convertCanvasYCoordinateToDataPoint(bound, bound.top);
        const startY = this.convertCanvasYCoordinateToDataPoint(bound, bound.top + bound.height);
        const yRange = endY - startY;
        numLabels = bound.height / this.labelHeight;
        let yStep = yRange / numLabels;
        base = 10;
        exponent = Math.floor(Math.log(yStep) / Math.log(base));
        if (exponent === 0 && Math.floor(Math.log(yStep) / Math.log(5)) > 0) {
            base = 5;
            exponent = Math.floor(Math.log(yStep) / Math.log(5));
        }
        yStep = Math.max(1, Math.floor(yStep / Math.pow(base, exponent))) * Math.pow(base, exponent);
        const firstY = startY - startY % yStep;

        const x = bound.left - 10;
        for (let i = firstY + yStep; i < endY; i += yStep) {
            const y = this.convertDataYToCanvasCoordinate(bound, i);
            if (onlyLabels) {
                const lbl = parseFloat((i).toPrecision(4));
                if (Math.abs(lbl - 0) < 1e-10) {
                    this.c.fillText('0', x, y);
                } else {
                    this.c.fillText(lbl, x, y);
                }
            } else {
                this.c.moveTo(bound.left, y);
                this.c.lineTo(bound.left + bound.width, y);
            }
        }
        if (!onlyLabels) {
            this.c.stroke();
        }
    };

    plotAxesFormalLabels(bound) {
        if (!bound.callout) {
            const xlabel = "Wavelength (\u00C5)";
            const ylabel = "Relative Intensity";

            const bottomX = bound.left + 0.5 * bound.width;
            const bottomY = bound.top + bound.height + 20;
            const leftX = 0;
            const leftY = bound.top + 0.5 * bound.height;
            this.c.font = this.labelFont;
            this.c.strokeStyle = this.stepColour;
            this.c.fillStyle = this.labelFill;
            this.c.textAlign = 'center';
            this.c.textBaseline = "top";

            this.c.fillText(xlabel, bottomX, bottomY);

            this.c.save();
            this.c.translate(leftX, leftY);
            this.c.rotate(-Math.PI / 2);
            this.c.fillText(ylabel, 0, 0);
            this.c.restore();
        }
    };

    annotatePlot(name, bound) {
        plotText(name, bound.left, 0, annotationColour);
    };

    plotText(text, x, y, colour) {
        c.textAlign = 'left';
        c.textBaseline = 'top';
        c.font = labelFont;
        c.strokeStyle = colour;
        c.fillStyle = colour;
        c.fillText(text, x, y);

    };

    plotZLine2(bound, x) {
        this.c.lineWidth = 1;
        this.c.strokeStyle = this.xcorLineHighlight;
        this.c.beginPath();
        this.c.moveTo(x, bound.top);
        this.c.lineTo(x, bound.top + bound.height);
        this.c.stroke();
    };

    plotZLine(bound) {
        c.save();
        this.z = parseFloat(this.detailed.redshift)
        if (z < bound.xMin || z > bound.xMax) {
            return;
        }
        this.x = bound.left + bound.width * (z - bound.xMin) / (bound.xMax - bound.xMin);
        this.btm = binarySearch(xcorData.zs, z);
        this.xc = 0;
        if (btm[0] == btm[1]) {
            xc = xcorData.xcor[btm[0]];
        } else {
            this.part = findCorrespondingFloatIndex(xcorData.zs, z, btm[0]) - btm[0];
            xc = xcorData.xcor[btm[0]] * (1 - part) + part * xcorData.xcor[btm[1]]
        }
        xc = xc / xcorData.weight;
        c.beginPath();
        c.setLineDash([2, 2]);
        c.strokeStyle = xcorLineColour;
        c.moveTo(x, bound.top);
        c.lineTo(x, bound.top + bound.height);
        c.stroke();
        c.setLineDash([]);
        c.textAlign = 'left';
        c.textBaseline = 'top';
        c.font = labelFont;
        c.strokeStyle = xcorLineColour;
        c.fillStyle = xcorLineColour;
        x = Math.max(x, bound.left + 40);
        x = Math.min(x, bound.left + bound.width - 120);
        c.fillText(xc.toFixed(3) + " @ z=" + this.detailed.redshift, x, 0);
        c.restore();

    };

    plotXcorData() {
        if (this.xcor) {
//                        plotAxes(xcorBound, "#aaa");
            this.annotatePlot("XCor", this.xcorBound);
            if (this.xcorData != null && this.xcorData.zs != null && this.xcorData.xcor != null) {
                this.xcorBound.xMin = this.xcorData.zs[0];
                this.xcorBound.xMax = this.xcorData.zs[this.xcorData.zs.length - 1];
                this.xcorBound.yMin = getMin(this.xcorData.xcor);
                this.xcorBound.yMax = getMax(this.xcorData.xcor);
                this.plotZeroLine(this.xcorBound, "#999");
                this.renderLinearPlot(this.xcorBound, this.xcorData.zs, this.xcorData.xcor, this.xcorPlotColour);
                this.plotZLine(this.xcorBound);
            }
        }
    };

    renderLinearPlot(bound, xs, ys, colour) {
        c.beginPath();
        c.strokeStyle = colour;
        for (this.i = 0; i < xs.length; i++) {
            this.x = bound.left + (xs[i] - bound.xMin) / (bound.xMax - bound.xMin) * (bound.width);
            this.y = bound.top + bound.height - ((ys[i] - bound.yMin) * (bound.height) / (bound.yMax - bound.yMin));
            if (i == 0) {
                c.moveTo(x, y);
            } else {
                c.lineTo(x, y);
            }
        }
        c.stroke();
    };

    renderPlots(bound) {
        this.c.lineWidth = 0.6;
        for (let j = 0; j < this.data.length; j++) {
            this.c.beginPath();
            this.c.strokeStyle = this.data[j].colour;
            const xs = this.data[j].x;
            const ys = this.data[j].y2 == null ? this.data[j].y : this.data[j].y2;
            let disconnect = true;
            let oob = false;
            let x = 0;
            let y = 0;
            let yOffset = 0;
            let r = 1;
            let o = 0;
            if (this.data[j].id === 'template') {
                this.c.globalAlpha = 0.5;
                const lower = binarySearch(xs, bound.xMin)[0];
                const upper = binarySearch(xs, bound.xMax)[1];
                const min = getMin(ys, lower, upper);
                const max = getMax(ys, lower, upper);
                r = ((bound.yMax - bound.yMin) / (max - min)) / (bound.callout ? this.calloutSpacingFactor : this.spacingFactor) / this.templateFactor;
                o = bound.yMin - r * min;
                yOffset = this.detailed.templateOffset * bound.height / (this.templateFactor * (bound.callout ? 200 : 150));
            } else if (this.data[j].id === 'sky') {
                if (bound.callout) {
                    continue;
                }
                yOffset = bound.height + bound.top;
            } else if (this.data[j].id === 'variance') {
                if (bound.callout) {
                    continue;
                }
                yOffset = bound.top + 5;
                this.c.moveTo(bound.left, bound.top + 5);
                this.c.lineTo(bound.left + bound.width, bound.top + 5);
                this.c.moveTo(bound.left, bound.top + 5)
            } else if (this.data[j].id === "data") {
                if (bound.callout) {
                    yOffset = -5;
                } else {
                    yOffset = 0;
                }
            }
            let start = 0;
            if (this.data[j].id === "data") {
                start = this.startRawTruncate;
            }
            let mx2 = bound.left;
            let mx1 = bound.left;
            let cx = null;
            let yp = 0;
            for (let i = start; i < xs.length - 1; i++) {
                if (xs[i] >= bound.xMin && xs[i] <= bound.xMax) {
                    x = cx;
                    cx = this.convertDataXToCanvasCoordinate(bound, xs[i + 1]);
                    mx1 = mx2;
                    if (x == null) {
                        x = this.convertDataXToCanvasCoordinate(bound, xs[i]);
                        if (i === 0) {
                            mx1 = x;
                        } else {
                            mx1 = bound.left;
                        }
                    }
                    mx2 = (x + cx) / 2;
                    if (this.data[j].id === "sky") {
                        y = yOffset - ys[i];
                    } else if (this.data[j].id === "variance") {
                        y = yOffset + ys[i];
                    } else if (this.data[j].id === 'template') {
                        y = this.convertDataYToCanvasCoordinate(bound, ys[i] * r + o) - yOffset;
                    } else {
                        y = this.convertDataYToCanvasCoordinate(bound, ys[i]) - yOffset;
                    }
                    if (y < bound.top) {
                        oob = true;
                        y = bound.top;
                    } else if (y > (bound.top + bound.height)) {
                        oob = true;
                        y = (bound.top + bound.height);
                    } else {
                        oob = false;
                    }
                    if (disconnect === true) {
                        disconnect = false;
                        if (i > 0) {
                            if (this.data[j].id === "sky") {
                                yp = yOffset - ys[i - 1];
                            } else if (this.data[j].id === "variance") {
                                yp = yOffset + ys[i - 1];
                            } else if (this.data[j].id === 'template') {
                                yp = this.convertDataYToCanvasCoordinate(bound, ys[i - 1] * r + o) - yOffset;
                            } else {
                                yp = this.convertDataYToCanvasCoordinate(bound, ys[i - 1]) - yOffset;
                            }
                            this.c.moveTo(bound.left, yp);
                            this.c.lineTo(mx1, yp);
                        }
                        this.c.lineTo(mx1, y);
                    } else {
                        this.c.lineTo(mx1, y);
                        if (oob) {
                            this.c.moveTo(mx2, y);
                        } else {
                            this.c.lineTo(mx2, y);
                        }
                    }
                }
            }
            this.c.stroke();
            if (this.data[j].id === "template") {
                this.c.globalAlpha = 1;
            }
        }
        this.c.lineWidth = 1;
    };

    drawZoomOut(bound) {
        if (!bound.callout) {
            const x = bound.left + bound.width + this.zoomOutXOffset - this.zoomOutWidth;
            const y = bound.top + this.zoomOutYOffset;
            this.c.drawImage(this.zoomOutImg, x, y);
        }
    };

    drawDownload(bound) {
        if (!bound.callout) {
            const x = bound.left + bound.width + this.zoomOutXOffset - this.zoomOutWidth;
            const y = bound.top + this.downloadYOffset;
            this.c.drawImage(this.downloadImg, x, y);
        }

    };

    plotSpectralLines(bound) {
        if (!this.detailed.spectralLines) return;
        const lines = spectraLineService.getAll();
        this.c.save();
        this.c.textAlign = 'center';
        this.c.textBaseline = 'bottom';
        this.c.font = this.labelFont;

        const staggerHeight = 13;
        let up = true;
        let px = -100;
        let helio = null;
        let cmb = null;
        if (this.ui.active != null) {
            helio = this.ui.active.helio;
            cmb = this.ui.active.cmb;
        }
        const z = adjustRedshift(parseFloat(this.detailed.redshift), -helio, -cmb);

        for (let i = 0; i < lines.length; i++) {
            const spectralLineColour = this.spectralLineColours[lines[i].type];
            this.c.fillStyle = spectralLineColour;
            for (let j = 0; j < lines[i].displayLines.length; j++) {
                this.lambda = shiftWavelength(lines[i].displayLines[j], z);
                if (this.checkDataXInRange(bound, this.lambda)) {
                    const x = 0.5 + Math.floor(this.convertDataXToCanvasCoordinate(bound, this.lambda));
                    let h = staggerHeight;
                    if (Math.abs(x - px) < 40) {
                        h = up ? 0 : staggerHeight;
                        up = !up;
                    } else {
                        up = true;
                    }
                    px = x;
                    let strength = null;
                    if (this.baseData != null) {
                        strength = getStrengthOfLine(this.baseData.x, this.baseData.y2, lines[i], z, templatesService.isQuasar(global.ui.detailed.templateId));
                    }
                    this.c.beginPath();
                    this.c.setLineDash([5, 3]);
                    if (strength == null) {
                        this.c.strokeStyle = spectralLineColour.replace(/[^,]+(?=\))/, "" + 0.5);
                    } else {
                        this.c.strokeStyle = spectralLineColour.replace(/[^,]+(?=\))/, "" + strength);
                    }
                    this.c.moveTo(x, bound.top);
                    this.c.lineTo(x, bound.top + bound.height);
                    this.c.stroke();
                    this.c.strokeStyle = spectralLineColour;
                    this.c.setLineDash([]);
                    this.c.clearRect(x - 17, bound.top - 12 + h - staggerHeight, 35, staggerHeight - 1);
                    /*c.beginPath();
                    c.moveTo(x, bound.top - 5 + h);
                    c.lineTo(x - 20, bound.top - 10 + h);
                    c.lineTo(x - 20, bound.top - 23 + h);
                    c.lineTo(x + 20, bound.top - 23 + h);
                    c.lineTo(x + 20, bound.top - 10 + h);
                    c.closePath();
                    c.fillStyle = spectralLineColour;
                    c.fill();
                    c.fillStyle = spectralLineTextColour;
                    */
                    this.c.fillStyle = spectralLineColour;
                    this.c.fillText(lines[i].label, x, bound.top - 12 + h);
                }
            }
        }
        this.c.restore();
    };

    drawFocus(bound) {
        if (this.focusDataX == null || this.focusDataX == null) return;
        if (this.checkDataXYInRange(bound, this.focusDataX, this.focusDataY)) {
            const x = this.convertDataXToCanvasCoordinate(bound, this.focusDataX);
            const y = this.convertDataYToCanvasCoordinate(bound, this.focusDataY);
            this.c.strokeStyle = this.focusCosmeticColour;
            this.c.lineWidth = 2;
            this.c.beginPath();
            this.c.arc(x, y, 2, 0, 2 * Math.PI, false);
            this.c.stroke();
            this.c.beginPath();
            this.c.arc(x, y, this.focusCosmeticMaxRadius, 0, 2 * Math.PI, false);
            this.c.stroke();
            this.c.lineWidth = 1;
        }
    };

    drawCursor(bound) {
        if (this.currentMouseX == null || this.currentMouseY == null) return;
        if (!this.checkCanvasInRange(bound, this.currentMouseX, this.currentMouseY)) return;
        const w = bound.callout ? 60 : 70;
        const h = 16;
        this.c.strokeStyle = this.cursorColour;
        this.c.beginPath();
        this.c.moveTo(bound.left, this.currentMouseY + 0.5);
        this.c.lineTo(this.currentMouseX - this.cursorXGap, this.currentMouseY + 0.5);
        this.c.moveTo(this.currentMouseX + this.cursorXGap, this.currentMouseY + 0.5);
        this.c.lineTo(bound.left + bound.width, this.currentMouseY + 0.5);
        this.c.moveTo(this.currentMouseX + 0.5, bound.top);
        this.c.lineTo(this.currentMouseX + 0.5, this.currentMouseY - this.cursorYGap);
        this.c.moveTo(this.currentMouseX + 0.5, this.currentMouseY + this.cursorYGap);
        this.c.lineTo(this.currentMouseX + 0.5, bound.top + bound.height);
        this.c.stroke();
        this.c.beginPath();
        this.c.moveTo(bound.left, this.currentMouseY + 0.5);
        this.c.lineTo(bound.left - 5, this.currentMouseY + h / 2);
        this.c.lineTo(bound.left - w, this.currentMouseY + h / 2);
        this.c.lineTo(bound.left - w, this.currentMouseY - h / 2);
        this.c.lineTo(bound.left - 5, this.currentMouseY - h / 2);
        this.c.closePath();
        this.c.fillStyle = this.cursorColour;
        this.c.fill();
        this.c.fillStyle = this.cursorTextColour;
        this.c.textAlign = 'right';
        this.c.textBaseline = 'middle';
        this.c.fillText(this.convertCanvasYCoordinateToDataPoint(bound, this.currentMouseY + 0.5).toFixed(1), bound.left - 10, this.currentMouseY)
        this.c.beginPath();
        const y = bound.top + bound.height;
        this.c.moveTo(this.currentMouseX, y);
        this.c.lineTo(this.currentMouseX + w / 2, y + 5);
        this.c.lineTo(this.currentMouseX + w / 2, y + 5 + h);
        this.c.lineTo(this.currentMouseX - w / 2, y + 5 + h);
        this.c.lineTo(this.currentMouseX - w / 2, y + 5);
        this.c.closePath();
        this.c.fillStyle = this.cursorColour;
        this.c.fill();
        this.c.fillStyle = this.cursorTextColour;
        this.c.textAlign = 'center';
        this.c.textBaseline = 'top';
        this.c.fillText(this.convertCanvasXCoordinateToDataPoint(bound, this.currentMouseX + 0.5).toFixed(1), this.currentMouseX + 0.5, y + 5)

    };

    plotWindow(bound, download) {
        this.getBounds(bound);
        this.plotAxesLabels(false, bound);
        this.plotZeroLine(bound);
        this.plotSpectralLines(bound);
        this.renderPlots(bound);
        this.plotAxes(bound);
        this.plotAxesLabels(true, bound);
        this.plotAxesFormalLabels(bound);
        if (!download) {
            this.drawFocus(bound);
            this.drawZoomOut(bound);
            this.drawDownload(bound);
            this.drawCursor(bound);
        }
    };

    selectCalloutWindows() {
        const baseData = this.data.select(x => {
            return x.id === 'data';
        });
        const redshift = parseFloat(this.detailed.redshift);
        let start = this.defaultMin;
        let end = this.defaultMax;

        const desiredNumberOfCallouts = Math.min(Math.floor(this.canvasWidth * 1.0 / this.minCalloutWidth), this.maxCallouts);

        if (baseData != null && baseData.length > 0 && !isNaN(redshift)) {
            start = baseData[0].x[0];
            end = baseData[0].x[baseData[0].x.length - 1];
        }

        const availableCallouts = this.callouts.select(c => {
            const zmean = ((1 + redshift) * c[0] + (1 + redshift) * c[1]) / 2.;
            return zmean >= start && zmean <= end;
        }).toArray();

        const numCallouts = Math.min(desiredNumberOfCallouts, availableCallouts.length);
        this.bounds = [this.mainBound];

        while (availableCallouts.length > numCallouts) {
            let min = 100;
            let index = -1;
            for (let i = 0; i < availableCallouts.length; i++) {
                if (availableCallouts[i][2] < min) {
                    min = availableCallouts[i][2];
                    index = i;
                }
            }
            availableCallouts.splice(index, 1);
        }

        for (let i = 0; i < numCallouts; i++) {
            this.bounds.push({
                xMin: availableCallouts[i][0] * (1 + redshift),
                xMax: availableCallouts[i][1] * (1 + redshift),
                yMin: 0,
                yMax: 0,
                callout: true,
                lockedBounds: false
            });
        }

        if (this.callout) {
            const w = (this.canvasWidth / numCallouts);
            const h = Math.floor(this.canvasHeight * 0.3);
            let numCallout = 0;
            for (let i = 0; i < this.bounds.length; i++) {
                if (this.bounds[i].callout) {
                    this.bounds[i].left = 60 + w * numCallout;
                    this.bounds[i].top = 20 + this.canvasHeight - h;
                    this.bounds[i].bottom = 20;
                    this.bounds[i].right = 10 + (w * (numCallout + 1));
                    this.bounds[i].height = h - 40;
                    this.bounds[i].width = w - 60;
                    numCallout++;
                }
            }
        }
    };

    handleRedrawRequest() {
        this.refreshSettings();
        this.selectCalloutWindows();
        this.clearPlot();
        this.plotXcorData();
        for (let i = 0; i < this.bounds.length; i++) {
            this.plotWindow(this.bounds[i], false);
        }
        this.requested = false;
    };

    downloadImage() {
        this.setScale(2.0);
        this.refreshSettings();
        this.selectCalloutWindows();
        this.clearPlot(true);
        this.plotXcorData();
        for (let i = 0; i < this.bounds.length; i++) {
            this.plotWindow(this.bounds[i], true);
        }
        const d = this.canvas.toDataURL("image/png");
        const w = window.open('about:blank', 'image from canvas');
        w.document.write("<img src='" + d + "' alt='from canvas'/>");
        this.setScale();
        this.handleRedrawRequest();
    };

    redraw() {
        if (!this.requested) {
            this.requested = true;
            window.setTimeout(() => this.handleRedrawRequest(), 1000 / 60);
        }

    };

    smoothData(id) {
        this.smooth = parseInt(this.detailed.smooth);
        for (this.i = 0; i < data.length; i++) {
            if (data[i].id == id) {
                data[i].y2 = fastSmooth(data[i].y, smooth);
                this.ys2 = data[i].y2.slice(startRawTruncate);
                ys2 = ys2.sort(function (a, b) {
                    if (!isFinite(a - b)) {
                        return !isFinite(a) ? -1 : 1;
                    } else {
                        return a - b;
                    }
                });
                this.numPoints = ys2.length;
                for (this.k = 0; k < numPoints; k++) {
                    if (isFinite(ys2[k])) {
                        break;
                    }
                }
                this.yMins = [], yMaxs = [];
                for (this.j = 0; j < this.detailed.ranges.length; j++) {
                    this.range = this.detailed.ranges[j];
                    yMins.push(ys2[Math.floor(0.01 * (100 - range) * (numPoints - k)) + k]);
                    yMaxs.push(ys2[Math.ceil(0.01 * (range) * (numPoints - 1 - k)) + k]);
                }
                data[i].yMins = yMins;
                data[i].yMaxs = yMaxs;
            }
        }
    };

    getActiveHash() {
        if (this.ui.active == null) return "";
        return this.ui.active.getHash();
    };

    addXcorData() {
        if (global.ui.active == null || global.ui.active.templateResults == null) {
            xcorData = null;
        } else {
            xcorData = global.ui.active.templateResults[this.detailed.templateId];
        }
    };

    addBaseData() {
        this.i = 0;
        for (i = 0; i < data.length; i++) {
            if (data[i].id == 'data') {
                data.splice(i, 1);
                break;
            }
        }
        for (i = 0; i < data.length; i++) {
            if (data[i].id == 'variance') {
                data.splice(i, 1);
                break;
            }
        }
        if (global.ui.active != null) {
            this.ys = null;
            this.xs = null;
            this.colour = "#000";
            if (global.ui.dataSelection.processed && global.ui.active.processedLambdaPlot != null) {
                xs = global.ui.active.processedLambdaPlot;
                ys = global.ui.detailed.continuum ? global.ui.active.processedContinuum : global.ui.active.processedIntensity2;
                colour = global.ui.colours.processed;
            } else {
                ys = global.ui.detailed.continuum ? global.ui.active.intensityPlot : global.ui.active.getIntensitySubtracted();
                xs = global.ui.active.lambda;
                colour = global.ui.colours.raw;
            }
            this.xs2 = xs.slice();
            xs2.sort(function (a, b) {
                return a - b;
            });
            this.xMin = xs2[startRawTruncate];
            this.xMax = xs2[xs2.length - 1];
            baseData = {
                id: 'data', bound: true, colour: colour, x: xs, y: ys, xMin: xMin,
                xMax: xMax
            };
            data.push(baseData);
            if (global.ui.dataSelection.variance) {
                if (global.ui.dataSelection.processed && global.ui.active.processedVariancePlot != null) {
                    ys = global.ui.active.processedVariancePlot;
                } else {
                    ys = global.ui.active.variancePlot;
                }
                data.push({id: 'variance', bound: false, colour: global.ui.colours.variance, x: xs, y: ys});
            }
            smoothData('data');
        }
        data.sort(function (a, b) {
            return a.id < b.id;
        });
    };

    addSkyData() {
        for (this.i = 0; i < data.length; i++) {
            if (data[i].id == 'sky') {
                data.splice(i, 1);
                break;
            }
        }
        if (global.ui.active != null && global.ui.active.sky != null) {
            data.push({
                id: 'sky',
                colour: global.ui.colours.sky,
                bound: false,
                x: global.ui.active.lambda,
                y: global.ui.active.sky
            })
        }
    };

    addTemplateData() {
        for (this.i = 0; i < data.length; i++) {
            if (data[i].id == 'template') {
                data.splice(i, 1);
                break;
            }
        }
        if (this.detailed.templateId != "0" && this.ui.dataSelection.matched) {
            this.h = null;
            this.c = null;
            if (this.ui.active != null) {
                h = this.ui.active.helio;
                c = this.ui.active.cmb;
            }
            this.r = templatesService.getTemplateAtRedshift(this.detailed.templateId,
                adjustRedshift(parseFloat(this.detailed.redshift), -h, -c), this.detailed.continuum);
            data.push({id: "template", colour: global.ui.colours.matched, x: r[0], y: r[1]});
        }
        data.sort(function (a, b) {
            return a.id < b.id;
        });
    };
}

export default CanvasRenderer;