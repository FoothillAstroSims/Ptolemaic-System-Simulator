import React from 'react';
import PropTypes from 'prop-types';

const DAYS_PER_YEAR_EXACT = 365.2422;

export default class ControlsAndSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const years = Math.floor(this.props.time);
        const days = Math.floor((this.props.time % 1) * DAYS_PER_YEAR_EXACT);
        return <React.Fragment>
            <h2>Time Passed</h2>
            <p>{years} Years and {days} Days</p>
        </React.Fragment>
    }
}

ControlsAndSettings.propTypes = {
    time: PropTypes.number.isRequired
}
