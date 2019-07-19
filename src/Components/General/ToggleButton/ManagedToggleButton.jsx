import React from "react";
import ToggleButton from "./ToggleButton";

class ManagedToggleButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = { toggleActive: this.props.default || false };
        this.onToggle = this.onToggle.bind(this);
    }

    onToggle() {
        const new_state = this.props.value !== undefined ? !this.props.value : !this.state.toggleActive;

        // Check if the toggle callback is set
        if (this.props.onToggle)
            // Call the toggle callback with the current state
            this.props.onToggle(new_state);

        this.setState({ toggleActive:  new_state});
    }

    render() {
        return (
            <ToggleButton
                onClick={this.onToggle}
                active={this.props.value !== undefined ? this.props.value : this.state.toggleActive}
                {...this.props}
            />
            )
    }
}

export default ManagedToggleButton;