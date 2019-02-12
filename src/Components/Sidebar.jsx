import React from "react";
import Dropzone from "react-dropzone";

import styled from 'styled-components';

const getColor = (props) => {
    if (props.isDragReject) {
        return '#c66';
    }
    if (props.isDragActive) {
        return '#5E99FF';
    }
    return '#bbb';
};

const Container = styled.div`
  padding: 10px;
  width: 100%;
  border-width: 4px;
  border-radius: 5px;
  border-color: ${props => getColor(props)};
  border-style: ${props => props.isDragReject || props.isDragActive ? 'solid' : 'dashed'};
  background-color: ${props => props.isDragReject || props.isDragActive ? '#eee' : ''};
  text-align: center;
`;

class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.onDrop.bind(this)
    }

    onDrop(acceptedFiles, rejectedFiles) {
        // Do something with files
        console.log(acceptedFiles, rejectedFiles)
    }

    render() {
        return (
            <div className="filler light-grey-background">
                <div className="spacing">
                    <div id="sidebar-wrapper">
                        <Dropzone onDrop={Sidebar.onDrop}>
                            {({getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles}) => {
                                return (
                                    <Container
                                        isDragActive={isDragActive}
                                        isDragReject={isDragReject}
                                        {...getRootProps()}
                                    >
                                        <input {...getInputProps()} />
                                        <h4 className="file-drop-h5">{isDragAccept ? 'Drop' : 'Drag'} a FITs file or a
                                            results file. Or drop a results file and THEN a FITs file.</h4>
                                        <span className="btn btn-light btn-file">
                                            Browse <input {...getInputProps()}/>
                                        </span>
                                    </Container>
                                )
                            }}
                        </Dropzone>
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
                        <div className="top-spacing">
                            <b>Display Data As:</b>
                            <div className="btn-group btn-group-justified">
                                <div className="btn-group">
                                    <button type="button" className="btn btn-light">
                                        Graph
                                    </button>
                                </div>
                                <div className="btn-group">
                                    <button type="button" className="btn btn-light">
                                        Table
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/*<div className="top-spacing" ng-if="showTabular()">*/}
                        <b>Filter Spectra:</b>
                        <select className="input-sm form-control" required></select>
                        <select className="input-sm form-control" required></select>
                        <select className="input-sm form-control" required></select>
                        <select className="input-sm form-control" required></select>
                    </div>
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
                    <div className="top-spacing">
                        <b>Stepping options:</b>
                        <div className="checkbox checkbox-info checkbox-circle">
                            <input type="checkbox" id="checkbox1"/>
                                <label>
                                    QOP 0 only
                                </label>
                        </div>
                        {/*</div>*/}
                    </div>
                    <div id="sidebar-list" className="top-spacing lined scroll-y">
                        todo
                        {/*<div className="left-padding-small spectra-list-item">*/}
                            {/*<p>*/}
                                {/*<strong className="right-padding-small">{{*/}
                                    {/*spectra*/}
                                    {/*.id*/}
                                {/*}}</strong>{{getAnalysedText(spectra)}}*/}
                                {/*<span ng-show="spectra.hasRedshift()"*/}
                                      {/*className="pull-right label {{spectra.qopLabel}}">{{spectra.qop}}</span>*/}
                            {/*</p>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
    )
    }
    }

    export default Sidebar