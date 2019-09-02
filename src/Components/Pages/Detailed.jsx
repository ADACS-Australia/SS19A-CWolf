import React from "react";

import '../../Assets/css/detailed.scss';
import ManagedToggleButton from "../General/ToggleButton/ManagedToggleButton";
import {Button, ButtonGroup, Form, FormGroup, ListGroup} from "reactstrap";
import ListGroupItem from "reactstrap/es/ListGroupItem";
import InputGroup from "reactstrap/es/InputGroup";
import InputGroupAddon from "reactstrap/es/InputGroupAddon";
import Input from "reactstrap/es/Input";
import ManagedSliderInput from "../General/SliderInput/ManagedSliderInput";
import ManagedButtonGroup from "../General/ManagedButtonGroup/ManagedButtonGroup";
import DetailedCanvas from "../General/DetailedCanvas/DetailedCanvas";
import {spectraLineService} from "../General/DetailedCanvas/spectralLines";
import * as Enumerable from "linq";
import {
    clickSpectralLine,
    nextSpectralLine, performFit,
    previousSpectralLine,
    resetToAutomatic, resetToManual, selectMatch, setContinuum,
    setProcessed, setRangeIndex, setSmooth, setTemplateId, setTemplateMatched,
    setVariance, toggleSpectralLines,
    updateRedShift,
    updateTemplateOffset
} from "../../Stores/UI/Actions";
import {templateManager} from "../../Lib/TemplateManager";

const boldItems = Enumerable.from(['O2', 'Hb', 'Ha']);

