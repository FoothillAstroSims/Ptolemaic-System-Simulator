import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js'
import { PlanetTypes } from './enums.jsx';

/**
 * Angles will start with 0 degrees, corresponding to the EAST direction
 * if you imagine a compass on the screen.  As radians/degrees increase,
 * the angle will move in the counterclockwise direction.
 *
 * If the term "x-axis" appears in the comments, assume that it is referring
 * to the horizontal line that passes through the central "earth" point.
 */


/*
TODO: Rename Stuff:
    Equant : Green Cross
    Eccentric : Purple Circle

TODO: PhysicsUpdate:
    Should ideally use fixed step instead of delta-timestep, because
    otherwise things can get weird.

TODO: Remove Code Duplication
    You added some lazy code duplication to retrieve the equant position.
    Fix it pls.
*/


/**
 * OrbitView is the main graphic container that displays the animations.
 * The only interface it has is the draggable sun, which affects both the
 * animation and the ZodiacStrip.
 */
export default class OrbitView extends React.Component {
    constructor(props) {
        super(props);
        this.animationFrameLoop = this.animationFrameLoop.bind(this);

        /**
         * Side Length is used to determine the legnth of a side of the PIXI
         * Canvas.  Both Width and Height will be set to the side length,
         * this is to make the drawings independent from the actual pixel
         * dimensions of the drawings, so that the animation can be resized.
         * @type {Number}
         */
        this.sideLength = 800;

        this.pixiElement = null;
        this.app = null;

        this.earthGraphic = this.newEarthGraphic();
        this.sunGraphic = this.newSunGraphic();
        this.earthSunLine = new PIXI.Graphics();
        this.deferent = new PIXI.Graphics();
        this.epicycle = new PIXI.Graphics();

        this.lastTimestamp = 0;
        this.lastTheta = 0;

        /**
         * the angular position of the sun, which rotates around the earth.
         */
        this.sunAngularPosition = 0;

        /**
         * the current angular position of the epicycle-center.
         * The epicycle-center rotates around the equant.
         */
        this.equantToEpicycleCenterAngularPosition = 0;

        /**
         * The current Angular Position of the planet around the epicycle.
         */
        this.planetAngularPosition = 0;

        /*
        Deferent and Equant positions are set by physicsUpdate(),
        and the other update() functions make use of these variables to
        draw locations of everything else.
        */

        this.deferentPosition = [0,0];
        this.equantPosition = [0,0];
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            // resolution: window.devicePixelRatio || 1,
            width: this.sideLength,
            height: this.sideLength,
            // autoResize: true,
        });
        this.app.renderer.plugins.interaction.autoPreventDefault = false;
        this.app.renderer.view.style['touch-action'] = 'auto';
        // window.addEventListener('resize', this.onResize.bind(this));
        this.pixiElement.appendChild(this.app.view);
        // this.app.stage.interactive = true;
        this.app.stage.addChild(this.earthGraphic);
        this.app.stage.addChild(this.sunGraphic);
        this.app.stage.addChild(this.deferent);
        this.app.stage.addChild(this.earthSunLine);
        this.app.stage.addChild(this.epicycle);
        this.updateAll(0); // initial update.
        this.animationFrameIdentifier = window.requestAnimationFrame(this.animationFrameLoop);
    }

    render() {
        return (
            <React.Fragment>
            <div className="OrbitViewWrapper">
                <div
                    className="OrbitView"
                    ref={(thisDiv) => { this.pixiElement = thisDiv; }}
                />
            </div>
            {/*
            <pre>{JSON.stringify(this.state, null, '\t')}</pre>
            */}
            </React.Fragment>
        )
    }

    /**
     * animationFrameLoop is called by the window.requestAnimationFrame
     * function, and is the core animation loop.  The timestamp is provided
     * automatically.
     */
    animationFrameLoop(timestamp) {
        let delta = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        if (this.props.controls.isAnimationEnabled === true) {
            this.physicsUpdate(delta);
        }
        this.update(delta);
        window.requestAnimationFrame(this.animationFrameLoop);
    }

    updateAll(delta) {
        this.physicsUpdate(delta);
        this.update(delta);
    }

    update(delta) {
        this.updateSun(delta);
        this.updateEarthSunLine();
        this.updateDeferent();
        this.updateEpicycle(delta);
    }

    /**
     * PhysicsUpdate is where the most important variables are updated.
     * Those variables are used by the other "update" functions.
     */
    physicsUpdate(delta) {
        /* Update Sun's Angular Position */
        let period = 1000;
        let deltaTheta = 2 * Math.PI * delta * this.props.controls.animationRate / period;
        this.sunAngularPosition += deltaTheta;
        /* Update and Epicycle and Planet Angular Position */
        if (this.props.planetaryParameters.planetType === PlanetTypes.SUPERIOR) {
            this.equantToEpicycleCenterAngularPosition += this.props.planetaryParameters.motionRate * deltaTheta;
            this.planetAngularPosition = this.sunAngularPosition;
        } else {
            this.planetAngularPosition += this.props.planetaryParameters.motionRate * deltaTheta;
            this.equantToEpicycleCenterAngularPosition = this.sunAngularPosition;
        }
    }


    /**
     * Creates the Earth Graphic that is placed at the center of the screen.
     * This is a static drawing that never changes position throughout the
     * entire animation.  (In the Ptolemaic Model, Earth is the center of
     * the Universe).
     * @return {PIXI.Graphics}
     */
    newEarthGraphic() {
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0xFFFFFF, 1);
        g.beginFill(0x0000FF, 1);
        let w = this.sideLength / 2;
        let h = this.sideLength / 2;
        let r = this.sideLength / 155;
        g.drawCircle(w, h, r);
        g.endFill();
        return g;
    }

    newSunGraphic() {
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0xFFFFFF, 1);
        g.beginFill(0xf5c242, 1);
        g.drawCircle(0, 0, this.sideLength / 50);
        g.endFill();
        return g;
    }

    updateSun() {
        let theta = this.sunAngularPosition;
        let x_p = 0.45 * Math.cos(theta) + 0.5;
        let y_p = -0.45 * Math.sin(theta) + 0.5;
        let x = this.sideLength * x_p;
        let y = this.sideLength * y_p;
        this.sunGraphic.clear();
        this.sunGraphic.lineStyle(2, 0xFFFFFF, 1);
        this.sunGraphic.beginFill(0xf5c242, 1);
        this.sunGraphic.drawCircle(0, 0, this.sideLength / 60);
        this.sunGraphic.endFill();
        this.sunGraphic.x = x;
        this.sunGraphic.y = y;
    }

    updateEarthSunLine() {
        this.earthSunLine.clear();
        if (this.props.controls.showEarthSunLine !== true) {
            return;
        }
        this.earthSunLine.lineStyle(2, 0xFFFFFF);
        this.earthSunLine.moveTo(this.sideLength/2, this.sideLength/2);
        this.earthSunLine.lineTo(this.sunGraphic.x, this.sunGraphic.y);
    }

    updateDeferent() {
        this.deferent.clear();
        let side = this.sideLength;
        let ecc = this.props.planetaryParameters.eccentricity / 2;
        let apogee = Math.PI * this.props.planetaryParameters.apogeeAngle / 180;
        let sinAp = Math.sin(apogee);
        let cosAp = Math.cos(apogee);
        /* Draw Purple Circle */
        let x_circ = (0.50 + ecc * cosAp / 2) * side;
        let y_circ = (0.50 - ecc * sinAp / 2) * side;
        let r_circ = 0.005 * side;
        this.deferent.lineStyle(0);
        this.deferent.beginFill(0x8455bd, 1);
        this.deferent.drawCircle(x_circ, y_circ, r_circ);
        this.deferent.endFill();
        /* Draw Deferent Circle */
        if (this.props.controls.showDeferent === true) {
            this.deferent.lineStyle(2, 0xFFFFFF);
            this.deferent.drawCircle(x_circ, y_circ, this.getDeferentRadius());
            this.deferent.endFill();
        }
        /* Draw Green Cross */
        let x1_left  = (0.49 + ecc * cosAp) * side;
        let x1_right = (0.51 + ecc * cosAp) * side;
        let y_mid    = (0.50 - ecc * sinAp) * side;
        let x_mid    = (0.50 + ecc * cosAp) * side;
        let y2_bot   = (0.49 - ecc * sinAp) * side;
        let y2_top   = (0.51 - ecc * sinAp) * side;
        this.deferent.lineStyle(3, 0x00FF00);
        this.deferent.moveTo(x1_left, y_mid);
        this.deferent.lineTo(x1_right, y_mid);
        this.deferent.moveTo(x_mid, y2_bot);
        this.deferent.lineTo(x_mid, y2_top);
        this.deferent.endFill();
        /* Hacks and Debugs */
        this.eccentricPosition = [x_circ, y_circ];
        this.equantPosition = [x_mid, y_mid];
        this.setState({
            eccentricPosition: this.eccentricPosition,
            equantPosition: this.equantPosition,
        });
    }

    updateEpicycle() {
        /* Draw Epicycle */
        let deferentRadius = this.getDeferentRadius();
        let equantAngle = this.equantToEpicycleCenterAngularPosition;
        let alpha  =  equantAngle - Math.asin(this.props.planetaryParameters.eccentricity * Math.sin(equantAngle));
        let apogee = Math.PI * this.props.planetaryParameters.apogeeAngle / 180;
        let x = this.eccentricPosition[0] + deferentRadius * Math.sin(alpha + apogee + Math.PI/2);
        let y = this.eccentricPosition[1] + deferentRadius * Math.cos(alpha + apogee + Math.PI/2);
        let r = this.props.planetaryParameters.epicycleSize * 0.1 * this.sideLength;
        this.epicycle.clear();
        if (this.props.controls.showEpicycle === true) {
            this.epicycle.lineStyle(2, 0xFFFFFF);
            this.epicycle.drawCircle(x, y, r);
            this.epicycle.endFill();
        }
        if (this.props.controls.showEquantVector === true) {
            this.epicycle.moveTo(this.equantPosition[0], this.equantPosition[1]);
            this.epicycle.lineTo(x, y);
            this.epicycle.endFill();
        }
        /* DEFERENT VECTOR */
        this.epicycle.lineStyle(2, 0x9ca2ff);
        this.epicycle.moveTo(this.eccentricPosition[0], this.eccentricPosition[1]);
        this.epicycle.lineTo(x, y);
        this.epicycle.endFill();
        /* Draw Planet */
        let x_planet = x + r * Math.sin(this.planetAngularPosition + Math.PI/2);
        let y_planet = y + r * Math.cos(this.planetAngularPosition + Math.PI/2);
        let r_planet = 0.01 * this.sideLength;
        this.epicycle.lineStyle(1, 0xFFFFFF);
        this.epicycle.beginFill(0xEE0000, 1);
        this.epicycle.drawCircle(x_planet, y_planet, r_planet);
        this.epicycle.endFill();
        /* Draw Planet Vector */
        if (this.props.controls.showPlanetVector === true) {
            this.epicycle.lineStyle(2, 0xFFAAAA);
            this.epicycle.moveTo(this.sideLength/2, this.sideLength/2);
            this.epicycle.lineTo(x_planet, y_planet);
            this.epicycle.endFill();
        }
        /* Draw Epicycle-Planet Line */
        if (this.props.controls.showEpicyclePlanetLine === true) {
            this.epicycle.lineStyle(2, 0xFFFFFF);
            this.epicycle.moveTo(x, y);
            this.epicycle.lineTo(x_planet, y_planet);
            this.epicycle.endFill();
        }
    }

    getDeferentRadius() {
        /* TODO: Remove Dependency on side length inside this func. */
        return 0.2 * this.sideLength;
    }

    /**
     * The function that is called when the PIXI.JS canvas itself is resized.
     *
     * I'm leaving this commented out because I haven't yet figured out how to
     * get it to resize correctly. Will probably require some messing around
     * with CSS as well.
     *
     */
    // onResize() {
    //     this.sideLength = this.app.view.width;
    //     // this.app.renderer.resize(this.sideLength, this.sideLength);
    //     console.log("resized to:", this.app.view.width, this.app.view.height);
    //     this.setState({
    //         "side length": this.sideLength
    //     });
    // }
}





OrbitView.propTypes = {
    planetaryParameters: PropTypes.exact({
        epicycleSize:           PropTypes.number.isRequired,
        eccentricity:           PropTypes.number.isRequired,
        motionRate:             PropTypes.number.isRequired,
        apogeeAngle:            PropTypes.number.isRequired,
        planetType:             PropTypes.number.isRequired,
    }).isRequired,
    controls: PropTypes.exact({
        isAnimationEnabled:     PropTypes.bool.isRequired,
        animationRate:          PropTypes.number.isRequired,
        showDeferent:           PropTypes.bool.isRequired,
        showEpicycle:           PropTypes.bool.isRequired,
        showPlanetVector:       PropTypes.bool.isRequired,
        showEquantVector:       PropTypes.bool.isRequired,
        showEarthSunLine:       PropTypes.bool.isRequired,
        showEpicyclePlanetLine: PropTypes.bool.isRequired,
        pathDuration:           PropTypes.number.isRequired
    }).isRequired
}
