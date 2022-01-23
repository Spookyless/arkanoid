import Vector2 from "./Vector2.js";

export default class BoxCollider {
    /**
     * @param {Vector2} position
     * @param {Vector2} offset1
     * @param {Vector2} offset2
     * @param {string} [name]
     */
    constructor(position, offset1, offset2, name = "") {
        this.position = position.clone();
        this.offset1 = offset1.clone();
        this.offset2 = offset2.clone();
        this.name = name;
    }

    get x1() {
        return this.position.x + this.offset1.x;
    }

    get x2() {
        return this.position.x + this.offset2.x;
    }

    get y1() {
        return this.position.y + this.offset1.y;
    }

    get y2() {
        return this.position.y + this.offset2.y;
    }

    get width() {
        return Math.abs(this.offset1.x - this.offset2.x);
    }

    get height() {
        return Math.abs(this.offset1.y - this.offset2.y);
    }

    get centerX() {
        return (this.x1 + this.x2) / 2;
    }

    get centerY() {
        return (this.y1 + this.y2) / 2;
    }

    /**
     * @param {Vector2} position
     */
    update(position) {
        this.position = position.clone();
    }

    /**
     * @param {Vector2} point
     * @return {Boolean}
     */
    pointInside(point) {
        let x = point.x;
        let y = point.y;

        return (x > this.x1 && x < this.x2 && y > this.y1 && y < this.y2);
    }
}