import React from 'react';
import { PlanetTypes } from './enums.jsx';
import OrbitView from './OrbitView.jsx';
import PlanetaryParameters from './PlanetaryParameters.jsx';
import ControlsAndSettings from './ControlsAndSettings.jsx';
import ZodiacStrip from './ZodiacStrip.jsx';

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
                showEccentricDeferentLine: false,
                pathDuration: 0.2
            },
            longitudes: {
                sun_longitude: 0,
                ecliptic_longitude: 0,
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <h1>PtolemaicSystemSimulator</h1>
                {/*
                    <pre>PtolemaicSystemSimulator.state = {JSON.stringify(this.state, null, '\t')}</pre>
                */}
                <div className="wrapper">
                    <div className="box leftBox">
                        <OrbitView
                            className = "OrbitView"
                            planetaryParameters={this.state.planetaryParameters}
                            controls={this.state.controls}
                            onLongitudeChange={this.handleNewLongitudes.bind(this)}
                        />
                        <ZodiacStrip
                            className="ZodiacStrip"
                            longitudes={this.state.longitudes}
                            planetType={this.state.planetaryParameters.planetType}
                        />
                    </div>
                    <div className="box rightBox">
                        <PlanetaryParameters
                            params={this.state.planetaryParameters}
                            onChange={this.handleNewPlantearyParameters.bind(this)}
                        />
                        <ControlsAndSettings
                            controls = {this.state.controls}
                            onChange = {this.handleNewControlSettings.bind(this)}
                        />
                        <div id="survey">
                            <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=n7L3RQCxQUyAT7NBighZStjAWTIFlutChq8ZZEGLLMdUMDYyTFJPMTZTQkpSVVhNSFdVRzgwTjhJMC4u"
                               target="_blank"
                               rel="noopener noreferrer">
                                <button type="button" id="feedbackButton">Give us feedback!</button>
                            </a>
                        </div>
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

    handleNewLongitudes(newLongitudes) {
        this.setState({ longitudes: newLongitudes })
    }
}
