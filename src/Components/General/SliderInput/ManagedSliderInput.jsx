import {FormGroup, Input, InputGroup, InputGroupAddon} from "reactstrap";
import React from "react";

import './slider-input.scss'

class ManagedSliderInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.defaultValue || this.props.min || 0
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.setState({
            value: e.target.value
        });

        // Check if there is a callback and trigger it
        if (this.props.onChange)
            this.props.onChange(e.target.value);
    }

    render() {
        return (
            <FormGroup inline>
                <InputGroup
                    className="margin-right-4px force-inline-layout"
                    style={{
                        width: this.props.width ? this.props.width + 'px' : null
                    }}
                    size="sm"
                >
                    <InputGroupAddon addonType="prepend">
                        {this.props.label}
                    </InputGroupAddon>
                    <Input
                        type="number"
                        bsSize="xs"
                        min={this.props.min}
                        max={this.props.max}
                        value={this.props.value || this.state.value}
                        onChange={this.onChange}
                        step={this.props.step}
                        style={{
                            width: this.props.inputWidth ? this.props.inputWidth + 'px' : null,
                            ...this.props.inputStyle
                        }}
                    />
                    <InputGroupAddon addonType="append" className='managed-slider-input-container'>
                        <Input
                            type="range"
                            className="managed-slider-slider"
                            bsSize="xs"
                            min={this.props.min}
                            max={this.props.max}
                            style={{
                                width: this.props.sliderWidth ? this.props.sliderWidth + 'px' : null,
                                ...this.props.sliderStyle
                            }}
                            step={this.props.step}
                            value={this.props.value || this.state.value}
                            onChange={this.onChange}
                        />
                    </InputGroupAddon>
                </InputGroup>
            </FormGroup>
        )
    }
}

export default ManagedSliderInput;