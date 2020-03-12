import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js'

/**
 * Angles will start with 0 degrees, corresponding to the EAST direction
 * if you imagine a compass on the screen.  As radians/degrees increase,
 * the angle will move in the counterclockwise direction.
 */



/**
 * OrbitView is the main graphic container that displays the animations.
 * The only interface it has is the draggable sun, which affects both the
 * animation and the ZodiacStrip.
 */
export default class OrbitView extends React.Component {
    constructor(props) {
        super(props);

        /**
         * Side Length is used to determine the legnth of a side of the PIXI
         * Canvas.  Both Width and Height will be set to the side length,
         * this is to make the drawings independent from the actual pixel
         * dimensions of the drawings, so that the animation can be resized.
         * @type {Number}
         */
        this.sideLength = 600;

        this.pixiElement = null;
        this.app = null;

        this.earthGraphic = this.newEarthGraphic();
        this.sunGraphic = this.newSunGraphic();
        this.earthSunLine = new PIXI.Graphics();
        this.deferent = new PIXI.Graphics();

        this.lastTimestamp = 0;
        this.lastTheta = 0;
        this.sunTheta = 0;

        this.animationFrameLoop = this.animationFrameLoop.bind(this);
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            // resolution: window.devicePixelRatio || 1,
            width: this.sideLength,
            height: this.sideLength,
            // autoResize: true,
        });
        // window.addEventListener('resize', this.onResize.bind(this));
        this.pixiElement.appendChild(this.app.view);
        // this.app.stage.interactive = true;
        this.app.stage.addChild(this.earthGraphic);
        this.app.stage.addChild(this.sunGraphic);
        this.app.stage.addChild(this.deferent);
        this.app.stage.addChild(this.earthSunLine);
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
                <pre>this.state = {JSON.stringify(this.state, null, '\t')}</pre>
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
            this.updateAllAnimatedObjects(delta);
        }
        this.updateAllOverlayObjects(delta);
        window.requestAnimationFrame(this.animationFrameLoop);
    }

    updateAll(delta) {
        this.updateAllAnimatedObjects(delta);
        this.updateAllOverlayObjects(delta);
    }

    updateAllAnimatedObjects(delta) {
        this.updateSunTheta(delta);
        this.updateSun(delta);
    }

    updateAllOverlayObjects() {
        this.updateEarthSunLine();
        this.updateDeferent();
    }

    updateSunTheta(delta) {
        let period = 1000;
        let deltaTheta = 2 * Math.PI * delta / period;
        this.sunTheta += deltaTheta * this.props.controls.animationRate;
        // this.sunTheta %= 2 * Math.PI;
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
        g.lineStyle(1, 0xFFFFFF, 1);
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
        g.lineStyle(1, 0xFFFFFF, 1);
        g.beginFill(0xf5c242, 1);
        g.drawCircle(0, 0, this.sideLength / 50);
        g.endFill();
        return g;
    }

    updateSun() {
        let theta = this.sunTheta;
        let x_p = 0.4 * Math.cos(theta) + 0.5;
        let y_p = -0.4 * Math.sin(theta) + 0.5;
        let x = this.sideLength * x_p;
        let y = this.sideLength * y_p;
        this.sunGraphic.clear();
        this.sunGraphic.lineStyle(1, 0xFFFFFF, 1);
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
        this.earthSunLine.lineStyle(1, 0xFFFFFF);
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
            this.deferent.lineStyle(1, 0xFFFFFF);
            this.deferent.drawCircle(x_circ, y_circ, 0.15 * side);
            this.deferent.endFill();
        }
        /* Draw Green Cross */
        let x1_left  = (0.49 + ecc * cosAp) * side;
        let x1_right = (0.51 + ecc * cosAp) * side;
        let y_mid    = (0.50 - ecc * sinAp) * side;
        let x_mid    = (0.50 + ecc * cosAp) * side;
        let y2_bot   = (0.49 - ecc * sinAp) * side;
        let y2_top   = (0.51 - ecc * sinAp) * side;
        this.deferent.lineStyle(2, 0x00FF00);
        this.deferent.moveTo(x1_left, y_mid);
        this.deferent.lineTo(x1_right, y_mid);
        this.deferent.moveTo(x_mid, y2_bot);
        this.deferent.lineTo(x_mid, y2_top);
        this.deferent.endFill();
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
