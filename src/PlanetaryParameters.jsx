import React from 'react';
import PropTypes from 'prop-types';
import { PlanetTypes } from './enums.jsx';

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
        name: "Jupiter",
        epicycleSize: 0.19,
        eccentricity: 0.05,
        motionRate: 0.08,
        apogeeAngle: 152.2,
    },
    [planet.VENUS]: {
        name: "Venus",
        epicycleSize: 0.72,
        eccentricity: 0.02,
        motionRate: 1.60,
        apogeeAngle: 46.2,
    },
    [planet.MARS]: {
        name: "Mars",
        epicycleSize: 0.66,
        eccentricity: 0.10,
        motionRate: 0.52,
        apogeeAngle: 106.7,
    },
    [planet.SATURN]: {
        name: "Saturn",
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
                <PlanetPresetSelection onSubmit={this.handlePresetSelection} />
                <SingleVariableControl
                    name="epicycleSize"
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.state.epicycleSize}
                    onChange={this.handleSingleVariableChange} />
                <br/>
                <SingleVariableControl
                    name="eccentricity"
                    min={0.00}
                    max={0.20}
                    step={0.01}
                    value={this.state.eccentricity}
                    onChange={this.handleSingleVariableChange} />
                <br/>
                <SingleVariableControl
                    name="motionRate"
                    min={0.01}
                    max={4.50}
                    step={0.04}
                    value={this.state.motionRate}
                    onChange={this.handleSingleVariableChange} />
                <br/>
                <SingleVariableControl
                    name="apogeeAngle"
                    min={0.0}
                    max={360.0}
                    step={3.2}
                    value={this.state.apogeeAngle}
                    onChange={this.handleSingleVariableChange} />
                <br/>
            </React.Fragment>
        )
    }

    handlePresetSelection(planetName) {
        let params = planetPresets[planet[planetName]];
        if (params !== undefined) {
            this.setState(params)
            this.handleChange(params);
        }
    }

    handleChange(params) {
        this.props.onChange(params);
    }

    handleSingleVariableChange(event) {
        this.setState({[event.target.name]: event.target.value});
        this.handleChange(this.state);
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
            return <option key={name} value={name}>{displayName}</option>
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
 * This controller does not maintain it's own state in any way, but it can help
 * to avoid duplication of the text/slider combination.
 * @extends React
 */
class SingleVariableControl extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <label>
                {this.props.name}:
                <input
                    type="number"
                    name={this.props.name}
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    onChange={this.props.onChange}
                    value={this.props.value}
                    />
                <input
                    type="range"
                    name={this.props.name}
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    onChange={this.props.onChange}
                    value={this.props.value}
                    />
            </label>
        )
    }
}

SingleVariableControl.propTypes = {
    name: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
}
