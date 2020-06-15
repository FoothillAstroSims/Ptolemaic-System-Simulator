import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js'
import { PlanetTypes } from './enums.jsx';

/**
 * Data Table for each of the Constellations and the filepaths to their
 * images.  Will be loaded into Sprites and displayed around the edges of
 * the OrbitView.
 */
const CONSTELLATION_TABLE = [
    ['img/pisces.svg', 'Pisces'],
    ['img/aries.svg', 'Aries'],
    ['img/taurus.svg', 'Taurus'],
    ['img/gemini.svg', 'Gemini'],
    ['img/cancer.svg', 'Cancer'],
    ['img/leo.svg', 'Leo'],
    ['img/virgo.svg', 'Virgo'],
    ['img/libra.svg', 'Libra'],
    ['img/scorpio.svg', 'Scorpio'],
    ['img/sagittarius.svg', 'Sagittarius'],
    ['img/capricorn.svg', 'Capricorn'],
    ['img/aquarius.svg', 'Aquarius']
];

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
         * dimensions of the drawings.
         * @type {Number}
         */
        this.sideLength = 800;

        this.pixiElement = null;
        this.app = null;

        this.earthGraphic = this.newEarthGraphic();
        this.equantGraphic = this.newEquantGraphic();
        this.eccentricGraphic = this.newEccentricGraphic();
        this.sunGraphic = this.newSunGraphic();
        this.planetGraphic = this.newPlanetGraphic();
        this.overlay = new PIXI.Graphics();
        this.epicycle = new PIXI.Graphics();
        this.constellations = {};

        /**
         *  Current Time (in Simulation units: Earth Years).
         *  It is Incremented with every frame. It only increases.
        */
        this.currentTime = 0;

        /**
         * lastTimestamp is used by animationFrameLoop function to keep track
         * of how much time passes in between each frame.  Used to calculate
         * delta time.
         */
        this.lastTimestamp = 0;

        /* Deferent and Epicycle Angles are saved and incremented with each
        time step. The save-and-increment approach works better for these 
        variables, because doing a full recalculation each frame can result in
        the planety rapidly teleporting around the screen while the user
        is adjusting the "MotionRate" parameter.  */
        this.deferentAngle = 0;
        this.epicycleAngle = 0;
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            resolution: Math.min(window.devicePixelRatio, 3) || 1,
            autoDensity: true,
            width: this.sideLength,
            height: this.sideLength,
        });
        this.app.renderer.plugins.interaction.autoPreventDefault = false;
        this.app.renderer.view.style['touch-action'] = 'auto';
        this.pixiElement.appendChild(this.app.view);
        this.app.stage.addChild(rope);
        this.app.stage.addChild(this.overlay);
        this.app.stage.addChild(this.earthGraphic);
        this.app.stage.addChild(this.sunGraphic);
        this.app.stage.addChild(this.equantGraphic);
        this.app.stage.addChild(this.eccentricGraphic);
        this.app.stage.addChild(this.planetGraphic);
        this.app.stage.addChild(this.epicycle);
        this.loadConstellations();
        this.updateAll(0); // initial update.
        initializeTraceArray(this.planetGraphic.x, this.planetGraphic.y);
        this.animationFrameIdentifier = window.requestAnimationFrame(this.animationFrameLoop);
    }

    loadConstellations() {
        let angle = 0;
        for (let row of CONSTELLATION_TABLE) {
            let filepath = row[0];
            // let name = row[1];
            let sprite = PIXI.Sprite.from(filepath);
            // this.constellations[name] = sprite;
            this.app.stage.addChild(sprite);
            sprite.width = this.sideLength * 0.08;
            sprite.height = this.sideLength * 0.08;
            sprite.anchor.set(0.5);
            sprite.x = this.xUnitsToPixels(3.6 * Math.cos(angle));
            sprite.y = this.yUnitsToPixels(3.6 * Math.sin(angle));
            angle += Math.PI / 6;
        }
    }

    render() {
        return (
            <React.Fragment>
            <div
                className="OrbitView"
                ref={(thisDiv) => { this.pixiElement = thisDiv; }}
            />
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
        this.physicsUpdate(delta);
        this.update(delta);
        window.requestAnimationFrame(this.animationFrameLoop);
    }

    updateAll(delta) {
        this.physicsUpdate(delta);
        this.update();
    }

    update() {
        this.updateSun();
        this.updateEquant();
        this.updateEccentric();
        this.updatePlanet();
        this.updateOverlay();
    }

    /**
     * Converts x-coordinates from the graph in (-3, 3), to the pixel
     * coordinates that can be drawn on the canvas.
     */
    xUnitsToPixels(x) {
        return (x + 4) * this.sideLength / 8;
    }

    /**
     * Converts y-coordinates from the graph in (-3, 3), to the pixel
     * coordinates that can be drawn on the canvas.
     */
    yUnitsToPixels(y) {
        return -(y - 4) * this.sideLength / 8;
    }

    /**
     * Resets the simulation to time = 0, which is the initial default state.
     */
    reset() {
        this.currentTime = 0;
    }

    /**
     * PhysicsUpdate is where the most important variables are updated.
     * Those variables are used by the other "update" functions.
     */
    physicsUpdate(delta) {

        /* Increment Time if Animation is On */
        if (this.props.controls.isAnimationEnabled === true) {
            this.currentTime += delta * this.props.controls.animationRate / 1000;
        }
        let t = this.currentTime;
        this.props.onTimeChange(t);

        /* Alias Variables for Planetary Params */
        let ecc = this.props.planetaryParameters.eccentricity;
        let apogee = this.props.planetaryParameters.apogeeAngle;
        let motionRate = this.props.planetaryParameters.motionRate;
        let planetType = this.props.planetaryParameters.planetType;
        let R_e = this.props.planetaryParameters.epicycleSize;
        let R = 1;

        /* Toggle Planet Type */
        let epicycleRate = 1;
        let deferentRate = 1;
        if (planetType === PlanetTypes.SUPERIOR) {
            deferentRate = motionRate;
        } else {
            epicycleRate = motionRate;
        }

        /* Calculate Deferent Angle */
        let omega = 2 * Math.PI * deferentRate;
        if (this.props.controls.isAnimationEnabled === true) {
            this.deferentAngle += omega * delta * this.props.controls.animationRate / 1000;
            this.epicycleAngle += 2 * Math.PI * epicycleRate * delta * this.props.controls.animationRate / 1000;
        }

        /* Calculate Distance from Equant to Epicycle Center */
        let a = 1;
        let b = -2 * ecc * Math.cos(Math.PI - apogee * Math.PI / 180 + this.deferentAngle);
        let c = Math.pow(ecc, 2) - Math.pow(R, 2);
        let discriminant = Math.pow(b, 2) - 4 * a * c;
        let R_equant_epicycle = (-1 * b + Math.sqrt(discriminant)) / (2 * a);

        /* Calculate Equant Position */
        this.x_equant = 2 * ecc * Math.cos(apogee * Math.PI / 180);
        this.y_equant = 2 * ecc * Math.sin(apogee * Math.PI / 180);

        /* Calculate Deferent-Center Position */
        this.x_center = ecc * Math.cos(apogee * Math.PI / 180);
        this.y_center = ecc * Math.sin(apogee * Math.PI / 180);

        /* Calculate Deferent Position */
        this.x_deferent = R_equant_epicycle * Math.cos(this.deferentAngle);
        this.y_deferent = R_equant_epicycle * Math.sin(this.deferentAngle);

        /* Calculate Motion Around Epicycle */
        this.x_epicycle = R_e * Math.cos(this.epicycleAngle);
        this.y_epicycle = R_e * Math.sin(this.epicycleAngle);

        /* Calculate Planet */
        this.x_planet = this.x_equant + this.x_deferent + this.x_epicycle;
        this.y_planet = this.y_equant + this.y_deferent + this.y_epicycle;
        this.ecliptic_longitude = Math.atan2(this.y_planet, this.x_planet) * 180 / Math.PI;

        /* Calculate Sun */
        this.x_sun = 3 * R * Math.cos(2 * Math.PI * t);
        this.y_sun = 3 * R * Math.sin(2 * Math.PI * t);
        this.sun_longitude = Math.atan2(this.y_sun, this.x_sun) * 180 / Math.PI;

        /* Let the Longitudes be Known to other Components */
        this.props.onLongitudeChange({
            sun_longitude: this.sun_longitude,
            ecliptic_longitude: this.ecliptic_longitude,
        })

        /* For Debugging Purposes */
        // this.setState({
        //     t: t,
        //     x_equant: this.x_equant,
        //     y_equant: this.y_equant,
        //     x_center: this.x_center,
        //     y_center: this.y_center,
        //     x_deferent: this.x_deferent,
        //     y_deferent: this.y_deferent,
        //     x_planet: this.x_planet,
        //     y_planet: this.y_planet,
        //     ecliptic_longitude: this.ecliptic_longitude,
        //     x_sun: this.x_sun,
        //     y_sun: this.y_sun,
        //     sun_longitude: this.sun_longitude,
        // })
    }

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
        g.clear();
        g.lineStyle(2, 0xFFFFFF, 1);
        g.beginFill(0xf5c242, 1);
        g.drawCircle(0, 0, this.sideLength / 60);
        g.endFill();
        return g;
    }

    updateSun() {
        this.sunGraphic.x = this.xUnitsToPixels(this.x_sun);
        this.sunGraphic.y = this.yUnitsToPixels(this.y_sun);
    }

    newEquantGraphic() {
        const g = new PIXI.Graphics();
        let s = 0.01 * this.sideLength;
        g.lineStyle(3, 0x00FF00);
        g.moveTo(-s, 0);
        g.lineTo(s, 0);
        g.moveTo(0, -s);
        g.lineTo(0, s);
        g.endFill();
        return g;
    }

    updateEquant() {
        this.equantGraphic.x = this.xUnitsToPixels(this.x_equant);
        this.equantGraphic.y = this.yUnitsToPixels(this.y_equant);
    }

    newEccentricGraphic() {
        const g = new PIXI.Graphics();
        g.clear();
        g.lineStyle(0);
        g.beginFill(0x8455bd, 1);
        g.drawCircle(0, 0, 0.005 * this.sideLength);
        g.endFill();
        return g;
    }

    updateEccentric() {
        let x = this.xUnitsToPixels(this.x_center);
        let y = this.yUnitsToPixels(this.y_center);
        this.eccentricGraphic.x = x;
        this.eccentricGraphic.y = y;
    }

    newPlanetGraphic() {
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0xFFFFFF);
        g.beginFill(0xEE0000, 1);
        g.drawCircle(0, 0, 0.01 * this.sideLength);
        g.endFill();
        return g;
    }

    updatePlanet() {
        this.planetGraphic.x = this.xUnitsToPixels(this.x_planet);
        this.planetGraphic.y = this.yUnitsToPixels(this.y_planet);
        updatePlanetTrace(this.planetGraphic.x, this.planetGraphic.y, this.props.controls.pathDuration);
    }


    updateOverlay() {
        this.overlay.clear();
        if (this.props.controls.showDeferent === true) {
            let x = this.xUnitsToPixels(this.x_center);
            let y = this.yUnitsToPixels(this.y_center);
            let r = this.xUnitsToPixels(1) - this.xUnitsToPixels(0);
            this.overlay.lineStyle(2, 0xFFFFFF);
            this.overlay.drawCircle(x, y, r);
            this.overlay.endFill();
        }
        if (this.props.controls.showEarthSunLine === true) {
            this.overlay.lineStyle(2, 0xFFFFFF);
            this.overlay.moveTo(this.sideLength/2, this.sideLength/2);
            this.overlay.lineTo(this.sunGraphic.x, this.sunGraphic.y);
        }
        if (this.props.controls.showEquantVector === true) {
            let x1 = this.xUnitsToPixels(this.x_equant);
            let y1 = this.yUnitsToPixels(this.y_equant);
            let x2 = this.xUnitsToPixels(this.x_deferent + this.x_equant);
            let y2 = this.yUnitsToPixels(this.y_deferent + this.y_equant);
            this.overlay.lineStyle(2, 0xFFFFFF);
            this.overlay.moveTo(x1, y1);
            this.overlay.lineTo(x2, y2);
            this.overlay.endFill();
        }
        if (this.props.controls.showEpicycle === true) {
            let epicycleSize = this.props.planetaryParameters.epicycleSize;
            let x = this.xUnitsToPixels(this.x_equant + this.x_deferent);
            let y = this.yUnitsToPixels(this.y_equant + this.y_deferent);
            let r = this.xUnitsToPixels(epicycleSize) - this.xUnitsToPixels(0);
            this.overlay.lineStyle(2, 0xFFFFFF);
            this.overlay.drawCircle(x, y, r);
            this.overlay.endFill();
        }
        if (this.props.controls.showEpicyclePlanetLine === true) {
            let x1 = this.xUnitsToPixels(this.x_deferent + this.x_equant);
            let y1 = this.yUnitsToPixels(this.y_deferent + this.y_equant);
            let x2 = this.xUnitsToPixels(this.x_planet);
            let y2 = this.yUnitsToPixels(this.y_planet);
            this.overlay.lineStyle(2, 0xFFAAAA);
            this.overlay.moveTo(x1, y1);
            this.overlay.lineTo(x2, y2);
            this.overlay.endFill();
        }
        if (this.props.controls.showEccentricDeferentLine === true) {
            let x1 = this.xUnitsToPixels(this.x_center);
            let y1 = this.yUnitsToPixels(this.y_center);
            let x2 = this.xUnitsToPixels(this.x_deferent + this.x_equant);
            let y2 = this.yUnitsToPixels(this.y_deferent + this.y_equant);
            this.overlay.lineStyle(2, 0x9ca2ff);
            this.overlay.moveTo(x1, y1);
            this.overlay.lineTo(x2, y2);
            this.overlay.endFill();
        }
        if (this.props.controls.showPlanetVector === true) {
            let x1 = this.xUnitsToPixels(0);
            let y1 = this.yUnitsToPixels(0);
            let x2 = this.xUnitsToPixels(this.x_planet);
            let y2 = this.yUnitsToPixels(this.y_planet);
            this.overlay.lineStyle(2, 0xFFFFFF);
            this.overlay.moveTo(x1, y1);
            this.overlay.lineTo(x2, y2);
            this.overlay.endFill();
        }
    }
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
        isAnimationEnabled:        PropTypes.bool.isRequired,
        animationRate:             PropTypes.number.isRequired,
        showDeferent:              PropTypes.bool.isRequired,
        showEpicycle:              PropTypes.bool.isRequired,
        showPlanetVector:          PropTypes.bool.isRequired,
        showEquantVector:          PropTypes.bool.isRequired,
        showEarthSunLine:          PropTypes.bool.isRequired,
        showEpicyclePlanetLine:    PropTypes.bool.isRequired,
        showEccentricDeferentLine: PropTypes.bool.isRequired,
        pathDuration:              PropTypes.number.isRequired
    }).isRequired,
    onLongitudeChange: PropTypes.func.isRequired,
    onTimeChange: PropTypes.func.isRequired,
}









