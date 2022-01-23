import BoxCollider from "./BoxCollider.js";
import Vector2 from "./Vector2.js";
import { lineIntersect } from "./utils.js";

export default class SphereCollider {
    /**
     * @param {Vector2} position
     * @param {Vector2} offset
     * @param {number} radius
     */
    constructor(position, offset, radius) {
        this.offset = offset.clone();
        this.position = position.clone().add(this.offset);
        this.radius = radius;
    }

    /**
     * @param {Vector2} position
     */
    update(position) {
        this.position.x = position.x + this.offset.x;
        this.position.y = position.y + this.offset.y;
    }

    /**
     * @param {BoxCollider} box
     * @param {Vector2} position
     * @returns {{type: "vertex" | "edge", direction: "left" | "right" | "top" | "bottom"}}
     */
    checkCollisionWithBox(box, position = this.position) {
        if (
            this.pointInside(new Vector2(box.x1, box.y1), position) ||
            this.pointInside(new Vector2(box.x2, box.y1), position) ||
            this.pointInside(new Vector2(box.x2, box.y2), position) ||
            this.pointInside(new Vector2(box.x1, box.y2), position)
        ) {
            let boxCenter = new Vector2(box.centerX, box.centerY);

            let left = lineIntersect(position, boxCenter, new Vector2(box.x1, box.y1), new Vector2(box.x1, box.y2));
            let right = lineIntersect(position, boxCenter, new Vector2(box.x2, box.y1), new Vector2(box.x2, box.y2));
            let top = lineIntersect(position, boxCenter, new Vector2(box.x1, box.y1), new Vector2(box.x2, box.y1));
            let bottom = lineIntersect(position, boxCenter, new Vector2(box.x1, box.y2), new Vector2(box.x2, box.y2));

            /**
             * @type {"left" | "right" | "top" | "bottom"}
             */
            let direction;

            if (left.seg1 && left.seg2) { direction = "left" }
            else if (right.seg1 && right.seg2) { direction = "right" }
            else if (top.seg1 && top.seg2) { direction = "top" }
            else if (bottom.seg1 && bottom.seg2) { direction = "bottom" }

            return {
                type: "vertex",
                direction: direction
            }
        } else {
            let left = this.intersectsLineX(box.x1, box.y1, box.y2, position);
            let right = this.intersectsLineX(box.x2, box.y1, box.y2, position);
            let top = this.intersectsLineY(box.y1, box.x1, box.x2, position);
            let bottom = this.intersectsLineY(box.y2, box.x1, box.x2, position);

            if (left || right || top || bottom) {
                return {
                    type: "edge",
                    //@ts-ignore
                    direction: left ? "left" : (right ? "right" : (top ? "top" : "bottom")),
                }
            } else {
                return null;
            }
        }
    }


    /**
     * @param {Vector2} point
     * @param {Vector2} position
     */
    pointInside(point, position = this.position) {
        return Math.pow(position.x - point.x, 2) + Math.pow(position.y - point.y, 2) < Math.pow(this.radius, 2);
    }

    /**
     * @param {number} x
     * @param {number} y1
     * @param {number} y2
     */
    intersectsLineX(x, y1, y2, position = this.position) {
        return Math.abs(position.x - x) < this.radius && position.y > Math.min(y1, y2) && position.y < Math.max(y1, y2);
    }

    /**
     * @param {number} x1
     * @param {number} x2
     * @param {number} y
     */
    intersectsLineY(y, x1, x2, position = this.position) {
        return Math.abs(position.y - y) < this.radius && position.x > Math.min(x1, x2) && position.x < Math.max(x1, x2);
    }
}