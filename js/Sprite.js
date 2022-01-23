export default class Sprite {
    /**
     * @param {string} spritePath
     * @param {number} spriteX
     * @param {number} spriteY
     * @param {number} spriteWidth
     * @param {number} spriteHeight
     */
    constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight) {
        this.type = "sprite";
        this.spritePath = spritePath;
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
    }
}