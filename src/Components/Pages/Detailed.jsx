import React from "react";

import '../../Assets/css/detailed.scss';

class Detailed extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="detailedView filler">
                <div className="panel panel-default detailed-control panel-header">
                    <div className="panel-heading">
                        <strong>ID</strong>
                        <strong>NAME</strong>
                        <strong>AutoQOP</strong>
                        <h4 className="auto-qop">
                            <span className=""></span></h4>
                        <strong>QOP</strong>
                        <h4 className="qop-h4">
                            <span className="label"></span>
                        </h4>
                        <strong>COMMENT</strong>
                        <input type="text"
                               className="input-sm comment-input"
                               placeholder="Enter a comment"/>
                        <strong>RA</strong>
                        <strong>DEC</strong>
                        <strong>MAG</strong>
                        <strong>TYPE</strong>
                    </div>
                    <ul className="list-group">
                        <li className="list-group-item form-inline">
                            <div className="form-group">
                                <div className="input-group input-group-sm">
                                    <div className="btn-group">
                                        <button className="btn btn-sm btn-default">
                                            <strong></strong>
                                            <span className="label control-panel-span">
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group toggle-switch">
                                {/*<toggle-switch className="switch-success" style="width: 170px"*/}
                                {/*ng-model="ui.dataSelection.processed" knob-label="Data"*/}
                                {/*on-label="Processed" off-label="Raw"></toggle-switch>*/}
                            </div>
                            <div className="form-group toggle-switch">
                                {/*<toggle-switch className="switch-danger" style="width: 170px"*/}
                                {/*ng-model="ui.dataSelection.matched"*/}
                                {/*knob-label="Template"></toggle-switch>*/}
                            </div>
                            <div className="form-group toggle-switch">
                                {/*<toggle-switch className="switch-primary" style="width: 170px"*/}
                                {/*ng-model="settings.continuum" knob-label="Continuum"></toggle-switch>*/}
                            </div>
                            <div className="form-group toggle-switch">
                                {/*<toggle-switch className="switch-warning" style="width: 170px"*/}
                                {/*ng-model="ui.dataSelection.variance"*/}
                                {/*knob-label="Variance"></toggle-switch>*/}
                            </div>
                            <div className="form-group">
                                <div className="btn-group">
                                    <button className="btn btn-default btn-sm">Reset auto
                                    </button>
                                    <button className="btn btn-default btn-sm">Reset manual
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group input-group-sm smooth-slider-container">
                                    <span className="input-group-addon">Smooth</span>
                                    <input type="text input-sm" className="form-control"/>
                                    <span className="input-group-addon">
                                            <input type="range" className="smooth-slider-input"
                                                   min="0" max="{{bounds.maxSmooth}}"
                                            /></span>
                                </div>
                            </div>
                            <div className="input-group input-group-sm range-toggle-container">
                                <span className="input-group-addon">Range</span>
                                <div className="btn-group">
                                    <button className="btn btn-sm btn-default"></button>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item form-inline">
                            <div className="form-group">
                                <div className="input-group input-group-sm top-results-container">
                                    <span className="input-group-addon">Top Results</span>
                                    <div className="btn-group">
                                        <button className="btn btn-sm btn-default"></button>
                                    </div>
                                    <span className="input-group-btn">
                            <button className="btn btn-block btn-default">Analyse spectra</button>
                        </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group input-group-sm template-container">
                                    <span className="input-group-addon">Template</span>
                                    <select className="form-control template-select" id="templateInput"></select>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-addon offset-span">Offset</span>
                                    <input type="text" className="form-control offset-input" />
                        <span className="input-group-addon offset-span-2" >
                            <input type="range" min="0" max="100" step="1"/>
                        </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group input-group-sm redshift-container">
                                    <span className="input-group-addon">Redshift</span>
                                    <input type="text" id="redshiftInput" className="form-control redshift-input"/>
                                    <span className="input-group-addon redshift-span">
                                            <input type="range"
                                                   min="{{settings.bounds.redshiftMin}}"
                                                   max="{{settings.bounds.redshiftMax}}"
                                                   step="0.0001"
                                            /></span>
                                </div>
                            </div>
                            <button className="form-group btn btn-primary btn-sm inline-block">
                                Perform Fit
                            </button>
                        </li>
                        <li className="list-group-item form-inline">
                            <button className="form-group btn btn-primary btn-sm inline-block">
                            </button>
                            <button className="form-group btn btn-info btn-sm inline-block">
                                Back
                            </button>
                            <button className="form-group btn btn-info btn-sm inline-block">
                                Forward
                            </button>
                            <ul className="form-group list-unstyled list-inline">
                                <li className="sline lined">

                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div id="detailedCanvasParent" className="canvas-container">
                    <canvas id="detailedCanvas"></canvas>
                </div>
            </div>
    )
    }
    }

    export default Detailed