import React from 'react';
import PropTypes from 'prop-types';
// import { PlanetTypes } from './enums.jsx';
import * as PIXI from 'pixi.js'

const WIDTH = 800;
const HEIGHT = 129;

export default class ZodiacStrip extends React.Component {

    constructor(props) {
        super(props);
        this.animationFrameLoop = this.animationFrameLoop.bind(this);
        this.sunGraphic = this.newSunGraphic();
        this.planetGraphic = this.newPlanetGraphic();
        this.zodiacGraphic = new PIXI.Sprite(PIXI.Texture.from('img/zodiac-strip.png'));
    }

    render() {
        // const debugOutput = {
        //     ecliptic_longitude: this.props.longitudes.ecliptic_longitude,
        //     sun_longitude: this.props.longitudes.sun_longitude,
        //     adjusted_eclip: this.longitudeToLocationX(this.props.longitudes.ecliptic_longitude),
        //     adjusted_sun: this.longitudeToLocationX(this.props.longitudes.sun_longitude),
        //     planetType: this.props.planetType,
        // }
        return (
            <React.Fragment>
                <div ref={(thisDiv) => { this.pixiElement = thisDiv; }} />
                {/*
                <pre>{JSON.stringify(debugOutput, null, '\t')}</pre>
                */}
            </React.Fragment>
        );
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            width: WIDTH,
            height: HEIGHT,
        });
        this.pixiElement.appendChild(this.app.view);
        this.app.stage.addChild(this.zodiacGraphic);
        this.app.stage.addChild(this.sunGraphic);
        this.app.stage.addChild(this.planetGraphic);
        this.planetGraphic.y = this.sunGraphic.y = 0.5 * HEIGHT;
        window.requestAnimationFrame(this.animationFrameLoop);
    }

    animationFrameLoop() {

        /* Determine whether the planet is in front or behind the sun */
        // let isSuperior = (this.props.planetType === PlanetTypes.SUPERIOR);
        // let childIndexSun = isSuperior? 2 : 1;
        // let childIndexPlanet = isSuperior? 1 : 2;
        // this.app.stage.setChildIndex(this.sunGraphic, childIndexSun);
        // this.app.stage.setChildIndex(this.planetGraphic, childIndexPlanet);

        /* Placement of the Planet and Sun based on longitude */
        this.sunGraphic.x = this.longitudeToLocationX(this.props.longitudes.sun_longitude);
        this.planetGraphic.x = this.longitudeToLocationX(this.props.longitudes.ecliptic_longitude);

        /* TODO: Determine whether to wrap line around the strip */

        /* Loop */
        window.requestAnimationFrame(this.animationFrameLoop);
    }

    drawWrappedLines() {

    }

    drawDirectLine() {

    }

    newSunGraphic() {
        const g = new PIXI.Graphics();
        g.clear();
        g.lineStyle(2, 0xFFFFFF, 1);
        g.beginFill(0xf5c242, 1);
        g.drawCircle(0, 0, 20);
        g.endFill();
        return g;
    }

    newPlanetGraphic() {
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0xFFFFFF);
        g.beginFill(0xEE0000, 1);
        g.drawCircle(0, 0, 10);
        g.endFill();
        return g;
    }

    /* Converts a longitude input to pixel location on x-axis of ZodiacStrip */
    longitudeToLocationX(longitude) {
        let x = longitude < 0 ? longitude + 360 : longitude;
        x = (x + 90) % 360;
        x = -x + 360;
        return WIDTH * x / 360;
    }

}

ZodiacStrip.propTypes = {
    longitudes: PropTypes.exact({
        sun_longitude: PropTypes.number.isRequired,
        ecliptic_longitude: PropTypes.number.isRequired,
    }).isRequired,
    planetType: PropTypes.number.isRequired,
};
