import React from 'react';
import PropTypes from 'prop-types';

/**
 * The Number Input Field is a component based on the <input type="number">
 * element, but is wrapped in a <form> element so that you can type in
 * the number before triggering changes.  The callback function prop is:
 *
 *      onNewValue(value)
 *
 * where "value" is the freshly submitted number.
 */
export default class NumberInputField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            hasFocus: false
        };
    }

    render() {
        let value;
        if (this.state.hasFocus === true) {
            value = this.state.value
        } else {
            value = this.padDecimals(this.props.value);
        }
        return (
            <form
                onSubmit={this.handleSubmit.bind(this)}
                style={{display: "inline-block"}}
                >
                <input
                    type="number"
                    name="numberInput"
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    onChange={this.handleChange.bind(this)}
                    onFocus={this.handleFocus.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    value={value}
                    />
            </form>
        );
    }

    handleFocus() {
        this.setState({
            hasFocus: true,
            value: this.props.value
        });
    }

    handleBlur() {
        this.setState({
            hasFocus: false,
            value: this.props.value,
        });
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        let value = event.target.numberInput.value;
        if (value === "") {
            return;
        }
        value = this.padDecimals(value);
        this.props.onNewValue(value);
    }

    padDecimals(number) {
        return Number.parseFloat(number).toFixed(this.props.decimals);
    }
}

NumberInputField.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number,
    decimals: PropTypes.number,
    onNewValue: PropTypes.func,
}
