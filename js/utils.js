import Vector2 from "./Vector2.js";

function controlName() {
    if (navigator.userAgent.indexOf("Windows") != -1) {
        return "Control";
    } else if (navigator.userAgent.indexOf("Mac") != -1) {
        return "Meta";
    }
}

/**
 * @param {number} v
 * @param {number} min
 * @param {number} max
 */
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

/**
 * @param {number} a
 * @param {number} b
 */
function asc(a, b) {
    return a - b;
}

/**
 * @param {number} length
 */
function randomChars(length) {
    let result = [];
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}

/**
 * @param {Vector2} a1 
 * @param {Vector2} a2 
 * @param {Vector2} b1 
 * @param {Vector2} b2 
 * @returns 
 */
function lineIntersect(a1, a2, b1, b2) {
    let x1 = a1.x;
    let y1 = a1.y;
    let x2 = a2.x;
    let y2 = a2.y;
    let x3 = b1.x;
    let y3 = b1.y;
    let x4 = b2.x;
    let y4 = b2.y;

    let ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: ua >= 0 && ua <= 1,
        seg2: ub >= 0 && ub <= 1
    };
}

/**
 * @param {number} v0
 * @param {number} v1
 * @param {number} t
 */
function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

export {
    controlName,
    clamp,
    asc,
    randomChars,
    lineIntersect,
    lerp
}