class Detailed extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="detailedView filler">
                <div className="panel panel-default detailed-control panel-header">
                    <div className="panel-heading">
                        <strong>ID</strong> {this.props.ui.active ? this.props.ui.active.id : ""}
                        <strong>NAME</strong> {this.props.ui.active ? this.props.ui.active.name : ""}
                        {
                            // todo
                            (<strong>AutoQOP</strong>)
                        }
                        <h4 className="auto-qop">
                            <span className=""></span></h4>
                        <strong>QOP</strong>
                        <h4 className="qop-h4">
                            <span
                                className={"label " + (this.props.ui.active ? this.props.ui.active.qopLabel : "")}
                            >
                                {this.getQOPText()}
                            </span>
                        </h4>
                        {/*todo*/}
                        <strong>COMMENT</strong>
                        <input type="text"
                               className="input-sm comment-input"
                               placeholder="Enter a comment"/>
                        <strong>RA</strong> {this.props.ui.active ? this.props.ui.active.getRA().toFixed(3) : ""}
                        <strong>DEC</strong> {this.props.ui.active ? this.props.ui.active.getDEC().toFixed(3) : ""}
                        <strong>MAG</strong> {this.props.ui.active ? this.props.ui.active.magnitude.toFixed(2) : ""}
                        <strong>TYPE</strong> {this.props.ui.active ? this.props.ui.active.type : ""}
                    </div>
                    <ListGroup>
                        <ListGroupItem>
                            <Form inline>
                                {/*todo: merges*/}
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
                                    default={this.props.ui.dataSelection.processed}
                                    on={"Processed"}
                                    off={"Raw"}
                                    handle={"Data"}
                                    size="xs"
                                    offstyle="secondary"
                                    onToggle={(toggled) => {
                                        setProcessed(toggled)
                                    }}
                                />
                                <ManagedToggleButton
                                    default={this.props.ui.dataSelection.matched}
                                    handle={"Template"}
                                    size="xs"
                                    offstyle="secondary"
                                    onstyle="danger"
                                    onToggle={(toggled) => setTemplateMatched(toggled)}
                                />

                                <ManagedToggleButton
                                    default={this.props.ui.detailed.continuum}
                                    handle={"Continuum"}
                                    size="xs"
                                    offstyle="secondary"
                                    onstyle="primary"
                                    onToggle={(toggled) => setContinuum(toggled)}
                                />

                                <ManagedToggleButton
                                    default={this.props.ui.dataSelection.variance}
                                    handle={"Variance"}
                                    size="xs"
                                    offstyle="secondary"
                                    onstyle="warning"
                                    onToggle={(toggled) => {
                                        setVariance(toggled)
                                    }}
                                />

                                <ButtonGroup className='margin-right-4px'>
                                    <Button color='light' size='sm' onClick={() => resetToAutomatic()}>Reset auto</Button>
                                    <Button color='light' size='sm' onClick={() => resetToManual()}>Reset manual</Button>
                                </ButtonGroup>

                                <ManagedSliderInput
                                    defaultValue={this.props.ui.detailed.smooth}
                                    min={0}
                                    max={this.props.ui.detailed.bounds.maxSmooth}
                                    width={190}
                                    sliderWidth={60}
                                    label='Smooth'
                                    onChange={(value) => setSmooth(value)}
                                />
                                <InputGroup className='force-inline-layout' size='sm'>
                                    <InputGroupAddon addonType="prepend">
                                        Range
                                    </InputGroupAddon>
                                    <ButtonGroup>
                                        {
                                            Enumerable.from(this.props.ui.detailed.ranges).select((e, i) => {
                                                return (
                                                    <Button
                                                        color='light'
                                                        size='sm'
                                                        onClick={() => setRangeIndex(i)}
                                                        key={i}
                                                        active={this.props.ui.detailed.rangeIndex === i}
                                                    >
                                                        {e}
                                                    </Button>
                                                )
                                            }).toArray()
                                        }
                                    </ButtonGroup>
                                </InputGroup>
                            </Form>
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
                                        {
                                            this.props.ui.active && this.props.ui.active.hasMatches() ? (
                                                <ManagedButtonGroup onChange={(match) => selectMatch(match)}>
                                                    {
                                                        Enumerable.from(this.props.ui.active.getMatches(
                                                            this.props.ui.detailed.bounds.maxMatches
                                                        )).select((e, i) => {
                                                            return (
                                                                <Button
                                                                    size="sm"
                                                                    key={i}
                                                                    value={e}
                                                                >
                                                                    {i + 1}
                                                                </Button>
                                                            )
                                                        }).toArray()
                                                    }
                                                </ManagedButtonGroup>
                                            ) : null
                                        }
                                        {
                                            !this.props.ui.active || this.props.ui.active.getNumBestResults() === 0 ? (
                                                <Button
                                                    color='light'
                                                    size='sm'
                                                    onClick={() => {
                                                        if (this.props.ui.active)
                                                            this.props.data.processorService.addToPriorityQueue(
                                                                this.props.ui.active,
                                                                true
                                                            )
                                                    }}
                                                >
                                                    Analyse spectra
                                                </Button>
                                            ) : null
                                        }
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
                                        <Input
                                            type='select'
                                            onChange={(e) => setTemplateId(e.target.value)}
                                            value={this.props.ui.detailed.templateId}
                                        >
                                            {
                                                (() => {
                                                    const data = [{id: '0', name: "Select a template"}];
                                                    Enumerable.from(templateManager.getTemplates()).forEach(e => {
                                                        data.push({id: e.id, name: e.name});
                                                    });
                                                    // return data;
                                                    return Enumerable.from(data).select((e, i) => {
                                                        return (<option key={i} value={e.id}>{e.id + ' - ' + e.name}</option>)
                                                    }).toArray()
                                                })()
                                            }
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
                                    onChange={value => updateTemplateOffset(value)}
                                />
                                <ManagedSliderInput
                                    value={this.props.ui.detailed.redshift}
                                    min={0}
                                    max={5}
                                    width={305}
                                    sliderWidth={145}
                                    label='Redshift'
                                    step={0.0001}
                                    inputStyle={{
                                        color: 'red',
                                        fontWeight: 'bold'
                                    }}
                                    onChange={value => updateRedShift(value)}
                                />
                                <Button
                                    color='primary'
                                    size='sm'
                                    onClick={() => {
                                       performFit()
                                    }}
                                >
                                    Perform Fit
                                </Button>
                            </Form>
                        </ListGroupItem>
                        <ListGroupItem>
                            <Form inline>
                                <Button color='primary' size='sm' onClick={() => toggleSpectralLines()}>
                                    {
                                        this.props.ui.detailed.spectralLines ? "Hide" : "Show"
                                    }
                                </Button>
                                <Button size='sm' onClick={() => previousSpectralLine()}>Back</Button>
                                <Button size='sm' onClick={() => nextSpectralLine()}>Forward</Button>
                                <ul className="list-unstyled list-inline">
                                    {
                                        Enumerable.from(spectraLineService.getAll()).select(
                                            (l, i) => {
                                                return (
                                                    <li
                                                        className={"sline lined " + (boldItems.contains(l.id) ? "bold" : "")}
                                                        key={l.id}
                                                        onClick={() => clickSpectralLine(l.id)}
                                                    >
                                                        {l.label}
                                                    </li>
                                                )
                                            }
                                        ).toArray()
                                    }
                                </ul>
                            </Form>
                        </ListGroupItem>
                    </ListGroup>
                </div>
                <DetailedCanvas {...this.props}/>
            </div>
        )
    }

    getQOPText() {
        const s = this.props.ui.active;
        if (s && s.qop != null && s.getFinalRedshift()) {
            return s.qop + " at " + s.getFinalRedshift();
        } else {
            return "";
        }
    }
}

export default Detailed