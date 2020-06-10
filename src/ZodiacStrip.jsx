import React from 'react';
import PropTypes from 'prop-types';
// import { PlanetTypes } from './enums.jsx';
import * as PIXI from 'pixi.js'

const WIDTH = 800;
const HEIGHT = 262;
const TITLE_FONT_SIZE = 32;
const ANGLE_TEXT_SIZE = 32;
const LINE_COLOR = 0xa64e4e;
const TEXT_COLOR = 0xe4d1a0;
const ARROW_LINE_Y = HEIGHT/2 + 50;
const ARROWHEAD_SIZE = 10;

export default class ZodiacStrip extends React.Component {

    constructor(props) {
        super(props);
        this.animationFrameLoop = this.animationFrameLoop.bind(this);
        this.sunGraphic = this.newSunGraphic();
        this.planetGraphic = this.newPlanetGraphic();
        this.zodiacGraphic = this.newZodiacGraphic();
        this.arrowGraphic = new PIXI.Graphics();
        this.angleText = this.newAngleText();
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
            resolution: Math.min(window.devicePixelRatio, 3) || 1,
            autoDensity: true,
        });
        this.pixiElement.appendChild(this.app.view);
        this.app.stage.addChild(this.zodiacGraphic);
        this.app.stage.addChild(this.sunGraphic);
        this.app.stage.addChild(this.planetGraphic);
        this.app.stage.addChild(this.newTitleText());
        this.app.stage.addChild(this.arrowGraphic);
        this.app.stage.addChild(this.angleText);
        this.planetGraphic.y = this.sunGraphic.y = 0.5 * HEIGHT;
        this.app.ticker.add(this.animationFrameLoop)
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
        this.updateArrow();

        /* TODO: Determine whether to wrap line around the strip */

        /* Loop */
        // window.requestAnimationFrame(this.animationFrameLoop);
    }

    newTitleText() {
        const txt = new PIXI.Text('Zodiac Strip', {
            fontFamily: 'Garamond',
            fontSize: TITLE_FONT_SIZE,
            fill: TEXT_COLOR,
        });
        txt.anchor.set(0.5);
        txt.position.x = WIDTH/2;
        txt.position.y = TITLE_FONT_SIZE;
        return txt;
    }

    newAngleText() {
        const txt = new PIXI.Text('Angle', {
            fontFamily: 'Garamond',
            fontSize: ANGLE_TEXT_SIZE,
            fill: TEXT_COLOR,
        });
        txt.anchor.set(0.5);
        txt.position.x = WIDTH/2;
        txt.position.y = HEIGHT - ANGLE_TEXT_SIZE;
        return txt;
    }

    newZodiacGraphic() {
        const g = new PIXI.Sprite(PIXI.Texture.from('img/zodiac-strip.png'));
        g.anchor.set(0.5);
        g.x = WIDTH/2;
        g.y = HEIGHT/2;
        return g;
    }

    newSunGraphic() {
        const g = new PIXI.Graphics();
        /* Draw Sun */
        g.lineStyle(2, 0xFFFFFF, 1);
        g.beginFill(0xf5c242, 1);
        g.drawCircle(0, 0, 20);
        g.endFill();
        /* Draw Guide Line */
        g.lineStyle(3, LINE_COLOR);
        g.moveTo(0, -60);
        g.lineTo(0, -25);
        g.moveTo(0, 25);
        g.lineTo(0, 50);
        g.endFill();
        return g;
    }

    newPlanetGraphic() {
        const g = new PIXI.Graphics();
        /* Draw Planet */
        g.lineStyle(2, 0xFFFFFF);
        g.beginFill(0xEE0000, 1);
        g.drawCircle(0, 0, 10);
        g.endFill();
        /* Draw Guide Line */
        g.lineStyle(3, LINE_COLOR);
        g.moveTo(0, -50);
        g.lineTo(0, -15);
        g.moveTo(0, 15);
        g.lineTo(0, 50);
        g.endFill();
        return g;
    }


    updateArrow() {
        /* Check for Wrapping */
        let xs = this.sunGraphic.x;
        let xp = this.planetGraphic.x;
        let direct_dist = Math.abs(xs - xp);
        let wrap_dist = (xp < xs) ? (WIDTH - xs + xp) : (WIDTH - xp + xs);
        this.angleText.text = Math.floor(Math.min(direct_dist, wrap_dist) * 360 / WIDTH) + '°';
        let drawDirect = direct_dist < wrap_dist;
        let wrapLeft = xp > xs;
        let y = ARROW_LINE_Y;
        let direction = 1;
        /* Draw The Arrrow  */
        this.arrowGraphic.clear();
        this.arrowGraphic.lineStyle(2, LINE_COLOR);
        this.arrowGraphic.moveTo(xs, y);
        /* Decide direct vs wrapping around. Find arrowhead direction */
        if (drawDirect === true) {
            direction = (xs > xp) ? 1 : -1;
        }
        else if (wrapLeft) {
            this.arrowGraphic.lineTo(0, y);
            this.arrowGraphic.moveTo(WIDTH, y);
        }
        else {
            this.arrowGraphic.lineTo(WIDTH, y);
            this.arrowGraphic.moveTo(0, y);
            direction = -1;
        }
        this.arrowGraphic.lineTo(xp, y);
        /* Draw Arrowhead */
        this.arrowGraphic.lineTo(xp + ARROWHEAD_SIZE * direction, y - ARROWHEAD_SIZE);
        this.arrowGraphic.moveTo(xp + ARROWHEAD_SIZE * direction, y + ARROWHEAD_SIZE);
        this.arrowGraphic.lineTo(xp, y);
        this.arrowGraphic.endFill();
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
