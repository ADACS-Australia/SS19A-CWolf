import React from "react";
import * as Enumerable from "linq";
import {templateManager} from "../../Lib/TemplateManager";
import ManagedToggleButton from "../General/ToggleButton/ManagedToggleButton";
import {activateTemplate} from "../../Stores/Templates/Actions";

class Templates extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {
                    Enumerable.from(templateManager.getOriginalTemplates()).select((t, i) => {
                        return (
                            <div className="lined bottom-spacing" key={i}>
                                <div className="top-bar more">
                                    <strong className="alignTop">Template ID: {t.id}</strong>
                                    <p className="alignTop">{t.name},  &Aring;: {
                                        t
                                            .start_lambda_linear.toFixed(1)
                                    } &rarr; {t.end_lambda_linear.toFixed(1)}</p>
                                    <ManagedToggleButton
                                        className="templateSwitch"
                                        value={!t.inactive}
                                        on={"On"}
                                        off={"Off"}
                                        handle={"Active"}
                                        size="xs"
                                        offstyle="danger"
                                        onToggle={toggled => activateTemplate(t, toggled)}
                                    />
                                </div>
                                <canvas
                                    className="under-bar unselectable more"
                                    ref={e => this.drawTemplateOnCanvas(t, e)}
                                />
                            </div>
                        )
                    }).toArray()}
            </div>
        )
    }

    drawTemplateOnCanvas(template, canvas) {
        // Check if the canvas is valid, and if not there is nothing to do, so return
        if (!canvas)
            return;

        const r = templateManager.getTemplateAtRedshift(template.id, 0, true);
        const bounds = this.getMaxes([
            [r[0], r[1]]
        ]);
        this.clearPlot(canvas);
        const ratio = window.devicePixelRatio || 1.0;
        const width = canvas.width / ratio;
        const height = canvas.height / ratio;
        this.plot(r[0], r[1], this.props.ui.colours.template, canvas, bounds, width, height);
    };

    plot(xs, data, colour, canvas, bounds, w, h) {
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

    getMaxes(vals) {
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

    clearPlot(canvas) {
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
    }
}

export default Templates;