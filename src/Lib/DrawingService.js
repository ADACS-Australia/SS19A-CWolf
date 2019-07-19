import {templateManager} from "./TemplateManager";
import {interpolate} from "../Utils/methods";
import {adjustRedshift} from "../Utils/dsp";

class DrawingService {
    static drawTemplateOnCanvas(template, canvas, colours) {
        const r = templateManager.getTemplateAtRedshift(template.id, 0, true);
        const bounds = DrawingService.getMaxes([
            [r[0], r[1]]
        ]);
        DrawingService.clearPlot(canvas);
        const ratio = window.devicePixelRatio || 1.0;
        const width = canvas.width / ratio;
        const height = canvas.height / ratio;
        DrawingService.plot(r[0], r[1], colours.template, canvas, bounds, width, height);
    };
    
    static drawOverviewOnCanvas(spectra, canvas, width, height, colours) {
        if (spectra.intensity.length > 0) {
            const hasProcessed = !(spectra.processedLambdaPlot == null || typeof spectra.processedLambdaPlot === 'undefined');

            const lambda = DrawingService.condenseToXPixels(!hasProcessed ? spectra.lambda : spectra.processedLambdaPlot, width);
            const intensity = DrawingService.condenseToXPixels(!hasProcessed ? spectra.intensityPlot : spectra.processedContinuum, width);
            let r = null;
            if (spectra.getFinalTemplateID() != null && spectra.getFinalTemplateID() !== "0") {
                r = templateManager.getTemplateAtRedshift(spectra.getFinalTemplateID(), adjustRedshift(spectra.getFinalRedshift(), -spectra.helio, -spectra.cmb), true);
            }
            let tempIntensity;
            if (r == null || r[0] == null || r[1] == null) {
                tempIntensity = null;
            } else {
                tempIntensity = DrawingService.condenseToXPixels(interpolate(spectra.lambda, r[0], r[1]), width);
            }
            //this.clearPlot(canvas);
            const toBound = [];
            const toBound2 = [];
            toBound.push([lambda, intensity]);
            const bounds = DrawingService.getMaxes(toBound);
            bounds[2] = bounds[2] - 0.3 * (bounds[3] - bounds[2]);
            DrawingService.plotZeroLine(canvas, "#C4C4C4", bounds, width, height);
            DrawingService.plot(lambda, intensity, colours.raw, canvas, bounds, width, height);
            if (tempIntensity != null) {
                toBound2.push([lambda, tempIntensity]);
                const bounds2 = DrawingService.getMaxes(toBound2);
                DrawingService.plot(lambda, tempIntensity, colours.matched, canvas, [bounds[0], bounds[1], bounds2[2] - 0.*(bounds2[3]-bounds2[2]), bounds2[2] + (2*(bounds2[3] - bounds2[2]))], width, height);
            }
            const merges = spectra.getMerges();
            for (let i = 0; i < merges.length; i++) {
                const colour = colours.merges[i];
                const z = merges[i].z;
                const tid = merges[i].tid;
                r = templateManager.getTemplateAtRedshift(tid, adjustRedshift(z, -spectra.helio, -spectra.cmb), true);
                const tempIntensity = DrawingService.condenseToXPixels(interpolate(spectra.lambda, r[0], r[1]), width);
                const boundss = [[lambda, tempIntensity]];
                const bound = DrawingService.getMaxes(boundss);
                DrawingService.plot(lambda, tempIntensity, colour, canvas, [bounds[0], bounds[1], bound[2] + 0.2*(i-0.5)*(bound[3]-bound[2]), bound[2] + (2*(bound[3] - bound[2]))], width, height);
            }
        }
    };

    static plot(xs, data, colour, canvas, bounds, w, h) {
        if (data == null || data.length === 0) {
            return;
        }
        const c = canvas.getContext("2d");
        c.beginPath();
        c.strokeStyle = colour;
        const xmin = bounds[0];
        const xmax = bounds[1];
        const ymin = bounds[2];
        const ymax = bounds[3];

        for (let i = 1; i < data.length; i++) {
            const x = 5 + (xs[i]-xmin)/(xmax-xmin) * (w - 10);
            const y = h - (5 + (data[i]-ymin)*(h-10)/(ymax-ymin));
            if (i === 0) {
                c.moveTo(x,y);
            } else {
                c.lineTo(x,y);
            }
        }
        c.stroke();
    };

    static plotZeroLine(canvas, colour, bounds, w, h) {
        const c = canvas.getContext("2d");
        const ymin = bounds[2];
        const ymax = bounds[3];
        const hh = h - (5 + (0 - ymin) * (h - 10) / (ymax - ymin)) + 0.5;
        c.strokeStyle = colour;
        c.moveTo(0, hh);
        c.lineTo(w, hh);
        c.stroke();
    };

    static condenseToXPixels(data, numPix) {
        if (data == null) {
            return null;
        }
        const res = Math.ceil(data.length / numPix);
        const d = [];
        let tmp = 0;
        for (let i=0; i < data.length; i++) {
            if (i % res === 0 && i !== 0) {
                d.push(tmp);
                tmp = 0;
            } else {
                tmp += (data[i] / res)
            }
        }
        return d;
    };

    static getMaxes(vals) {
        let xmin = 9e9;
        let xmax = -9e9;
        let ymin = 9e9;
        let ymax = -9e9;
        for (let i = 0; i < vals.length; i++) {
            const xs = vals[i][0];
            const ys = vals[i][1];
            if (xs != null) {
                for (let j = 0; j < xs.length; j++) {
                    if (xs[j] < xmin) {
                        xmin = xs[j];
                    }
                    if (xs[j] > xmax) {
                        xmax = xs[j];
                    }
                }
            }
            if (ys != null) {
                for (let k = 0; k < ys.length; k++) {
                    if (ys[k] < ymin) {
                        ymin = ys[k];
                    }
                    if (ys[k] > ymax) {
                        ymax = ys[k];
                    }
                }
            }
        }
        return [xmin, xmax, ymin, ymax];
    };

    static clearPlot(canvas) {
        const ratio = window.devicePixelRatio || 1.0;
        canvas.style.width = canvas.clientWidth;
        canvas.style.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth * ratio;
        canvas.height = canvas.clientHeight * ratio;
        const c = canvas.getContext("2d");
        c.scale(ratio, ratio);
        c.save();
        // Use the identity matrix while clearing the canvas
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, canvas.width, canvas.height);
        // Restore the transform
        c.restore();
    };
}


export default DrawingService