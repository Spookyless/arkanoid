export default class Vector2 {
    /**
     * @param {number} [x]
     * @param {number} [y]
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * @returns {Vector2}
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    normalize() {
        let m = this.magnitude;

        this.x = this.x / m;
        this.y = this.y / m;

        return this;
    }

    /**
     * @param {number} angle Angle in radians
     */
    setFromAngle(angle) {
        this.x = Math.cos(angle);
        this.y = -Math.sin(angle);

        this.normalize();

        return this;
    }

    getAngle() {
        return Math.atan2(this.y, this.x) + Math.PI % (Math.PI * 2);
    }

    reflectX() {
        this.x = -this.x;

        return this;
    }

    reflectY() {
        this.y = -this.y;

        return this;
    }


    /**
     * @param {Vector2} v
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;

        return this;
    }

    /**
     * @param {Vector2} v
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;

        return this;
    }

    /**
     * @param {number} number
     */
    multiply(number) {
        this.x *= number;
        this.y *= number;

        return this;
    }
}