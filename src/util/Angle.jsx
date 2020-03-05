/**
 * Default is Radians in the constructor!
 */
export default class Angle {

    /**
     * Constructs a new Angle Object. The Default Units for Angle for
     * the constructor is in Radians. Calling the constructor without
     * parameters will default to a value of 0.
     * @param {Number} radians
     */
    constructor(radians) {
        if (radians === undefined || typeof(radians) !== 'number') {
            radians = 0;
        }
        this.internalRadians = radians;
    }

    /**
     * Unit Conversion: Radians to Degrees.
     * @param {Number} radians
     */
    static RadsToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Unit Conversion: Degrees to Radians
     * @param {Number} degrees
     * @return
     */
    static DegToRads(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Set the Angle using degrees as input.
     * @param {Number} radians
     */
    setAsRads(radians) {
        this.internalRadians = radians;
    }

    /**
     * Retrieve the Angle in the unit of degrees.
     * @return {Number}
     */
    getAsDegrees() {
        return this.internalRadians = Angle.RadsToDeg(this.internalRadians);
    }

    /**
     * Retrieve the Angle in the unit of radians.
     * @return {Number}
     */
    getAsRadians() {
        return this.internalRadians;
    }
}
