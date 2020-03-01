import React from 'react';
import { PlanetTypes } from './enums.jsx';
import PlanetaryParameters from './PlanetaryParameters.jsx';

export default class PtolemaicSystemSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            planetaryParameters: {
                epicycleSize: 0.66,
                eccentricity: 0.10,
                motionRate: 0.52,
                apogeeAngle: 106.7,
                planetType: PlanetTypes.SUPERIOR,
            },
            controls: {
                animationRate: 0.2,
                showDeferent: true,
                showEpicycle: true,
                showPlanetVector: false,
                showEquantVector: false,
                showEarthSunLine: false,
                showEpicyclePlanetLine: false,
                pathDuration: 0.2
            }
        }
    }

    render() {
        const debugStateString = JSON.stringify(this.state, null, '\t');
        return (
            <React.Fragment>
                <h1>PtolemaicSystemSimulator</h1>
                <pre>PtolemaicSystemSimulator.state = {debugStateString}</pre>
                <h2> Planetary Parameters</h2>
                <PlanetaryParameters
                    onChange={this.handleNewPlantearyParameters.bind(this)}
                    />
            </React.Fragment>
        );
    }

    handleNewPlantearyParameters(newParams) {
        this.setState({planetaryParameters: newParams});
    }
}
