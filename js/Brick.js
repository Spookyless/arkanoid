import BoxCollider from "./BoxCollider.js";
import Sprite from "./Sprite.js";
import Vector2 from "./Vector2.js";

export default class Brick extends Sprite {
    /**
     * @param {string} spritePath
     * @param {number} spriteX
     * @param {number} spriteY
     * @param {number} spriteWidth
     * @param {number} spriteHeight
     * @param {Vector2} position
     * @param {number} scale
     */
    constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, position, scale, hp = 1) {
        super(spritePath, spriteX, spriteY, spriteWidth, spriteHeight);

        this.type = "brick";

        this.position = position.clone();
        this.scale = scale;
        this.hp = hp;

        this.destroyed = false;

        this.width = spriteWidth * scale;
        this.height = spriteHeight * scale;

        this.collider = new BoxCollider(this.position, new Vector2(0, 0), new Vector2(this.width, this.height));
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        this.collider.update(this.position);
    }

    damage() {
        if (--this.hp === 0) {
            this.destroy();
        }
    }

    destroy() {
        this.destroyed = true;
    }
}