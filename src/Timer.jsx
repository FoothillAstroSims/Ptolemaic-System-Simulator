import React from 'react';
import PropTypes from 'prop-types';

const DAYS_PER_YEAR_EXACT = 365.2422;

export default class ControlsAndSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.time;
        const years = Math.sign(t) * Math.floor(Math.abs(t));
        const days = Math.sign(t) * (Math.floor(Math.abs(t) * DAYS_PER_YEAR_EXACT) % 365);
        return <React.Fragment>
            <h2>Time Passed</h2>
            <p>{years} Years and {days} Days</p>
        </React.Fragment>
    }
}

ControlsAndSettings.propTypes = {
    time: PropTypes.number.isRequired
}
