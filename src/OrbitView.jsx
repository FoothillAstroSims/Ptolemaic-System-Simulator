import React from 'react';
// import PropTypes from 'prop-types';
// import {PlanetTypes} from './enums.jsx';
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

        /**
         * The pixiElement is a reference to the DOM element that contains
         * the PIXIJS app. React will create this element, and then PIXIJS
         * will automatically add things inside it.
         */
        this.pixiElement = null;

        /**
         * The app is automatically created by PIXIJS when the component is
         * mounted.
         */
        this.app = null;

        this.earthGraphic = this.newEarthGraphic();
        this.eccentricityPlusMarker = new PIXI.Graphics();
    }

    render() {
        return (
            <div
                className="OrbitView"
                ref={(thisDiv) => { this.pixiElement = thisDiv; }} />
        )
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            width: 600,
            height: 600,
        });
        this.pixiElement.appendChild(this.app.view);
        this.app.stage.interactive = true;
        this.app.stage.addChild(this.earthGraphic);
        this.app.stage.addChild(this.eccentricityPlusMarker);
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


}




//
// OrbitView.propTypes = {
//     planetaryParameters: PropTypes.exact({
//         planetaryParameters: {
//             epicycleSize:           PropTypes.number.isRequired,
//             eccentricity:           PropTypes.number.isRequired,
//             motionRate:             PropTypes.number.isRequired,
//             apogeeAngle:            PropTypes.number.isRequired,
//             planetType:             PropTypes.instanceOf(PlanetTypes).isRequired,
//         },
//         controls: {
//             animationRate:          PropTypes.number.isRequired,
//             showDeferent:           PropTypes.bool.isRequired,
//             showEpicycle:           PropTypes.bool.isRequired,
//             showPlanetVector:       PropTypes.bool.isRequired,
//             showEquantVector:       PropTypes.bool.isRequired,
//             showEarthSunLine:       PropTypes.bool.isRequired,
//             showEpicyclePlanetLine: PropTypes.bool.isRequired,
//             pathDuration:           PropTypes.number.isRequired
//         }
//     }).isRequired
// }
