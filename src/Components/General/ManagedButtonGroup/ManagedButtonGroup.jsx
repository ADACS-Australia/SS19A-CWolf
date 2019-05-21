import React from "react";
import {ButtonGroup} from "reactstrap";

class ManagedButtonGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.defaultValue || 0
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(e, c, i) {
        this.setState({
            value: i
        });

        if (this.props.onChange)
            this.props.onChange(c.props.value)
    }

    render() {
        const children = this.props.children.map((c, i) => {
            return React.cloneElement(
                c,
                {
                    onClick: (e) => this.onChange(e, c, i),
                    key: i,
                    className: c.props.className + (this.state.value === i ? ' active' : '')
                }
            );
        });
        return (
            <ButtonGroup className='margin-right-4px'>
                {children}
            </ButtonGroup>
        )
    }
}

export default ManagedButtonGroup;