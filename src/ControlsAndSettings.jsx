import React from 'react';

export default class ControlsAndSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let buttonValue = this.props.controls.isAnimationEnabled ? "Stop Animation" : "Start Animation";
        return (
            <React.Fragment>
                <input
                    type="button"
                    value={buttonValue}
                    onClick={this.handleButtonClick.bind(this)}
                />
                <br/>
                <label>
                    Animation Rate:
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={this.props.controls.animationRate}
                        onChange={this.handleAnimationRateChange.bind(this)}
                    />
                </label>
            </React.Fragment>
        );
    }

    handleButtonClick(event) {
        this.props.onChange({
            ...this.props.controls,
            isAnimationEnabled: !this.props.controls.isAnimationEnabled
        });
    }

    handleAnimationRateChange(event) {
        this.props.onChange({
            ...this.props.controls,
            animationRate: Number.parseFloat(event.target.value)
        });
    }
}
