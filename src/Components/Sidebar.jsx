import React from "react";
import Dropzone from "react-dropzone";

import styled from 'styled-components';
import {addFiles} from "../Stores/Data/Actions";
import {Button, ButtonGroup} from "reactstrap";
import {setGraphicalLayout, toggleSmallSidebar} from "../Stores/UI/Actions";
import {isDetailed, isOverview, isSmall} from "../Utils/dry_helpers";
import ManagedButtonGroup from "./General/ManagedButtonGroup/ManagedButtonGroup";
import * as Enumerable from "linq";

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
        addFiles(acceptedFiles);
    }

    getContractButtonLabel() {
        return this.props.ui.sidebarSmall ? ">>" : "Contract sidebar";
    };

    isWaitingDrop() {
        // If there is no spectra loaded, we are waiting for a file drop
        return !this.props.data.processorService.spectraManager.hasSpectra();
    };

    getTitle() {
        // Get the current title for the loaded fits file
        return this.props.data.fitsFileName;
    }

    render() {
        return (
            <div className="filler light-grey-background">
                <div className="spacing">
                    <div id="sidebar-wrapper">
                        {/* Render the file dropper */}
                        {!isSmall(this.props) ? (
                            <Dropzone onDrop={this.onDrop}>
                                {({getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles}) => {
                                    return (
                                        <Container
                                            isDragActive={isDragActive}
                                            isDragReject={isDragReject}
                                            {...getRootProps()}
                                        >
                                            <input {...getInputProps()} />
                                            {this.isWaitingDrop() ? (
                                                <h4 className="file-drop-h5">{isDragAccept ? 'Drop' : 'Drag'} a FITs
                                                    file or
                                                    a
                                                    results file. Or drop a results file and THEN a FITs file.</h4>
                                            ) : (
                                                <h4 className="file-drop-h5 capitalise">
                                                    {this.getTitle()}
                                                </h4>
                                            )}
                                            <span className="btn btn-light btn-file">
                                            Browse <input {...getInputProps()}/>
                                        </span>
                                        </Container>
                                    )
                                }}
                            </Dropzone>) : null
                        }

                        {/* Render the contract sidebar button if we're on the detailed page*/}
                        {isDetailed(this.props) ? (
                            <div className="top-spacing">
                                <Button block color="light" size="small" onClick={() => toggleSmallSidebar()}>
                                    {this.getContractButtonLabel()}
                                </Button>
                            </div>) : null
                        }

                        {/* Render the default redshift selection */}
                        <p>TODO: Merge Redshifter</p>
                        {this.props.ui.merge && !this.props.ui.sidebarSmall ? (
                            <div className="top-spacing">
                                <b>Default Redshifter:</b>
                                <ManagedButtonGroup
                                    className="d-flex"
                                >
                                    {Enumerable.from(this.props.ui.mergeInitials).select(e => {
                                        return (
                                            <Button>

                                            </Button>
                                        )
                                    }).toArray()}
                                </ManagedButtonGroup>
                            </div>
                        ) : null}

                        {/* Render the Graph/Table buttons if we're on the overview page */}
                        {isOverview(this.props) ? (
                            <div className="top-spacing">
                                <b>Display Data As:</b>
                                <ManagedButtonGroup
                                    className="d-flex"
                                    onChange={v => setGraphicalLayout(v)}
                                    value={this.props.ui.graphicalLayout}
                                >
                                    <Button color="light" className="w-100" value={true}>
                                        Graph
                                    </Button>
                                    <Button color="light" className="w-100" value={false}>
                                        Table
                                    </Button>
                                </ManagedButtonGroup>
                            </div>) : null
                        }

                        {isOverview(this.props) ? (
                            <div className="top-spacing">
                                <b>Filter Spectra:</b>
                                <select className="input-sm form-control" required>
                                    {
                                        Enumerable.from(this.props.sidebar.types).select(e => {
                                            return (<option value={e.value} key={e.value}>{e.label}</option>)
                                        }).toArray()
                                    }
                                </select>
                                <select className="input-sm form-control" required>
                                    {
                                        Enumerable.from(this.props.sidebar.temps).select(e => {
                                            return (<option value={e.value} key={e.value}>{e.label}</option>)
                                        }).toArray()
                                    }
                                </select>
                                <select className="input-sm form-control" required>
                                    {
                                        Enumerable.from(this.props.sidebar.redshifts).select(e => {
                                            return (<option value={e.value} key={e.value}>{e.label}</option>)
                                        }).toArray()
                                    }
                                </select>
                                <select className="input-sm form-control">
                                    {
                                        Enumerable.from(this.props.sidebar.qops).select(e => {
                                            return (<option value={e.value} key={e.value}>{e.label}</option>)
                                        }).toArray()
                                    }
                                </select>
                            </div>) : null
                        }
                    </div>
                    {
                        !isDetailed(this.props) ? (
                            <div className="top-spacing">
                                <b>Save QOP:</b>
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
                            </div>
                        ) : null
                    }
                    {!isDetailed(this.props) || !this.props.ui.sidebarSmall ? (
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
                    ) : null}
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