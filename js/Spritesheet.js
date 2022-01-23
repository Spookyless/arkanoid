import Sprite from "./Sprite.js";

export default class {
    /**
     * @param {string} path
     * @param {number} startWidth
     * @param {number} startHeight
     * @param {number} tileWidth
     * @param {number} tileHeight
     * @param {number} gapWidth
     * @param {number} gapHeight
     */
    constructor(path, startWidth, startHeight, tileWidth, tileHeight, gapWidth, gapHeight) {
        this.path = path;
        this.startWidth = startWidth;
        this.startHeight = startHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.gapWidth = gapWidth;
        this.gapHeight = gapHeight;

        this.image = null;
        this.width = 0;
        this.height = 0;
        this.cellsX = 0;
        this.cellsY = 0;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.image = document.createElement("img");
            this.image.src = this.path;

            this.image.addEventListener("load", () => {
                this.width = this.image.width;
                this.height = this.image.height;

                this.cellsX = this.width < this.tileWidth + this.startWidth ? 0 : (1 + Math.floor((this.width - this.tileWidth - this.startWidth) / (this.gapWidth + this.tileWidth)));
                this.cellsY = this.height < this.tileHeight + this.startHeight ? 0 : (1 + Math.floor((this.height - this.tileHeight - this.startHeight) / (this.gapHeight + this.tileHeight)));

                resolve();
            });
        });
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    get(x, y) {
        if (x >= 0 && x < this.cellsX && y >= 0 && y < this.cellsY) {
            let x2 = this.startWidth + (this.tileWidth + this.gapWidth) * x;
            let y2 = this.startHeight + (this.tileHeight + this.gapHeight) * y;

            return new Sprite(this.path, x2, y2, this.tileWidth, this.tileHeight);
        }

        return false;
    }

    /**
     * @returns {Sprite}
     */
    getRandom() {
        let x = this.startWidth + Math.floor(Math.random() * this.cellsX) * (this.tileWidth + this.gapWidth);
        let y = this.startHeight + Math.floor(Math.random() * this.cellsY) * (this.tileHeight + this.gapHeight);
        return new Sprite(this.path, x, y, this.tileWidth, this.tileHeight);
    }
}