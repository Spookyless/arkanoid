import Sprite from "./Sprite.js";
import Vector2 from "./Vector2.js";

export default class Entity extends Sprite {
    /**
     * @param {string} spritePath
     * @param {number} spriteX
     * @param {number} spriteY
     * @param {number} spriteWidth
     * @param {number} spriteHeight
     * @param {Vector2} position
     * @param {number} scale
     */
    constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, position, scale) {
        super(spritePath, spriteX, spriteY, spriteWidth, spriteHeight);

        this.position = new Vector2(position.x * scale, position.y * scale);
        this.width = spriteWidth * scale;
        this.height = spriteHeight * scale;
    }
}