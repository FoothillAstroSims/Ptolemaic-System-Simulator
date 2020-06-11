import React from 'react';


export default class TitleBar extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <React.Fragment>
                <nav className="navbar navbar-expand-md navbar-light bg-dark d-flex justify-content-between">
                    <span className="navbar-brand mb-0 text-light h1">Ptolemaic System Simulator</span>
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <button type="button" className="btn btn-link text-light" onClick={this.onResetClick.bind(this)}>Reset</button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className="btn btn-link text-light" data-toggle="modal" data-target="#helpModal">Help</button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className="btn btn-link text-light" data-toggle="modal" data-target="#aboutModal">About</button>
                        </li>
                    </ul>
                </nav>
            </React.Fragment>
        )
    }

    onResetClick(event) {
        event.preventDefault();
        this.props.onResetClick();
    }
}