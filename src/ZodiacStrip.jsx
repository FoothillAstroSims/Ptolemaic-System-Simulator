import React from 'react';
import PropTypes from 'prop-types';
// import * as PIXI from 'pixi.js'

export default class ZodiacStrip extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const output = {
            ecliptic_longitude: this.props.longitudes.ecliptic_longitude,
            sun_longitude: this.props.longitudes.sun_longitude
        }
        return <pre>{JSON.stringify(output, null, '\t')}</pre>
    }

    componentDidMount() {
        // this.app = new PIXI.Application({
        //     antialias: true,
        //     width: 800,
        //     height: 200,
        // });
    }
}

ZodiacStrip.propTypes = {
    longitudes: PropTypes.exact({
        sun_longitude: PropTypes.number.isRequired,
        ecliptic_longitude: PropTypes.number.isRequired,
    }).isRequired,
};
