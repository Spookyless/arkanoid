import BoxCollider from "./BoxCollider.js";
import Entity from "./Entity.js";
import { clamp, lerp } from "./utils.js";
import Vector2 from "./Vector2.js";

export default class Paddle extends Entity {
    /**
     * @param {string} spritePath
     * @param {number} spriteX
     * @param {number} spriteY
     * @param {number} spriteWidth
     * @param {number} spriteHeight
     * @param {Vector2} position
     * @param {number} scale
     * @param {number} minX
     * @param {number} maxX
     * @param {number} speed
     */
    constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, position, scale, minX, maxX, speed) {
        super(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, position, scale);

        this.minX = minX * scale;
        this.maxX = maxX * scale;
        this.speed = speed * scale;

        this.collider = new BoxCollider(this.position, new Vector2(0, 0), new Vector2(this.width, this.height), "paddle");
    }

    /**
     * @param {number} newX
     */
    update(newX) {
        this.position.x = clamp(newX, this.minX, this.maxX);

        this.collider.update(this.position);
    }

    /**
     * @param {number} x
     */
    getAngleFromZone(x) {
        let zones = [
            { start: 0, end: 0.05, angle: 5 * Math.PI / 6 },
            { start: 0.05, end: 0.30, angle: [5 * Math.PI / 6, 3 * Math.PI / 4] },
            { start: 0.30, end: 0.50, angle: 3 * Math.PI / 4 },
            { start: 0.50, end: 0.70, angle: Math.PI / 4 },
            { start: 0.70, end: 0.95, angle: [Math.PI / 4, Math.PI / 6] },
            { start: 0.95, end: 1.01, angle: Math.PI / 6 }
        ];

        let frac = clamp((x - this.collider.x1) / this.collider.width, 0, 1);

        for (const zone of zones) {
            if (frac >= zone.start && frac < zone.end) {
                if (typeof (zone.angle) === "object") {
                    let v0 = zone.angle[0];
                    let v1 = zone.angle[1];

                    return lerp(v0, v1, (frac - zone.start) / (zone.end - zone.start));
                } else {
                    return zone.angle;
                }
            }
        }
    }
}