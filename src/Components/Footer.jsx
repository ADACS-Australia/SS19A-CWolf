import React from "react";

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="footer">
                <div className="navbar-inverse footer filler grey-text">
                    <div className="spacing vcenter">
                        <div className="pull-left">
                            <p className="fill-height">Please drop in a FITS file.</p>
                        </div>
                        {/*<div ng-if="!isWaitingDrop()">*/}
                            {/*<div className="pull-left">*/}
                                {/*<p className="fill-height">{{getText()}}</p>*/}
                            {/*</div>*/}
                            {/*<div className="pull-right">*/}
                                {/*<button className="btn btn-small btn-info" style="width: 150px;" ng-if="displayPause()"*/}
                                        {/*ng-click="togglePause()">{{getPausedText()}}</button>*/}
                                {/*<button className="btn btn-small btn-primary" style="width: 150px;"*/}
                                        {/*ng-click="downloadResults()">Download*/}
                                {/*</button>*/}
                            {/*</div>*/}
                            {/*<div className="fill-rest">*/}
                                {/*<progressbar animate="false" className="progress-striped"*/}
                                {/*max="1000" value="getProgressBarValue()"*/}
                                {/*type="{{getProgressBarType()}}"></progressbar>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        )
    }
}

export default Footer