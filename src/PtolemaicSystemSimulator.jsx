import React from 'react';
import { PlanetTypes } from './enums.jsx';
import OrbitView from './OrbitView.jsx';
import PlanetaryParameters from './PlanetaryParameters.jsx';
import ControlsAndSettings from './ControlsAndSettings.jsx';

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
                isAnimationEnabled: false,
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

                <div className="wrapper">
                    <div className="box">
                        <OrbitView
                            className = "OrbitView"
                            planetaryParameters={this.state.planetaryParameters}
                            controls={this.state.controls}
                        />
                    </div>
                    <div className="box">
                        <PlanetaryParameters
                            params={this.state.planetaryParameters}
                            onChange={this.handleNewPlantearyParameters.bind(this)}
                        />
                        <ControlsAndSettings
                            controls = {this.state.controls}
                            onChange = {this.handleNewControlSettings.bind(this)}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }

    handleNewPlantearyParameters(newParams) {
        this.setState({ planetaryParameters: newParams });
    }

    handleNewControlSettings(newSettings) {
        this.setState({ controls: newSettings });
    }
}
