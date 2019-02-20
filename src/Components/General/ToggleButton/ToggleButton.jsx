import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import * as util from './utils';
import './toggle-button.scss';

const eitherStringOrInteger = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

export default class ToggleButton extends Component {
    static propTypes = {
        style: PropTypes.shape(),
// Holds the className for label one
        onstyle: PropTypes.string,
// additional className for the on component
        onClassName: PropTypes.string,
// Holds the className for label two
        offstyle: PropTypes.string,
// additional className for the off component
        offClassName: PropTypes.string,
// The className for the handle
        handlestyle: PropTypes.string,
// additional className for the handle component
        handleClassName: PropTypes.string,
// Height prop
        height: eitherStringOrInteger,
// Width prop
        width: eitherStringOrInteger,
// Height prop for entire toggle
        toggleHeight: eitherStringOrInteger,
// Width prop for entire toggle
        toggleWidth: eitherStringOrInteger,
// The on and off elements defaults to 'On' and 'Off'
        on: PropTypes.node,
        off: PropTypes.node,
        handle: PropTypes.node,
// The initial state of the component
        active: PropTypes.bool,
// Sets the button to disabled
        disabled: PropTypes.bool,
// Set the size of the button defaults to normal
        size: PropTypes.string,
// The onClick event, returns the state as the argument
        onClick: PropTypes.func,
        className: PropTypes.string,
// If the toggle should recalculate it's dimensions when visibility or dimensions change
        recalculateOnResize: PropTypes.bool,
    };

    static defaultProps = {
        onstyle: 'success',
        onClassName: '',
        offstyle: 'default',
        offClassName: '',
        handlestyle: 'default',
        handleClassName: '',
        width: '',
        height: '',
        on: 'On',
        off: 'Off',
        handle: null,
        disabled: false,
        size: 'normal',
        active: true,
        style: {},
        recalculateOnResize: false,
    };

    constructor() {
        super();
        this.state = {width: null, height: null};
        this.resizeObserver = null;
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount() {
        if (this.props.width && this.props.height) {
            return;
        }
        this.setDimensions();
        if (this.props.recalculateOnResize) {
            this.resizeObserver = new ResizeObserver((ent, obs) => {
                this.setDimensions();
            });
            this.resizeObserver.observe(this.parent);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.width && this.props.height) {
            return;
        }
        this.setDimensions();
    }

    componentWillUnmount() {
// shutdown listener
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.parent);
        }
    }

    onClick(evt) {
        if (this.props.disabled) return;
        if (typeof this.props.onClick === 'function') {
            this.props.onClick(!this.props.active, this.parent, evt);
        }
    }

    setDimensions() {
        if (this.handle) {
            const onDim = util.getDimension(this.on);
            const offDim = util.getDimension(this.off);

            const handleDim = util.getDimension(this.handle);

            const toggleWidth = Math.max(onDim.width + handleDim.width, offDim.width + handleDim.width);
            const toggleHeight = Math.max(onDim.height, offDim.height, handleDim.height);

            const width = Math.max(onDim.width, offDim.width);
            const height = Math.max(onDim.height, offDim.height);

// Check if the sizes are the same with a margin of error of one pixel
            const areAlmostTheSame = (
                util.compareWithMarginOfError(this.state.width, width, this.props.width) &&
                util.compareWithMarginOfError(this.state.height, height, this.props.height) &&
                util.compareWithMarginOfError(this.state.toggleWidth, toggleWidth, this.props.toggleWidth) &&
                util.compareWithMarginOfError(this.state.toggleHeight, toggleHeight, this.props.toggleHeight)
            );

// if they are the same then return
            if (areAlmostTheSame) {
                return;
            }

            this.setState({
                width: this.props.width || width,
                height: this.props.height || height,
                toggleHeight: this.props.toggleHeight || toggleHeight,
                toggleWidth: this.props.toggleWidth || toggleWidth
            });
        } else {
            const onDim = util.getDimension(this.on);
            const offDim = util.getDimension(this.off);

            const width = Math.max(onDim.width, offDim.width);
            const height = Math.max(onDim.height, offDim.height);

// Check if the sizes are the same with a margin of error of one pixel
            const areAlmostTheSame = (
                util.compareWithMarginOfError(this.state.width, width, this.props.width) &&
                util.compareWithMarginOfError(this.state.height, height, this.props.height)
            );

// if they are the same then return
            if (areAlmostTheSame) {
                return;
            }

            this.setState({
                width: this.props.width || width,
                height: this.props.height || height
            });
        }
    }

    getSizeClass() {
        if (this.props.size === 'lg') return 'btn-lg';
        if (this.props.size === 'sm') return 'btn-sm';
        if (this.props.size === 'xs') return 'btn-xs';
        return 'btn-md';
    }

    render() {
        const {
            active,
            onClick,
            onstyle,
            onClassName,
            offstyle,
            offClassName,
            handlestyle,
            handleClassName,
            style,
            on,
            off,
            handle,
            className,
            disabled,
            width,
            height,
            toggleWidth,
            toggleHeight,
            recalculateOnResize,
            ...props
        } = this.props;

        const sizeClass = this.getSizeClass();

        const s = {
            buttonWidth: this.state.width || width,
            buttonHeight: this.state.height || height,
            toggleWidth: this.state.toggleWidth || toggleWidth,
            toggleHeight: this.state.toggleHeight || toggleHeight,
        };

        return (
// eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
                role="button"
                disabled={disabled}
                className={cn('btn', 'toggle', 'margin-right-4px', className, sizeClass, {
                    [`off btn-${offstyle}`]: !this.props.active,
                    [`btn-${onstyle}`]: this.props.active,
                })}
                onClick={this.onClick}
                style={Object.assign(
                    {},
                    {
                        height: s.toggleHeight,
                        width: s.toggleWidth
                    },
                    style)
                }
                {...props}
                ref={(c) => {
                    this.parent = c;
                }}
            >
                <div
                    className="toggle-group"
                    style={Object.assign(
                        {},
                        {
                            left: this.props.active ? null : -s.buttonWidth
                        },
                        style)
                    }
                >
                    <span
                        ref={(onLabel) => {
                            this.on = onLabel;
                        }}
                        className={cn(
                            'btn toggle-on',
                            sizeClass,
                            onClassName, {
                                [`btn-${onstyle}`]: onstyle,
                            })}
                        disabled={disabled}
                        style={Object.assign({},
                            {
                                height: s.buttonHeight,
                                width: s.buttonWidth,
                            },
                            style)
                        }
                    >
                    {on}
                    </span>
                        {
                            handle ? (
                                <span
                                    className={`toggle-handle btn btn-light ${sizeClass}`}
                                    style={{
                                        left: s.buttonWidth,
                                    }}
                                    ref={(handleLabel) => {
                                        this.handle = handleLabel;
                                    }}
                                >
                                    {handle}
                                </span>
                            ) : null
                        }
                    <span
                        ref={(offLabel) => {
                            this.off = offLabel;
                        }}
                        style={Object.assign({},
                            {
                                height: s.buttonHeight,
                                width: s.buttonWidth,
                            }, style)}
                        className={cn(
                            'btn toggle-off',
                            sizeClass,
                            offClassName, {
                                [`btn-${offstyle}`]: offstyle,
                            })}
                        disabled={disabled}
                    >
                        {off}
                    </span>
                </div>
            </div>
        );
    }
}