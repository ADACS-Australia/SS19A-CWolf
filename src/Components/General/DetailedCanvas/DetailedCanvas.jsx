import React from "react";
import CanvasRenderer from './renderer'

class DetailedCanvas extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onCanvasEvent = this.onCanvasEvent.bind(this);
    }

    componentDidMount() {
        console.log(this.refs, this.refs.canvas);
        this.renderer = new CanvasRenderer(this.props, this.refs.canvas, this.refs.parent)
    }

    onChange(e, c, i) {
        this.setState({
        });
    }

    onCanvasEvent(e) {
        this.renderer.handleEvent(e)
    }

    render() {
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