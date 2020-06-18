import * as PIXI from 'pixi.js'


/* The image file that will determine how the trace looks */
const TRAIL_TEXTURE = PIXI.Texture.from('img/trail.png');

/* history size determines the maximum number of points to keep track of. */
const HISTORY_SIZE = 5000;

/** 
 * The rope size determines how many points will actually be drawn.
 * rope size should be higher than history size.
 * Additional Points will be interpolated to produce a smoother line.
 */
const ROPE_SIZE = Math.floor(HISTORY_SIZE * 5);
// const ROPE_SIZE = Math.floor(1.5 * HISTORY_SIZE);


/**
 * Path Tracer traces the path of the planet in the simulation. This module
 * encapsulates the logic of the tracer so that it is less easier to use
 * in the OrbitView.
 */
export default class PathTracer {

    constructor(pathLength) {
        this.historyX = [];
        this.historyY = [];
        this.points = [];

        for (let i = 0; i < HISTORY_SIZE; i++) {
            this.historyX.push(0);
            this.historyY.push(0);
        }

        for (let i = 0; i < ROPE_SIZE; i++) {
            this.points.push(new PIXI.Point(0, 0));
        }

        this.rope = new PIXI.SimpleRope(TRAIL_TEXTURE, this.points);
        this.setPathLength(pathLength);
        this.rope.blendmode = PIXI.BLEND_MODES.ADD;
    }

    getPixiObject() {
        return this.rope;
    }

    setPathLength(pathLength) {
        this.rope.size = Math.floor((ROPE_SIZE - 1) * pathLength) + 1;
    }

    /**
     * Clearing the tracer line requires setting all of the points to a single
     * location. Provide that location (which should be the current location of 
     * the planet).
     */
    clear(x, y) {
        for (let i = 0; i < HISTORY_SIZE; i++) {
            this.historyX[i] = x;
            this.historyY[i] = y;
        }
        for (let i = 0; i < ROPE_SIZE; i++) {
            this.points[i].set(x, y);
        }
    }

    /**
     * Adds a new position value to the planet tracing history, allowing the tracer
     * line to continue following the planet on the screen. Call this function
     * whenever the planet sprite is moved to a new position.
     */
    addLocation(x, y) {
        if (this.historyX.length >= HISTORY_SIZE) {
            this.historyX.pop();
        }
        this.historyX.unshift(x);
        if (this.historyY.length >= HISTORY_SIZE) {
            this.historyY.pop();
        }
        this.historyY.unshift(y);
        this._updateRopePoints();
    }

    _updateRopePoints() {
        for (let i = 0; i < ROPE_SIZE; i++) {
            const p = this.points[i];
    
            // Smooth the curve with cubic interpolation to prevent sharp edges.
            const ix = cubicInterpolation(this.historyX, i / ROPE_SIZE * HISTORY_SIZE);
            const iy = cubicInterpolation(this.historyY, i / ROPE_SIZE * HISTORY_SIZE);
    
            p.x = ix;
            p.y = iy;
        }
    }
}



// =================================================================




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