import React from "react";

import {
    binarySearch,
    defaultFor,
    distance, fastSmooth,
    findCorrespondingFloatIndex,
    getMax,
    getMin,
    shiftWavelength
} from '../../../Utils/methods';
import Enumerable from "linq";
import {adjustRedshift} from "../../../Utils/dsp";
import {getStrengthOfLine} from "./spectralAnalysis";

import download_image from '../../../Assets/images/download.png';
import lens_image from '../../../Assets/images/lens.png';
import {spectraLineService} from "./spectralLines";
import {
    clearShouldUpdateBaseData,
    clearShouldUpdateSkyData, clearShouldUpdateSmoothData,
    clearShouldUpdateTemplateData, clearShouldUpdateXcorData
} from "../../../Stores/Detailed/Actions";
import {templateManager} from "../../../Lib/TemplateManager";
import {setSpectraFocus, setWaitingForSpectra} from "../../../Stores/UI/Actions";

class DetailedCanvas extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // Save the canvas element and get it's 2d rendering context for use later
        this.c = this.refs.canvas.getContext("2d");

        // Set the images
        this.zoomOutImg = new Image();
        this.zoomOutImg.src = lens_image;
        this.downloadImg = new Image();
        this.downloadImg.src = download_image;
        this.templateManager = templateManager;

        // Force a redraw to initialise settings and parameters
        this.update();

        // Update the scale
        this.setScale();

        let rect = this.refs.canvas.getBoundingClientRect();
        let ysize=rect.bottom - rect.top;
        console.log("rect="+rect.top+" "+rect.bottom+" "+rect.top+" ="+ysize);

        // Force another redraw to fix the canvas
        this.update();
    }

    shouldComponentUpdate(nextProps, nextState) {
        // todo: Need to add checks here if the canvas should be rerendered during a react update
        // console.log(nextProps)
        // if (nextProps.detailed.shouldUpdateBaseData)
        //     return true;
        //
        // if (nextProps.detailed.shouldUpdateSkyData)
        //     return true;

        return true;
    }

    //  Conditional content
    showData() {
        return true;
    }
    showTemplate() {
        const dataonly = (window.marz_configuration.layout == 'ReadOnlySpectrumView' || window.marz_configuration.layout == 'SimpleSpectrumView');
        return !dataonly;
    }
    showXcor() {
        const dataonly = (window.marz_configuration.layout == 'ReadOnlySpectrumView' || window.marz_configuration.layout == 'SimpleSpectrumView');
        return !dataonly;
    }
    showCallout() {
        return (window.marz_configuration.layout == 'MarzSpectrumView');
    }
    showSpectraLines() {
        return (window.marz_configuration.layout == 'MarzSpectrumView' || window.marz_configuration.layout == 'TemplateOverlaySpectrumView');
    }
    showZoomControl() {
        return window.marz_configuration.layout != 'ReadOnlySpectrumView';
    }
    showDownloadControl() {
        return (window.marz_configuration.layout == 'MarzSpectrumView');
    }

    render() {
        // Check if the 2d context has been initialised yet
        if (this.c)
            // Yes it has, so render the canvas
            this.update();

        return (window.marz_configuration.layout == 'MarzSpectrumView') ?
        (

            <div ref='parent' id="detailedCanvasParent" className="canvas-container">
                <canvas
                    ref='canvas'
                    id="detailedCanvas"
                    onMouseDown={e => this.handleEvent(e)}
                    onMouseUp={e => this.handleEvent(e)}
                    onMouseMove={e => this.handleEvent(e)}
                    onTouchStart={e => this.handleEvent(e)}
                    onTouchEnd={e => this.handleEvent(e)}
                    onTouchMove={e => this.handleEvent(e)}
                    onWheel={e => this.handleEvent(e)}
                />
            </div>
        ) : (
            window.marz_configuration.layout == 'ReadOnlySpectrumView' ?
            (
                <div ref='parent' id="detailedCanvasParent" className="canvas-container-no-margin">
                    <canvas
                        ref='canvas'
                        id="detailedCanvas"
                    />
                </div>
            ) :
            (window.marz_configuration.layout == 'TemplateOverlaySpectrumView') ?
            (
                <div ref='parent' id="detailedCanvasParent" className="canvas-container-3line-margin">
                    <canvas
                        ref='canvas'
                        id="detailedCanvas"
                        onMouseDown={e => this.handleEvent(e)}
                        onMouseUp={e => this.handleEvent(e)}
                        onMouseMove={e => this.handleEvent(e)}
                        onTouchStart={e => this.handleEvent(e)}
                        onTouchEnd={e => this.handleEvent(e)}
                        onTouchMove={e => this.handleEvent(e)}
                        onWheel={e => this.handleEvent(e)}
                    />
                </div>
            ) :
            (
                <div ref='parent' id="detailedCanvasParent" className="canvas-container-1line-margin">
                    <canvas
                        ref='canvas'
                        id="detailedCanvas"
                        onMouseDown={e => this.handleEvent(e)}
                        onMouseUp={e => this.handleEvent(e)}
                        onMouseMove={e => this.handleEvent(e)}
                        onTouchStart={e => this.handleEvent(e)}
                        onTouchEnd={e => this.handleEvent(e)}
                        onTouchMove={e => this.handleEvent(e)}
                        onWheel={e => this.handleEvent(e)}
                    />
                </div>
            )
        )
    }

    setScale(extra) {
        extra = defaultFor(extra, 1.0);
        this.params.scale = this.params.ratio * extra;
    };

    update() {
        // Get the general parameter information
        this.params = this.props.detailed;

        // Get the ui info for this spectra
        this.ui = this.props.ui;

        // Get the detailed ui info for this spectra
        this.detailed = this.ui.detailed;

        // Get the view information for this spectra
        this.view = this.params.view;

        // if (this.ui.active)
        //     console.log(this.ui.active.getHash())

        // Check if we need to update the base data
        if (this.params.shouldUpdateBaseData) {
            // Reset the flag to update the base data
            setTimeout(() => clearShouldUpdateBaseData(), 0);
            // Add the base data
            this.addBaseData();
        }

        // Check if we need to update the sky data
        if (this.params.shouldUpdateSkyData) {
            // Reset the flag to update the base data
            setTimeout(() => clearShouldUpdateSkyData(), 0);
            // Add the base data
            this.addSkyData();
        }

        // Check if we need to update the base data
        if (this.params.shouldUpdateTemplateData) {
            // Reset the flag to update the base data
            setTimeout(() => clearShouldUpdateTemplateData(), 0);
            // Add the base data
            this.addTemplateData();
        }

        // Check if we need to update the xcor data
        if (this.params.shouldUpdateXcorData) {
            // Reset the flag to update the base data
            setTimeout(() => clearShouldUpdateXcorData(), 0);
            // Add the base data
            this.addxcorData();
        }

        // Check if we need to update the xcor data
        if (this.params.shouldUpdateSmoothData) {
            // Reset the flag to update the smooth data
            setTimeout(() => clearShouldUpdateSmoothData(), 0);
            // Smooth the data and redraw
            this.smoothData('data');
        }

        // Force a canvas redraw
        this.handleRedrawRequest();
    }

    static convertCanvasXCoordinateToDataPoint(bound, x) {
        return bound.xMin + ((x - bound.left) / (bound.width)) * (bound.xMax - bound.xMin);
    };

    static convertCanvasYCoordinateToDataPoint(bound, y) {
        return bound.yMin + (1 - ((y - bound.top) / (bound.height))) * (bound.yMax - bound.yMin);
    };

    static convertDataXToCanvasCoordinate(bound, x) {
        return bound.left + ((x - bound.xMin) / (bound.xMax - bound.xMin)) * bound.width;
    };

    static convertDataYToCanvasCoordinate(bound, y) {
        return bound.top + (1 - ((y - bound.yMin) / (bound.yMax - bound.yMin))) * bound.height;
    };

    static checkDataXInRange(bound, x) {
        return x >= bound.xMin && x <= bound.xMax;
    };

    static checkDataYInRange(bound, y) {
        return y >= bound.yMin && y <= bound.yMax;
    };

    static checkDataXYInRange(bound, x, y) {
        return DetailedCanvas.checkDataXInRange(bound, x) && DetailedCanvas.checkDataYInRange(bound, y);
    };

    static checkCanvasYInRange(bound, y) {
        return y >= bound.top && y <= (bound.top + bound.height);
    };

    static checkCanvasXInRange(bound, x) {
        return x >= bound.left && x <= (bound.left + bound.width)
    };

    static checkCanvasInRange(bound, x, y) {
        if (bound == null) {
            return false;
        }
        return DetailedCanvas.checkCanvasXInRange(bound, x) && DetailedCanvas.checkCanvasYInRange(bound, y);
    };

    windowToCanvas(e) {
        let result = {};
        let rect = this.refs.canvas.getBoundingClientRect();
        result.x = e.clientX - rect.left;
        result.y = e.clientY - rect.top;
        result.dataX = null;
        result.dataY = null;
        result.bound = null;
        if (this.params.xcor) {
            if (result.x > this.params.xcorBound.left && result.x < this.params.xcorBound.left + this.params.xcorBound.width
                && result.y > this.params.xcorBound.top - 15 && result.y < this.params.xcorBound.top + this.params.xcorBound.height) {
                result.dataX = DetailedCanvas.convertCanvasXCoordinateToDataPoint(this.params.xcorBound, result.x);
                result.dataY = DetailedCanvas.convertCanvasYCoordinateToDataPoint(this.params.xcorBound, result.y);
                result.bound = this.params.xcorBound;
            }
        }
        if (result.bound == null) {
            for (let i = 0; i < this.view.bounds.length; i++) {
                if (DetailedCanvas.checkCanvasInRange(this.view.bounds[i], result.x, result.y)) {
                    result.dataX = DetailedCanvas.convertCanvasXCoordinateToDataPoint(this.view.bounds[i], result.x);
                    result.dataY = DetailedCanvas.convertCanvasYCoordinateToDataPoint(this.view.bounds[i], result.y);
                    result.bound = this.view.bounds[i];
                    break;
                }
            }
        }
        result.inside = (result.dataX != null && result.dataY != null);
        return result;
    };

    canvasMouseDown(loc) {
        if (loc.inside) {
            this.params.lastXDown = loc.x;
            this.params.lastYDown = loc.y;
        }
        if (loc.bound && loc.bound.xcorCallout) {
            this.xcorEvent(loc.dataX);
        }
    };

    canvasMouseUp(loc) {
        this.params.currentMouseX = loc.x;
        this.params.currentMouseY = loc.y;
        if (this.params.lastXDown != null && this.params.lastYDown != null && this.params.currentMouseX != null && this.params.currentMouseY != null &&
            distance(this.params.lastXDown, this.params.lastYDown, this.params.currentMouseX, this.params.currentMouseY) > this.params.minDragForZoom && loc.bound != null && loc.bound.callout === false) {
            this.x1 = DetailedCanvas.convertCanvasXCoordinateToDataPoint(loc.bound, this.params.lastXDown);
            this.x2 = DetailedCanvas.convertCanvasXCoordinateToDataPoint(loc.bound, this.params.currentMouseX);
            this.y1 = DetailedCanvas.convertCanvasYCoordinateToDataPoint(loc.bound, this.params.lastYDown);
            this.y2 = DetailedCanvas.convertCanvasYCoordinateToDataPoint(loc.bound, this.params.currentMouseY);
            loc.bound.xMin = Math.min(this.x1, this.x2);
            loc.bound.xMax = Math.max(this.x1, this.x2);
            loc.bound.yMin = Math.min(this.y1, this.y2);
            loc.bound.yMax = Math.max(this.y1, this.y2);
            loc.bound.lockedBounds = true;
        } else {
            if (loc.bound && loc.bound.callout === false &&
                loc.x > (loc.bound.left + loc.bound.width + this.params.zoomOutXOffset - this.params.zoomOutWidth) &&
                loc.x < (loc.bound.left + loc.bound.width + this.params.zoomOutXOffset) &&
                loc.y < (loc.bound.top + this.params.zoomOutHeight + this.params.zoomOutYOffset) &&
                loc.y > loc.bound.top + this.params.zoomOutYOffset) {
                loc.bound.lockedBounds = false;
                this.redraw();
            } else if (loc.bound && loc.bound.callout === false &&
                loc.x > (loc.bound.left + loc.bound.width + this.params.zoomOutXOffset - this.params.zoomOutWidth) &&
                loc.x < (loc.bound.left + loc.bound.width + this.params.zoomOutXOffset) &&
                loc.y < (loc.bound.top + this.params.zoomOutHeight + this.params.downloadYOffset) &&
                loc.y > loc.bound.top + this.params.downloadYOffset) {
                this.downloadImage();
            } else if (DetailedCanvas.checkCanvasInRange(loc.bound, loc.x, loc.y)) {
                this.params.focusDataX = DetailedCanvas.convertCanvasXCoordinateToDataPoint(loc.bound, loc.x);
                this.params.focusDataY = DetailedCanvas.convertCanvasYCoordinateToDataPoint(loc.bound, loc.y);

                setSpectraFocus(this.params.focusDataX);
                setWaitingForSpectra(true)
            }
        }
        this.params.lastXDown = null;
        this.params.lastYDown = null;
        this.redraw()
    };

    xcorEvent(z) {
        this.detailed.redshift = z.toFixed(5);
    };

    canvasMouseMove(loc) {
        if (!loc.inside) return;
        this.params.currentMouseX = loc.x;
        this.params.currentMouseY = loc.y;
        if (loc.bound != null && loc.bound.xcorCallout !== true) {
            this.handleRedrawRequest();
            if (this.params.lastXDown != null && this.params.lastYDown != null) {
                if (distance(loc.x, loc.y, this.params.lastXDown, this.params.lastYDown) < this.params.minDragForZoom || loc.bound == null || loc.bound.callout) {
                    return;
                }
                this.c.strokeStyle = this.params.dragOutlineColour;
                this.c.fillStyle = this.params.dragInteriorColour;
                this.w = loc.x - this.params.lastXDown;
                this.h = loc.y - this.params.lastYDown;
                this.c.fillRect(this.params.lastXDown + 0.5, this.params.lastYDown, this.w, this.h);
                this.c.strokeRect(this.params.lastXDown + 0.5, this.params.lastYDown, this.w, this.h);
            }
        } else if (loc.bound != null && loc.bound.xcorCallout === true) {
            if (this.params.lastXDown != null && this.params.lastXDown != null) {
                this.xcorEvent(loc.dataX);
            } else {
                this.handleRedrawRequest();
                this.plotZLine2(loc.bound, loc.x);
            }
        }
    };

    mouseOut() {
        this.params.currentMouseX = null;
        this.params.currentMouseY = null;
        this.redraw();
    };

    isScrollingUp(e) {
        if (e.originalEvent) {
            e = e.originalEvent;
        }
        //pick correct delta variable depending on event
        this.delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
        return (e.detail || this.delta > 0);
    };

    zoomIn(res) {
        if (res.inside && res.bound && !res.bound.callout) {
            const r0 = (res.dataX - res.bound.xMin) / (res.bound.xMax - res.bound.xMin);
            const r1 = (res.dataY - res.bound.yMin) / (res.bound.yMax - res.bound.yMin);
            const w = res.bound.xMax - res.bound.xMin;
            const h = res.bound.yMax - res.bound.yMin;
            res.bound.xMin = res.dataX - r0 * w * this.params.zoomXRatio;
            res.bound.xMax = res.bound.xMin + (w * this.params.zoomXRatio);
            res.bound.yMin = res.dataY - r1 * h * this.params.zoomXRatio;
            res.bound.yMax = res.bound.yMin + (h * this.params.zoomXRatio);
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
            res.bound.xMin = res.dataX - r0 * w * (1 / this.params.zoomXRatio);
            res.bound.xMax = res.bound.xMin + (w * (1 / this.params.zoomXRatio));
            res.bound.yMin = res.dataY - r1 * h * (1 / this.params.zoomXRatio);
            res.bound.yMax = res.bound.yMin + (h * (1 / this.params.zoomXRatio));
            res.bound.lockedBounds = true;

            let rawData = this.params.data.where(x => x.id === 'data').toArray();
            rawData = rawData.length ? rawData[0] : null;

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
        } else if (e.type === 'wheel') {
            if (this.isScrollingUp(e)) {
                this.zoomIn(res);
            } else {
                this.zoomOut(res);
            }
        }
    };

    refreshSettings() {
        console.log("refreshSettings");
        console.log("refreshSettings="+this.params.canvasWidth+" "+this.params.canvasHeight);
        this.params.canvasHeight = this.refs.parent.clientHeight;
        this.params.canvasWidth = this.refs.parent.clientWidth;
        this.refs.canvas.width = this.params.canvasWidth * this.params.scale;
        this.refs.canvas.height = this.params.canvasHeight * this.params.scale;
        this.refs.canvas.style.width = this.params.canvasWidth + "px";
        this.refs.canvas.style.height = this.params.canvasHeight + "px";
        this.c.scale(this.params.scale, this.params.scale);
        this.params.callout = this.showCallout() ? this.params.canvasHeight > 450 : false;
        this.params.xcor = this.params.xcorData && this.showXcor() && (this.params.canvasHeight > 300);
        this.params.xcorBound.width = this.params.canvasWidth - this.params.xcorBound.left - this.params.xcorBound.right;
        this.params.xcorBound.height = this.params.xcorHeight - this.params.xcorBound.top - this.params.xcorBound.bottom;
        this.view.bounds[0].top = this.params.xcor ? this.params.baseTop + this.params.xcorHeight : this.params.baseTop;
        this.view.bounds[0].bottom = this.params.callout ? Math.floor(this.params.canvasHeight * 0.3) + this.params.baseBottom : this.params.baseBottom;
        this.view.bounds[0].width = this.params.canvasWidth - this.view.bounds[0].left - this.view.bounds[0].right;
        this.view.bounds[0].height = this.params.canvasHeight - this.view.bounds[0].top - this.view.bounds[0].bottom;
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

        const data = this.params.data.toArray();
        const count = data.length;

        for (let i = 0; i < count; i++) {
            if (data[i].bound) {
                c++;
            }
            if (!bound.callout) {
                if (data[i].bound && data[i].xMin != null && data[i].xMax != null) {
                    bound.xMin = data[i].xMin;
                    bound.xMax = data[i].xMax;
                }
            }
        }
        let currentRangeIndex = this.detailed.rangeIndex;

        for (let i = 0; i < count; i++) {
            if (data[i].bound) {
                bound.yMin = data[i].yMins[currentRangeIndex];
                bound.yMax = data[i].yMaxs[currentRangeIndex];
            }
        }

        let hasYrange = false
        if ("ymin" in window.marz_configuration) {
            bound.yMin = parseFloat(window.marz_configuration.ymin, bound.yMin)
            hasYrange = true
        }
        if ("ymax" in window.marz_configuration) {
            bound.yMax = parseFloat(window.marz_configuration.ymax, bound.yMax)
            hasYrange = true
        }

        if (c === 0) {
            if (!bound.callout) {
                bound.xMin = 3300;
                bound.xMax = 7200;
            }
            if (!hasYrange) {
                bound.yMin = -500;
                bound.yMax = 1000;
            }
        } else {
            if (!hasYrange) {
                bound.yMin = bound.yMax - (bound.callout ? this.params.calloutSpacingFactor : this.params.spacingFactor) * (bound.yMax - bound.yMin);
            }
        }
    };

    clearPlot(download) {
        download = defaultFor(download, false);
        /*c.save();
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.restore();*/
        console.log("clearPlot="+this.refs.canvas.width, this.refs.canvas.height);
        this.c.rect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        if (download) {
            this.c.fillStyle = "#ffffff";
        } else {
            this.c.fillStyle = "rgb(249, 249, 249)";
        }
        this.c.fill();
    };

    plotZeroLine(bound) {
        const y = DetailedCanvas.convertDataYToCanvasCoordinate(bound, 0);
        if (y > (bound.top + bound.height) || y < bound.top) {
            return;
        }
        this.c.strokeStyle = this.params.zeroLineColour;
        this.c.beginPath();
        this.c.moveTo(bound.left, Math.floor(y) + 0.5);
        this.c.lineTo(bound.left + bound.width, Math.floor(y) + 0.5);
        this.c.stroke();
    };

    plotAxes(bound, colour) {
        if (typeof colour === "undefined") colour = this.params.axesColour;
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
        this.c.font = this.params.labelFont;
        this.c.strokeStyle = this.params.stepColour;
        this.c.fillStyle = this.params.labelFill;
        this.c.textAlign = 'center';
        this.c.textBaseline = "top";

        const startX = DetailedCanvas.convertCanvasXCoordinateToDataPoint(bound, bound.left);
        const endX = DetailedCanvas.convertCanvasXCoordinateToDataPoint(bound, bound.left + bound.width);
        const xRange = endX - startX;
        let numLabels = bound.width / this.params.labelWidth;
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
        this.c.beginPath();
        for (let i = firstX + xStep; i < endX; i += xStep) {
            const x = DetailedCanvas.convertDataXToCanvasCoordinate(bound, i) + 0.5;
            if (onlyLabels) {
                this.c.fillText(parseFloat((i).toPrecision(4)).toString(), x, y);
            } else {
                this.c.moveTo(x, bound.top);
                this.c.lineTo(x, bound.top + bound.height);
            }
        }
        this.c.textAlign = 'right';
        this.c.textBaseline = "middle";

        const endY = DetailedCanvas.convertCanvasYCoordinateToDataPoint(bound, bound.top);
        const startY = DetailedCanvas.convertCanvasYCoordinateToDataPoint(bound, bound.top + bound.height);
        const yRange = endY - startY;
        numLabels = bound.height / this.params.labelHeight;
        let yStep = yRange / numLabels;
        base = 10;
        exponent = Math.floor(Math.log(yStep) / Math.log(base));
        if (exponent === 0 && Math.floor(Math.log(yStep) / Math.log(5)) > 0) {
            base = 5;
            exponent = Math.floor(Math.log(yStep) / Math.log(5));
        }
        yStep = Math.max(1, Math.floor(yStep / Math.pow(base, exponent))) * Math.pow(base, exponent);
        const firstY = startY - startY % yStep;
        let yfactor=1;
        let yStepAsInteger=yStep;
        while (yStepAsInteger<1) {
            yfactor *= 10;
            yStepAsInteger = yStep * yfactor;
        }

        const x = bound.left - 10;
        for (let i = firstY + yStep; i < endY; i += yStep) {
            const y = DetailedCanvas.convertDataYToCanvasCoordinate(bound, i);
            if (onlyLabels) {
                const lbl = parseFloat((i*yfactor).toPrecision(4));
                if (Math.abs(lbl) < 1e-10) {
                    this.c.fillText('0', x, y);
                } else {
                    this.c.fillText(lbl.toString(), x, y);
                }
            } else {
                this.c.moveTo(bound.left, y);
                this.c.lineTo(bound.left + bound.width, y);
            }
        }
        if (!onlyLabels) {
            this.c.stroke();
        }
        return yfactor;
    };

    plotAxesFormalLabels(yfactor,bound) {
        if (!bound.callout) {
            const xlabel = "Wavelength (\u00C5)";
            let ylabel = "Intensity";
            if (yfactor>1) {
                let log_yfactor = Math.log10(yfactor);
                ylabel += (" (10^"+log_yfactor+")");
            }

            const bottomX = bound.left + 0.5 * bound.width;
            const bottomY = bound.top + bound.height + 20;
            const leftX = 0;
            const leftY = bound.top + 0.5 * bound.height;
            this.c.font = this.params.labelFont;
            this.c.strokeStyle = this.params.stepColour;
            this.c.fillStyle = this.params.labelFill;
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
        this.plotText(name, bound.left, 0, this.params.annotationColour);
    };

    plotText(text, x, y, colour) {
        this.c.textAlign = 'left';
        this.c.textBaseline = 'top';
        this.c.font = this.params.labelFont;
        this.c.strokeStyle = colour;
        this.c.fillStyle = colour;
        this.c.fillText(text, x, y);
    };

    plotZLine2(bound, x) {
        this.c.lineWidth = 1;
        this.c.strokeStyle = this.params.xcorLineHighlight;
        this.c.beginPath();
        this.c.moveTo(x, bound.top);
        this.c.lineTo(x, bound.top + bound.height);
        this.c.stroke();
    };

    plotZLine(bound) {
        this.c.save();
        const z = parseFloat(this.detailed.redshift);
        if (z < bound.xMin || z > bound.xMax) {
            return;
        }
        let x = bound.left + bound.width * (z - bound.xMin) / (bound.xMax - bound.xMin);
        const btm = binarySearch(this.params.xcorData.zs, z);
        let xc = 0;
        if (btm[0] === btm[1]) {
            xc = this.params.xcorData.xcor[btm[0]];
        } else {
            const part = findCorrespondingFloatIndex(this.params.xcorData.zs, z, btm[0]) - btm[0];
            xc = this.params.xcorData.xcor[btm[0]] * (1 - part) + part * this.params.xcorData.xcor[btm[1]]
        }
        xc = xc / this.params.xcorData.weight;
        this.c.beginPath();
        this.c.setLineDash([2, 2]);
        this.c.strokeStyle = this.params.xcorLineColour;
        this.c.moveTo(x, bound.top);
        this.c.lineTo(x, bound.top + bound.height);
        this.c.stroke();
        this.c.setLineDash([]);
        this.c.textAlign = 'left';
        this.c.textBaseline = 'top';
        this.c.font = this.params.labelFont;
        this.c.strokeStyle = this.params.xcorLineColour;
        this.c.fillStyle = this.params.xcorLineColour;
        x = Math.max(x, bound.left + 40);
        x = Math.min(x, bound.left + bound.width - 120);
        this.c.fillText(xc.toFixed(3) + " @ z=" + this.detailed.redshift, x, 0);
        this.c.restore();

    };

    plotxcorData() {
        if (this.params.xcor) {
//                        plotAxes(params.xcorBound, "#aaa");
            this.annotatePlot("XCor", this.params.xcorBound);
            if (this.params.xcorData != null && this.params.xcorData.zs != null && this.params.xcorData.xcor != null) {
                this.params.xcorBound.xMin = this.params.xcorData.zs[0];
                this.params.xcorBound.xMax = this.params.xcorData.zs[this.params.xcorData.zs.length - 1];
                this.params.xcorBound.yMin = getMin(this.params.xcorData.xcor);
                this.params.xcorBound.yMax = getMax(this.params.xcorData.xcor);
                this.plotZeroLine(this.params.xcorBound, "#999");
                this.renderLinearPlot(this.params.xcorBound, this.params.xcorData.zs, this.params.xcorData.xcor, this.params.xcorPlotColour);
                this.plotZLine(this.params.xcorBound);
            }
        }
    };

    renderLinearPlot(bound, xs, ys, colour) {
        this.c.beginPath();
        this.c.strokeStyle = colour;
        for (let i = 0; i < xs.length; i++) {
            const x = bound.left + (xs[i] - bound.xMin) / (bound.xMax - bound.xMin) * (bound.width);
            const y = bound.top + bound.height - ((ys[i] - bound.yMin) * (bound.height) / (bound.yMax - bound.yMin));
            if (i === 0) {
                this.c.moveTo(x, y);
            } else {
                this.c.lineTo(x, y);
            }
        }
        this.c.stroke();
    };

    renderPlots(bound) {
        console.log("Render plots");
        this.c.lineWidth = 0.6;

        const data = this.params.data.toArray();
        const dataonly = (window.marz_configuration.layout == 'ReadOnlySpectrumView' || window.marz_configuration.layout == 'SimpleSpectrumView');

        for (let j = 0; j < this.params.data.count(); j++) {
            if (dataonly &&  data[j].id!= "data") {
                continue;
            }
            this.c.beginPath();
            this.c.strokeStyle = data[j].colour;
            const xs = data[j].x;
            const ys = data[j].y2 == null ? data[j].y : data[j].y2;
            let disconnect = true;
            let oob = false;
            let x = 0;
            let y = 0;
            let yOffset = 0;
            let r = 1;
            let o = 0;
            if (data[j].id === 'template') {
                this.c.globalAlpha = 0.5;
                const lower = binarySearch(xs, bound.xMin)[0];
                const upper = binarySearch(xs, bound.xMax)[1];
                const min = getMin(ys, lower, upper);
                const max = getMax(ys, lower, upper);
                r = ((bound.yMax - bound.yMin) / (max - min)) / (bound.callout ? this.params.calloutSpacingFactor : this.params.spacingFactor) / this.params.templateFactor;
                o = bound.yMin - r * min;
                yOffset = this.detailed.templateOffset * bound.height / (this.params.templateFactor * (bound.callout ? 200 : 150));
            } else if (data[j].id === 'sky') {
                if (bound.callout) {
                    continue;
                }
                yOffset = bound.height + bound.top;
            } else if (data[j].id === 'variance') {
                if (bound.callout) {
                    continue;
                }
                yOffset = bound.top + 5;
                this.c.moveTo(bound.left, bound.top + 5);
                this.c.lineTo(bound.left + bound.width, bound.top + 5);
                this.c.moveTo(bound.left, bound.top + 5)
            } else if (data[j].id === "data") {
                if (bound.callout) {
                    yOffset = -5;
                } else {
                    yOffset = 0;
                }
            }
            let start = 0;
            if (data[j].id === "data") {
                start = this.params.startRawTruncate;
            }
            let mx2 = bound.left;
            let mx1 = bound.left;
            let cx = null;
            let yp = 0;
            for (let i = start; i < xs.length - 1; i++) {
                if (xs[i] >= bound.xMin && xs[i] <= bound.xMax) {
                    x = cx;
                    cx = DetailedCanvas.convertDataXToCanvasCoordinate(bound, xs[i + 1]);
                    mx1 = mx2;
                    if (x == null) {
                        x = DetailedCanvas.convertDataXToCanvasCoordinate(bound, xs[i]);
                        if (i === 0) {
                            mx1 = x;
                        } else {
                            mx1 = bound.left;
                        }
                    }
                    mx2 = (x + cx) / 2;
                    if (data[j].id === "sky") {
                        y = yOffset - ys[i];
                    } else if (data[j].id === "variance") {
                        y = yOffset + ys[i];
                    } else if (data[j].id === 'template') {
                        y = DetailedCanvas.convertDataYToCanvasCoordinate(bound, ys[i] * r + o) - yOffset;
                    } else {
                        y = DetailedCanvas.convertDataYToCanvasCoordinate(bound, ys[i]) - yOffset;
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
                            if (data[j].id === "sky") {
                                yp = yOffset - ys[i - 1];
                            } else if (data[j].id === "variance") {
                                yp = yOffset + ys[i - 1];
                            } else if (data[j].id === 'template') {
                                yp = DetailedCanvas.convertDataYToCanvasCoordinate(bound, ys[i - 1] * r + o) - yOffset;
                            } else {
                                yp = DetailedCanvas.convertDataYToCanvasCoordinate(bound, ys[i - 1]) - yOffset;
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
            if (data[j].id === "template") {
                this.c.globalAlpha = 1;
            }
        }
        this.c.lineWidth = 1;
    };

    drawZoomOut(bound) {
        if (!bound.callout) {
            const x = bound.left + bound.width + this.params.zoomOutXOffset - this.params.zoomOutWidth;
            const y = bound.top + this.params.zoomOutYOffset;
            this.c.drawImage(this.zoomOutImg, x, y);
        }
    };

    drawDownload(bound) {
        if (!bound.callout) {
            const x = bound.left + bound.width + this.params.zoomOutXOffset - this.params.zoomOutWidth;
            const y = bound.top + this.params.downloadYOffset;
            this.c.drawImage(this.downloadImg, x, y);
        }

    };

    plotSpectralLines(bound) {
        if (!this.detailed.spectralLines) return;
        const lines = spectraLineService.getAll();
        this.c.save();
        this.c.textAlign = 'center';
        this.c.textBaseline = 'bottom';
        this.c.font = this.params.labelFont;

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
            const spectralLineColour = this.params.spectralLineColours[lines[i].type];
            this.c.fillStyle = spectralLineColour;
            for (let j = 0; j < lines[i].displayLines.length; j++) {
                this.lambda = shiftWavelength(lines[i].displayLines[j], z);
                if (DetailedCanvas.checkDataXInRange(bound, this.lambda)) {
                    const x = 0.5 + Math.floor(DetailedCanvas.convertDataXToCanvasCoordinate(bound, this.lambda));
                    let h = staggerHeight;
                    if (Math.abs(x - px) < 40) {
                        h = up ? 0 : staggerHeight;
                        up = !up;
                    } else {
                        up = true;
                    }
                    px = x;
                    let strength = null;
                    if (this.params.baseData != null) {
                        strength = getStrengthOfLine(this.params.baseData.x, this.params.baseData.y2, lines[i], z, this.templateManager.isQuasar(this.detailed.templateId));
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
        if (this.params.focusDataX == null || this.params.focusDataX == null) return;
        if (DetailedCanvas.checkDataXYInRange(bound, this.params.focusDataX, this.params.focusDataY)) {
            const x = DetailedCanvas.convertDataXToCanvasCoordinate(bound, this.params.focusDataX);
            const y = DetailedCanvas.convertDataYToCanvasCoordinate(bound, this.params.focusDataY);
            this.c.strokeStyle = this.params.focusCosmeticColour;
            this.c.lineWidth = 2;
            this.c.beginPath();
            this.c.arc(x, y, 2, 0, 2 * Math.PI, false);
            this.c.stroke();
            this.c.beginPath();
            this.c.arc(x, y, this.params.focusCosmeticMaxRadius, 0, 2 * Math.PI, false);
            this.c.stroke();
            this.c.lineWidth = 1;
        }
    };

    drawCursor(bound) {
        if (this.params.currentMouseX == null || this.params.currentMouseY == null) return;
        if (!DetailedCanvas.checkCanvasInRange(bound, this.params.currentMouseX, this.params.currentMouseY)) return;
        const w = bound.callout ? 60 : 70;
        const h = 16;
        this.c.strokeStyle = this.params.cursorColour;
        this.c.beginPath();
        this.c.moveTo(bound.left, this.params.currentMouseY + 0.5);
        this.c.lineTo(this.params.currentMouseX - this.params.cursorXGap, this.params.currentMouseY + 0.5);
        this.c.moveTo(this.params.currentMouseX + this.params.cursorXGap, this.params.currentMouseY + 0.5);
        this.c.lineTo(bound.left + bound.width, this.params.currentMouseY + 0.5);
        this.c.moveTo(this.params.currentMouseX + 0.5, bound.top);
        this.c.lineTo(this.params.currentMouseX + 0.5, this.params.currentMouseY - this.params.cursorYGap);
        this.c.moveTo(this.params.currentMouseX + 0.5, this.params.currentMouseY + this.params.cursorYGap);
        this.c.lineTo(this.params.currentMouseX + 0.5, bound.top + bound.height);
        this.c.stroke();
        this.c.beginPath();
        this.c.moveTo(bound.left, this.params.currentMouseY + 0.5);
        this.c.lineTo(bound.left - 5, this.params.currentMouseY + h / 2);
        this.c.lineTo(bound.left - w, this.params.currentMouseY + h / 2);
        this.c.lineTo(bound.left - w, this.params.currentMouseY - h / 2);
        this.c.lineTo(bound.left - 5, this.params.currentMouseY - h / 2);
        this.c.closePath();
        this.c.fillStyle = this.params.cursorColour;
        this.c.fill();
        this.c.fillStyle = this.params.cursorTextColour;
        this.c.textAlign = 'right';
        this.c.textBaseline = 'middle';
        this.c.fillText(DetailedCanvas.convertCanvasYCoordinateToDataPoint(bound, this.params.currentMouseY + 0.5).toFixed(1), bound.left - 10, this.params.currentMouseY);
        this.c.beginPath();
        const y = bound.top + bound.height;
        this.c.moveTo(this.params.currentMouseX, y);
        this.c.lineTo(this.params.currentMouseX + w / 2, y + 5);
        this.c.lineTo(this.params.currentMouseX + w / 2, y + 5 + h);
        this.c.lineTo(this.params.currentMouseX - w / 2, y + 5 + h);
        this.c.lineTo(this.params.currentMouseX - w / 2, y + 5);
        this.c.closePath();
        this.c.fillStyle = this.params.cursorColour;
        this.c.fill();
        this.c.fillStyle = this.params.cursorTextColour;
        this.c.textAlign = 'center';
        this.c.textBaseline = 'top';
        this.c.fillText(DetailedCanvas.convertCanvasXCoordinateToDataPoint(bound, this.params.currentMouseX + 0.5).toFixed(1), this.params.currentMouseX + 0.5, y + 5)

    };

    plotWindow(bound, download) {
        console.log("plot window")
        this.getBounds(bound);
        this.plotAxesLabels(false, bound);
        this.plotZeroLine(bound);
        if (this.showSpectraLines())
            this.plotSpectralLines(bound);
        this.renderPlots(bound);
        this.plotAxes(bound);
        let yfactor = this.plotAxesLabels(true, bound);
        this.plotAxesFormalLabels(yfactor,bound);
        if (!download && this.showZoomControl()) {
            this.drawFocus(bound);
            this.drawZoomOut(bound);
            if (this.showDownloadControl())
                this.drawDownload(bound);
            this.drawCursor(bound);
        }
    };

    selectCalloutWindows() {
        this.params.baseData = this.params.data.where(x => {
            return x.id === 'data';
        }).toArray();

        if (!this.params.baseData.length)
            this.params.baseData = null;
        else
            this.params.baseData = this.params.baseData[0];

        const redshift = parseFloat(this.detailed.redshift);
        let start = this.view.defaultMin;
        let end = this.view.defaultMax;

        const desiredNumberOfCallouts = Math.min(Math.floor(this.params.canvasWidth / this.params.minCalloutWidth), this.params.maxCallouts);

        if (this.params.baseData != null && this.params.baseData.length > 0 && !isNaN(redshift)) {
            start = this.params.baseData[0].x[0];
            end = this.params.baseData[0].x[this.params.baseData[0].x.length - 1];
        }

        const availableCallouts = this.params.callouts.where(c => {
            const zmean = ((1 + redshift) * c[0] + (1 + redshift) * c[1]) / 2.;
            return zmean >= start && zmean <= end;
        }).toArray();

        console.log("desiredNumberOfCallouts="+desiredNumberOfCallouts);
        const numCallouts = Math.min(desiredNumberOfCallouts, availableCallouts.length);
        this.view.bounds = [this.view.mainBound];

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
            this.view.bounds.push({
                xMin: availableCallouts[i][0] * (1 + redshift),
                xMax: availableCallouts[i][1] * (1 + redshift),
                yMin: 0,
                yMax: 0,
                callout: true,
                lockedBounds: false
            });
        }

        if (this.params.callout) {
            const w = (this.params.canvasWidth / numCallouts);
            const h = Math.floor(this.params.canvasHeight * 0.3);
            let numCallout = 0;
            for (let i = 0; i < this.view.bounds.length; i++) {
                if (this.view.bounds[i].callout) {
                    this.view.bounds[i].left = 60 + w * numCallout;
                    this.view.bounds[i].top = 20 + this.params.canvasHeight - h;
                    this.view.bounds[i].bottom = 20;
                    this.view.bounds[i].right = 10 + (w * (numCallout + 1));
                    this.view.bounds[i].height = h - 40;
                    this.view.bounds[i].width = w - 60;
                    numCallout++;
                }
            }
        }
    };

    handleRedrawRequest() {
        this.refreshSettings();
        this.selectCalloutWindows();
        this.clearPlot();
        if (this.showXcor())
            this.plotxcorData();
        this.plotWindow(this.view.bounds[0], false);
        if (this.showCallout()) {
            for (let i = 1; i < this.view.bounds.length; i++) {
                this.plotWindow(this.view.bounds[i], false);
            }
        }
        
        this.params.requested = false;
    };

    downloadImage() {
        this.setScale(2.0);
        this.refreshSettings();
        this.selectCalloutWindows();
        this.clearPlot(true);
        if (this.showXcor())
            this.plotxcorData();
        for (let i = 0; i < this.view.bounds.length; i++) {
            this.plotWindow(this.view.bounds[i], true);
        }
        const d = this.refs.canvas.toDataURL("image/png");
        const w = window.open('about:blank', 'image from canvas');
        w.document.write("<img src='" + d + "' alt='from canvas'/>");
        this.setScale();
        this.handleRedrawRequest();
    };

    redraw() {
        if (!this.params.requested) {
            this.params.requested = true;
            window.setTimeout(() => this.handleRedrawRequest(), 1000 / 60);
        }

    };

    smoothData(id) {
        const smooth = parseInt(this.detailed.smooth);
        const data = this.params.data.toArray();
        for (let i = 0; i < this.params.data.count(); i++) {
            if (data[i].id === id) {
                data[i].y2 = fastSmooth(data[i].y, smooth);
                let ys2 = data[i].y2.slice(this.params.startRawTruncate);
                ys2 = ys2.sort(function (a, b) {
                    if (!isFinite(a - b)) {
                        return !isFinite(a) ? -1 : 1;
                    } else {
                        return a - b;
                    }
                });
                const numPoints = ys2.length;
                let k;
                for (k = 0; k < numPoints; k++) {
                    if (isFinite(ys2[k])) {
                        break;
                    }
                }
                const yMins = [], yMaxs = [];
                for (let j = 0; j < this.detailed.ranges.length; j++) {
                    let range = this.detailed.ranges[j];
                    yMins.push(ys2[Math.floor(0.01 * (100 - range) * (numPoints - k)) + k]);
                    yMaxs.push(ys2[Math.ceil(0.01 * (range) * (numPoints - 1 - k)) + k]);
                }
                data[i].yMins = yMins;
                data[i].yMaxs = yMaxs;
            }
        }
    };

    // getActiveHash() {
    //     if (this.ui.active == null) return "";
    //     return this.ui.active.getHash();
    // };
    //
    addxcorData() {
        if (this.ui.active == null || this.ui.active.templateResults == null) {
            this.params.xcorData = null;
        } else {
            this.params.xcorData = this.ui.active.templateResults[this.detailed.templateId];
        }
    };

    addBaseData() {
        // Remove any existing data or variance from the data array
        this.params.data = this.params.data.where(x => x.id !== 'data' && x.id !== 'variance');

        if (this.ui.active != null) {
            let ys = null;
            let xs = null;
            let colour = "#000";
            if (this.ui.dataSelection.processed && this.ui.active.processedLambdaPlot != null) {
                xs = this.ui.active.processedLambdaPlot;
                ys = this.detailed.continuum ? this.ui.active.processedContinuum : this.ui.active.processedIntensity2;
                colour = this.ui.colours.processed;
            } else {
                ys = this.detailed.continuum ? this.ui.active.intensityPlot : this.ui.active.getIntensitySubtracted();
                xs = this.ui.active.lambda;
                colour = this.ui.colours.raw;
            }
            const xs2 = xs.slice();
            xs2.sort(function (a, b) {
                return a - b;
            });
            const xMin = xs2[this.params.startRawTruncate];
            const xMax = xs2[xs2.length - 1];

            this.params.baseData = {
                id: 'data', bound: true, colour: colour, x: xs, y: ys, xMin: xMin,
                xMax: xMax
            };
            this.params.data = this.params.data.concat([this.params.baseData]);
            if (this.ui.dataSelection.variance) {
                if (this.ui.dataSelection.processed && this.ui.active.processedVariancePlot != null) {
                    ys = this.ui.active.processedVariancePlot;
                } else {
                    ys = this.ui.active.variancePlot;
                }
                this.params.data = this.params.data.concat(
                    [
                        {id: 'variance', bound: false, colour: this.ui.colours.variance, x: xs, y: ys}
                    ]
                );
            }
            this.smoothData('data');
        }
        this.params.data.orderBy(a => a.id);
    };

    addSkyData() {
        this.params.data = this.params.data.where(x => x.id !== 'sky');

        if (this.ui.active != null && this.ui.active.sky != null) {
            this.params.data = this.params.data.concat(
                [
                    {
                        id: 'sky',
                        colour: this.ui.colours.sky,
                        bound: false,
                        x: this.ui.active.lambda,
                        y: this.ui.active.sky
                    }
                ]
            );
        }
    };

    addTemplateData() {
        this.params.data = this.params.data.where(x => x.id !== 'template');

        if (this.detailed.templateId !== "0" && this.ui.dataSelection.matched) {
            let h = null;
            let c = null;
            if (this.ui.active != null) {
                h = this.ui.active.helio;
                c = this.ui.active.cmb;
            }
            let r = this.templateManager.getTemplateAtRedshift(this.detailed.templateId,
                adjustRedshift(parseFloat(this.detailed.redshift), -h, -c), this.detailed.continuum);
            this.params.data = this.params.data.concat(
                [
                    {id: "template", colour: this.ui.colours.matched, x: r[0], y: r[1]}
                ]
            );
        }

        this.params.data.orderBy(a => a.id);
    };
}

export default DetailedCanvas;