import React from "react";

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="filler light-grey-background">
                <div className="spacing">
                    <div id="sidebar-wrapper">
                        <div id="sidebarDrop">
                            dropzone
                            !(showSave() && ui.sidebarSmall)
                            <div>
                                isWaitingDrop()

                                <h4>getDropText()</h4>
                            </div>
                            <div className="capitalise">
                                !isWaitingDrop()
                                <h4>getTitle()</h4>
                            </div>
                            <span className="btn btn-default btn-file">
                                Browse
                                <input type="file" id="files" name="files[]"/>
                            </span>

                        </div>
                        {/*<div className="top-spacing" ng-if="showSave()">*/}
                        {/*<button className="btn btn-block btn-sm btn-default"*/}
                        {/*ng-click="toggleSmall()">{{getContractButtonLabel()}}</button>*/}
                        {/*</div>*/}
                        {/*<div className="top-spacing" ng-if="ui.merge && !ui.sidebarSmall">*/}
                        {/*<b>Default Redshifter:</b>*/}
                        {/*<div className="btn-group btn-group-justified">*/}
                        {/*<div className="btn-group" ng-repeat="i in ui.mergeInitials">*/}
                        {/*<button className="btn btn-default" btn-radio="$index"*/}
                        {/*ng-click="selectMergeDefault()" ng-model="ui.mergeDefault">*/}
                        {/*<strong>{{i}}</strong></span>*/}
                        {/*</button>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className="top-spacing" ng-if="showTabular()">*/}
                        {/*<b>Display Data As:</b>*/}
                        {/*<div className="btn-group btn-group-justified">*/}
                        {/*<div className="btn-group">*/}
                        {/*<button type="button" className="btn btn-default " ng-click="ui.graphicalLayout=true"*/}
                        {/*ng-className="{active:ui.graphicalLayout}">Graph*/}
                        {/*</button>*/}
                        {/*</div>*/}
                        {/*<div className="btn-group">*/}
                        {/*<button type="button" className="btn btn-default " ng-click="ui.graphicalLayout=false"*/}
                        {/*ng-className="{active:!ui.graphicalLayout}">Table*/}
                        {/*</button>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className="top-spacing" ng-if="showTabular()">*/}
                        {/*<b>Filter Spectra:</b>*/}
                        {/*<select className="input-sm form-control" ng-model="filters['typeFilter']" required*/}
                        {/*ng-options="opt.value as opt.label for opt in types"></select>*/}
                        {/*<select className="input-sm form-control" ng-model="filters['templateFilter']" required*/}
                        {/*ng-options="opt.value as opt.label for opt in temps"></select>*/}
                        {/*<select className="input-sm form-control" ng-model="filters['redshiftFilter']" required*/}
                        {/*ng-options="opt.value as opt.label for opt in redshifts"></select>*/}
                        {/*<select className="input-sm form-control" ng-model="filters['qopFilter']" required*/}
                        {/*ng-options="opt.value as opt.label for opt in qops"></select>*/}
                        {/*</div>*/}
                        {/*<div ng-if="showSave()" className="top-spacing">*/}
                        {/*<b>Save QOP:</b>*/}
                        {/*<button className="btn btn-block btn-sm btn-success" ng-click="saveManual(4)" tooltip="Saved!"*/}
                        {/*tooltip-append-to-body="true" tooltip-trigger="focus"*/}
                        {/*tooltip-placement="right">{{getButtonLabel(4)}}</button>*/}
                        {/*<button className="btn btn-block btn-sm btn-info" ng-click="saveManual(3)" tooltip="Saved!"*/}
                        {/*tooltip-append-to-body="true" tooltip-trigger="focus"*/}
                        {/*tooltip-placement="right">{{getButtonLabel(3)}}</button>*/}
                        {/*<button className="btn btn-block btn-sm btn-warning" ng-click="saveManual(2)" tooltip="Saved!"*/}
                        {/*tooltip-append-to-body="true" tooltip-trigger="focus"*/}
                        {/*tooltip-placement="right">{{getButtonLabel(2)}}</button>*/}
                        {/*<button className="btn btn-block btn-sm btn-danger" ng-click="saveManual(1)" tooltip="Saved!"*/}
                        {/*tooltip-append-to-body="true" tooltip-trigger="focus"*/}
                        {/*tooltip-placement="right">{{getButtonLabel(1)}}</button>*/}
                        {/*<button className="btn btn-block btn-sm btn-primary" ng-click="saveManual(6)" tooltip="Saved!"*/}
                        {/*tooltip-append-to-body="true" tooltip-trigger="focus"*/}
                        {/*tooltip-placement="right">{{getButtonLabel(6)}}</button>*/}
                        {/*<button className="btn btn-block btn-sm btn-default" ng-click="saveManual(0)" tooltip="Saved!"*/}
                        {/*tooltip-append-to-body="true" tooltip-trigger="focus"*/}
                        {/*tooltip-placement="right">{{getButtonLabel(0)}}</button>*/}
                        {/*</div>*/}
                        {/*<div className="top-spacing" ng-if="!showSave() || !ui.sidebarSmall">*/}
                        {/*<b>Stepping options:</b>*/}
                        {/*<div className="checkbox checkbox-info checkbox-circle" style="margin-left: 5px;">*/}
                        {/*<input type="checkbox" id="checkbox1" ng-model="ui.detailed.onlyQOP0">*/}
                        {/*<label for="checkbox1">*/}
                        {/*QOP 0 only*/}
                        {/*</label>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                    </div>
                    {/*<div ng-if="!showSave() || !ui.sidebarSmall" id="sidebar-list" className="top-spacing lined scroll-y"*/}
                    {/*resize="windowResized" ng-style="listStyle()">*/}
                    {/*<div ng-click="setActive(spectra)" ng-dblclick="goToDetailed(spectra)"*/}
                    {/*ng-repeat="spectra in data.spectra" className="left-padding-small spectra-list-item"*/}
                    {/*ng-className="{activeSelect:isActive(spectra)}" ng-class-even="'darker'">*/}
                    {/*<p>*/}
                    {/*<strong className="right-padding-small">{{spectra.id}}</strong>{{getAnalysedText(spectra)}}*/}
                    {/*<span ng-show="spectra.hasRedshift()"*/}
                    {/*className="pull-right label {{spectra.qopLabel}}">{{spectra.qop}}</span>*/}
                    {/*</p>*/}
                    {/*</div>*/}
                    {/*</div>*/}
                </div>
            </div>
        )
    }
}

export default Sidebar