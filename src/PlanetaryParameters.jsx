import React from 'react';

/**
 * Enumeration type, for each of the planets found in the drop-down menus.
 * You can use these for keys in switch statements or in objects.
 * @type {Object}
 */
const planet = {
    VENUS: 1,
    MARS: 2,
    JUPITER: 3,
    SATURN: 4,
}

/**
 * Preset values for the dropdown menu. The keys are the planet enums.
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


// This might be a cleaner way to hold the data.
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
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            params: {
                epicycleSize: 0.66,
                eccentricity: 0.10,
                motionRate: 0.52,
                apogeeAngle: 106.7,
            },
            valueFromDropDownMenu: "none"
        }
    }

    render() {
        let planetVal = this.state.valueFromDropDownMenu;
        return (
            <React.Fragment>
                <PlanetPresetSelection onSubmit={this.handlePresetSelection} />
                <SingleVariableControl name="epicycleSize" /> <br />
                <SingleVariableControl name="eccentricity" /> <br />
                <SingleVariableControl name="motionRate" /> <br />
                <SingleVariableControl name="apogeeAngle" /> <br />
                <p> Currently Selected Value: {planetVal} </p>
            </React.Fragment>
        )
    }

    handlePresetSelection(planetName) {
        this.setState({valueFromDropDownMenu: planetName});
        let params = planetPresets[planet[planetName]];
        if (params !== undefined) {
            this.handleChange(params);
        }
    }

    handleChange(params) {
        this.props.onChange(params);
    }
}



/**
 * A Drop Down Menu interface to select a planet by name.
 * This component is based on the "FlavorForm" example found at:
 *      https://reactjs.org/docs/forms.html
 * and uses the "Lists and Keys" technique found at:
 *      https://reactjs.org/docs/lists-and-keys.html
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
        return (
            <React.Fragment>
                {this.props.name}:
                <input
                    type="number"
                    />
                <input
                    type="range"
                    min="1"
                    max="100"
                    />
            </React.Fragment>
        )
    }
}
