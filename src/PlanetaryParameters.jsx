import React from 'react';
import PropTypes from 'prop-types';
import { PlanetTypes } from './enums.jsx';
import NumberInputField from './Inputs/NumberInputField.jsx';

/**
 * Enumerated type, for each of the planets found in the drop-down menus.
 * You can use these for keys in switch statements or in objects.
 */
const planet = {
    VENUS: 1,
    MARS: 2,
    JUPITER: 3,
    SATURN: 4,
}

/**
 * Predefined data values for the planets.
 */
const planetPresets = {
    [planet.JUPITER]: {
        epicycleSize: 0.19,
        eccentricity: 0.05,
        motionRate: 0.08,
        apogeeAngle: 152.2,
    },
    [planet.VENUS]: {
        epicycleSize: 0.72,
        eccentricity: 0.02,
        motionRate: 1.60,
        apogeeAngle: 46.2,
    },
    [planet.MARS]: {
        epicycleSize: 0.66,
        eccentricity: 0.10,
        motionRate: 0.52,
        apogeeAngle: 106.7,
    },
    [planet.SATURN]: {
        epicycleSize: 0.11,
        eccentricity: 0.06,
        motionRate: 0.03,
        apogeeAngle: 224.2,
    }
}


// This is another way to hold the data.
// But the disadvantage is that its less simple to access.
//
// const planetPresetDataArray = [
//     ['Jupiter', 0.19, 0.05, 0.08, 152.2],
//     ['Venus',   0.72, 0.02, 1.60,  46.2],
//     ['Mars',    0.66, 0.10, 0.52, 106.7],
//     ['Saturn',  0.11, 0.06, 0.03, 224.2],
// ]



/**
 * PlanetaryParameters is a GUI interface that controls the
 * variables used to alter the orbit drawings in the OrbitView.
 */
export default class PlanetaryParameters extends React.Component {
    constructor(props) {
        super(props);
        this.handlePresetSelection = this.handlePresetSelection.bind(this);
        this.handleSingleVariableChange = this.handleSingleVariableChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            epicycleSize: 0.66,
            eccentricity: 0.10,
            motionRate: 0.52,
            apogeeAngle: 106.7,
            planetType: PlanetTypes.SUPERIOR,
        }
    }

    render() {
        return (
            <React.Fragment>
                <h2> Planetary Parameters</h2>
                <PlanetPresetSelection onSubmit={this.handlePresetSelection} />
                <br/>
                <fieldset>
                <legend>Parameters</legend>
                <SingleVariableControl
                    name="epicycleSize"
                    displayName="Epicycle Size"
                    min={0}
                    max={1}
                    step={0.01}
                    decimals={2}
                    value={this.state.epicycleSize}
                    onChange={this.handleSingleVariableChange}
                />
                <br/>
                <SingleVariableControl
                    name="eccentricity"
                    displayName="Eccentricity"
                    min={0.00}
                    max={0.20}
                    step={0.01}
                    decimals={2}
                    value={this.state.eccentricity}
                    onChange={this.handleSingleVariableChange}
                />
                <br/>
                <SingleVariableControl
                    name="motionRate"
                    displayName="Motion Rate"
                    min={0.00}
                    max={4.50}
                    step={0.05}
                    decimals={2}
                    value={this.state.motionRate}
                    onChange={this.handleSingleVariableChange}
                />
                <br/>
                <SingleVariableControl
                    name="apogeeAngle"
                    displayName="Apogee Angle"
                    min={0.0}
                    max={360.0}
                    step={3.6}
                    decimals={1}
                    value={this.state.apogeeAngle}
                    onChange={this.handleSingleVariableChange}
                />
                </fieldset>
                <br/>
                <fieldset>
                    <legend>Planet Type</legend>
                    <label htmlFor="planetTypeRadio1">Superior</label>
                    <input
                        type="radio"
                        name="planetType"
                        id="planetTypeRadio1"
                        value={PlanetTypes.SUPERIOR}
                        onChange={this.handleRadioBoxes.bind(this)}
                    />
                    <br/>
                    <label htmlFor="planetTypeRadio2">Inferior</label>
                    <input
                        type="radio"
                        name="planetType"
                        id="planetTypeRadio2"
                        value={PlanetTypes.INFERIOR}
                        onChange={this.handleRadioBoxes.bind(this)}
                    />
                </fieldset>
            </React.Fragment>
        )
    }

    handlePresetSelection(planetName) {
        let params = planetPresets[planet[planetName]];
        if (params !== undefined) {
            let nextState = {...this.state, ...params};
            this.handleChange(nextState);
            this.setState(nextState);
        }
    }

    handleChange(params) {
        this.props.onChange(params);
    }

    handleSingleVariableChange(key, value) {
        let partialState = {[key]: value};
        this.handleChange({...this.state, ...partialState});
        this.setState(partialState);
    }

    handleRadioBoxes(event) {
        this.handleChange({
            ...this.state,
            [event.target.name]: Number.parseInt(event.target.value)
        });
    }
}

PlanetaryParameters.propTypes = {
    onChange: PropTypes.func,
}



/**
 * A Drop Down Menu interface to select a planet by name. The entries in the
 * menu are automatically created from the planetPresets variable, so that
 * they can that preset data can be modified all in one place.
 */
class PlanetPresetSelection extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: 'none' }
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(this.state.value);
    }

    render() {
        const planetNameArray = Object.keys(planet);
        const planetOptionList = planetNameArray.map((name)=> {
            let displayName = name[0] + name.substr(1).toLowerCase();
            return (
                <option key={name} value={name}>{displayName}</option>
            );
        });
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    PRESETS:
                    <select onChange={this.handleChange}>
                        <option value="none">Select Planet</option>
                        {planetOptionList}
                    </select>
                </label>
                <input type="submit" value="OK" />
            </form>
        );
    }
}

PlanetPresetSelection.propTypes = {
    onSubmit: PropTypes.func,
}


/**
 * A Single Variable Control is a combination of both a number input box and a
 * slider.  It can be used to adjust a single "planetary parameter" at a time.
 * @extends React
 */
class SingleVariableControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const value = Number.parseFloat(this.props.value).toFixed(this.props.decimals);
        return (
            <label>
                {this.props.displayName}:&nbsp;
                <NumberInputField
                    type="number"
                    name={this.props.name}
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    onNewValue={this.handleNewValue.bind(this)}
                    value={this.props.value}
                    decimals={this.props.decimals}
                    />
                <input
                    type="range"
                    name={this.props.name}
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    onChange={this.handleChange.bind(this)}
                    value={value}
                    />
            </label>
        )
    }

    handleNewValue(value) {
        let name = this.props.name;
        value = this.convertEntryToValidNumber(value);
        this.props.onChange(name, value);
    }

    handleChange(event) {
        let name = this.props.name;
        let value = this.convertEntryToValidNumber(event.target.value);
        this.props.onChange(name, value);
    }

    /**
     * Converts string into a number, and ensures that it is within the valid
     * range of numbers, using the "min" and "max" provided by the props passed
     * to this component.
     * @param  {String} value The direct input string from user.
     * @return {Number} The validated number output
     */
    convertEntryToValidNumber(value) {
        let type = typeof(value);
        if (isNaN(value) || type !== 'string' && type !== 'number') {
            return this.props.min;
        }
        value = Number.parseFloat(value);
        value = Math.min(this.props.max, value);
        value = Math.max(this.props.min, value);
        return value;
    }

}

SingleVariableControl.propTypes = {
    name: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number,
    decimals: PropTypes.number,
    onChange: PropTypes.func,
    displayName: PropTypes.string,
}
