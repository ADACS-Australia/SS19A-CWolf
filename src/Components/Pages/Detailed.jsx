import React from "react";

import '../../Assets/css/detailed.scss';
import ToggleButton from "../General/ToggleButton/ToggleButton";
import ManagedToggleButton from "../General/ToggleButton/ManagedToggleButton";
import {Button, Form, FormGroup, ListGroup} from "reactstrap";
import ListGroupItem from "reactstrap/es/ListGroupItem";
import InputGroup from "reactstrap/es/InputGroup";
import InputGroupAddon from "reactstrap/es/InputGroupAddon";
import Input from "reactstrap/es/Input";
import ManagedSliderInput from "../General/SliderInput/ManagedSliderInput";
import ManagedButtonGroup from "../General/ManagedButtonGroup/ManagedButtonGroup";
import Dropdown from "reactstrap/es/Dropdown";
import DetailedCanvas from "../General/DetailedCanvas/DetailedCanvas";

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
                    <ListGroup>
                        <ListGroupItem>
                            <Form inline>
                                {/*<div className="form-group">*/}
                                {/*<div className="input-group input-group-sm">*/}
                                {/*<div className="btn-group">*/}
                                {/*<button className="btn btn-sm btn-default">*/}
                                {/*<strong></strong>*/}
                                {/*<span className="label control-panel-span">*/}
                                {/*</span>*/}
                                {/*</button>*/}
                                {/*</div>*/}
                                {/*</div>*/}
                                {/*</div>*/}

                                <ManagedToggleButton
                                    default={true}
                                    on={"Processed"}
                                    off={"Raw"}
                                    handle={"Data"}
                                    size="xs"
                                    offstyle="secondary"
                                />
                                {/*<toggle-switch className="switch-success" style="width: 170px"*/}
                                {/*ng-model="ui.dataSelection.processed" knob-label="Data"*/}
                                {/*on-label="Processed" off-label="Raw"></toggle-switch>*/}

                                <ManagedToggleButton
                                    default={true}
                                    handle={"Template"}
                                    size="xs"
                                    offstyle="secondary"
                                    onstyle="danger"
                                />
                                {/*<toggle-switch className="switch-danger" style="width: 170px"*/}
                                {/*ng-model="ui.dataSelection.matched"*/}
                                {/*knob-label="Template"></toggle-switch>*/}

                                <ManagedToggleButton
                                    default={true}
                                    handle={"Continuum"}
                                    size="xs"
                                    offstyle="secondary"
                                    onstyle="primary"
                                />
                                {/*<toggle-switch className="switch-primary" style="width: 170px"*/}
                                {/*ng-model="settings.continuum" knob-label="Continuum"></toggle-switch>*/}


                                <ManagedToggleButton
                                    default={false}
                                    handle={"Variance"}
                                    size="xs"
                                    offstyle="secondary"
                                    onstyle="warning"
                                />
                                {/*<toggle-switch className="switch-warning" style="width: 170px"*/}
                                {/*ng-model="ui.dataSelection.variance"*/}
                                {/*knob-label="Variance"></toggle-switch>*/}


                                <ManagedButtonGroup>
                                    <Button color='light' size='sm'>Reset auto</Button>
                                    <Button color='light' size='sm'>Reset manual</Button>
                                </ManagedButtonGroup>

                                <ManagedSliderInput
                                    defaultValue={3}
                                    min={0}
                                    max={7}
                                    width={190}
                                    sliderWidth={60}
                                    label='Smooth'
                                />

                                <InputGroup className='force-inline-layout' size='sm'>
                                    <InputGroupAddon addonType="prepend">
                                        Range
                                    </InputGroupAddon>
                                    <ManagedButtonGroup>
                                        <Button color='light' size='sm'>100</Button>
                                        <Button color='light' size='sm'>99.5</Button>
                                        <Button color='light' size='sm'>99</Button>
                                        <Button color='light' size='sm'>98</Button>
                                    </ManagedButtonGroup>
                                </InputGroup>
                            </Form>

                            {/*<div className="input-group input-group-sm range-toggle-container">*/}
                            {/*<span className="input-group-addon">Range</span>*/}
                            {/*<div className="btn-group">*/}
                            {/*<button className="btn btn-sm btn-default"></button>*/}
                            {/*</div>*/}
                            {/*</div>*/}
                        </ListGroupItem>
                        <ListGroupItem>
                            <Form inline>
                                <FormGroup inline>
                                    <InputGroup
                                        className="force-inline-layout margin-right-4px"
                                        size="sm"
                                    >
                                        <InputGroupAddon addonType="prepend">
                                            Top Results
                                        </InputGroupAddon>
                                        <Button color='light' size='sm'>Analyse spectra</Button>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup inline>
                                    <InputGroup
                                        className="force-inline-layout template-container margin-right-4px"
                                        size="sm"
                                    >
                                        <InputGroupAddon addonType="prepend">
                                            Template
                                        </InputGroupAddon>
                                        <Input type='select'>
                                        </Input>
                                    </InputGroup>
                                </FormGroup>
                                <ManagedSliderInput
                                    defaultValue={0}
                                    min={0}
                                    max={100}
                                    width={225}
                                    sliderWidth={90}
                                    label='Offset'
                                />
                                <ManagedSliderInput
                                    defaultValue={0}
                                    min={0}
                                    max={5}
                                    width={305}
                                    sliderWidth={145}
                                    label='Offset'
                                    step={0.0001}
                                    inputStyle={{
                                        color: 'red',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Button color='primary' size='sm'>Perform Fit</Button>
                            </Form>

                            {/*<div className="form-group">*/}
                            {/*<div className="input-group input-group-sm redshift-container">*/}
                            {/*<span className="input-group-addon">Redshift</span>*/}
                            {/*<input type="text" id="redshiftInput" className="form-control redshift-input"/>*/}
                            {/*<span className="input-group-addon redshift-span">*/}
                            {/*<input type="range"*/}
                            {/*min="{{settings.bounds.redshiftMin}}"*/}
                            {/*max="{{settings.bounds.redshiftMax}}"*/}
                            {/*step="0.0001"*/}
                            {/*/></span>*/}
                            {/*</div>*/}
                            {/*</div>*/}
                            {/*<button className="form-group btn btn-primary btn-sm inline-block">*/}
                            {/*Perform Fit*/}
                            {/*</button>*/}
                            {/*</li>*/}
                            {/*<li className="list-group-item form-inline">*/}
                            {/*<button className="form-group btn btn-primary btn-sm inline-block">*/}
                            {/*</button>*/}
                            {/*<button className="form-group btn btn-info btn-sm inline-block">*/}
                            {/*Back*/}
                            {/*</button>*/}
                            {/*<button className="form-group btn btn-info btn-sm inline-block">*/}
                            {/*Forward*/}
                            {/*</button>*/}
                            {/*<ul className="form-group list-unstyled list-inline">*/}
                            {/*<li className="sline lined">*/}

                            {/*</li>*/}
                            {/*</ul>*/}
                        </ListGroupItem>
                    </ListGroup>
                </div>
                <DetailedCanvas {...this.props}/>
            </div>
        )
    }
}

export default Detailed