const trailTexture = PIXI.Texture.from('img/trail.png');
const historyX = [];
const historyY = [];
// historySize determines how long the trail will be.
const historySize = 5000;
// ropeSize determines how smooth the trail will be.
const ropeSize = Math.floor(1.5 * historySize);
const points = [];

// Create history array.
for (let i = 0; i < historySize; i++) {
    historyX.push(0);
    historyY.push(0);
}

// Create rope points.
for (let i = 0; i < ropeSize; i++) {
    points.push(new PIXI.Point(0, 0));
}

// Create the rope
const rope = new PIXI.SimpleRope(trailTexture, points);

// Set the blendmode
rope.blendmode = PIXI.BLEND_MODES.ADD;


function clipInput(k, arr) {
    if (k < 0) k = 0;
    if (k > arr.length - 1) k = arr.length - 1;
    return arr[k];
}

function getTangent(k, factor, array) {
    return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
}

function cubicInterpolation(array, t, tangentFactor) {
    if (tangentFactor == null) tangentFactor = 1;

    const k = Math.floor(t);
    const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
    const p = [clipInput(k, array), clipInput(k + 1, array)];
    t -= k;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}


/**
 * Initializes every point in the Tracer's History with the same value. Ensures
 * that the trace doesn't accidently draw an incorrect trace from the (0,0)
 * pixel to the planet's default starting position.
 */
function initializeTraceArray(planetX, planetY) {
    for (let i = 0; i < historySize; i++) {
        historyX[i] = planetX;
        historyY[i] = planetY;
    }
    for (let i = 0; i < ropeSize; i++) {
        points[i].set(planetX, planetY);
    }
}

/**
 * Adds a new position value to the planet tracing history, allowing the tracer
 * line to continue following the planet on the screen. Call this function
 * whenever the planet sprite is moved to a new position.
 */
function updatePlanetTrace(x, y, pathDuration) {

    // Update the positions values to history
    historyX.pop();
    historyX.unshift(x);
    historyY.pop();
    historyY.unshift(y);

    // determine max iterations based on the path duration
    rope.size = Math.floor((ropeSize - 1) * pathDuration) + 1;

    // Update the points to correspond with history.
    for (let i = 0; i < ropeSize; i++) {
        const p = points[i];

        // Smooth the curve with cubic interpolation to prevent sharp edges.
        const ix = cubicInterpolation(historyX, i / ropeSize * historySize);
        const iy = cubicInterpolation(historyY, i / ropeSize * historySize);

        p.x = ix;
        p.y = iy;
    }
}

