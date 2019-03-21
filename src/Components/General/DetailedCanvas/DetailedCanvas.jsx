import React from "react";
import CanvasRenderer from './renderer'

class DetailedCanvas extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onCanvasEvent = this.onCanvasEvent.bind(this);
    }

    componentDidMount() {
        this.renderer = new CanvasRenderer(this.refs.canvas, this.refs.parent, this.props);
        this.renderer.update(this.props);
    }

    onChange(e, c, i) {
        this.setState({
        });
    }

    onCanvasEvent(e) {
        this.renderer.handleEvent(e)
    }

    render() {
        // Check if the renderer has been initialised yet
        if (this.renderer)
            // Yes it has, so render the canvas
            this.renderer.update(this.props);

        return (
            <div ref='parent' id="detailedCanvasParent" className="canvas-container">
                <canvas
                    ref='canvas'
                    id="detailedCanvas"
                    onMouseDown={this.onCanvasEvent}
                    onMouseUp={this.onCanvasEvent}
                    onMouseMove={this.onCanvasEvent}
                    onTouchStart={this.onCanvasEvent}
                    onTouchEnd={this.onCanvasEvent}
                    onTouchMove={this.onCanvasEvent}
                    onWheel={this.onCanvasEvent}
                />
            </div>
        )
    }
}

export default DetailedCanvas;