import Brick from "./Brick.js";
import Sprite from "./Sprite.js";
import Spritesheet from "./Spritesheet.js";
import Vector2 from "./Vector2.js";

export default class {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} paddingX
     * @param {number} paddingY
     * @param {number} gapX
     * @param {number} gapY
     * @param {number} scale
     */
    constructor(canvas, paddingX, paddingY, gapX, gapY, scale) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.paddingX = paddingX;
        this.paddingY = paddingY;
        this.gapX = gapX;
        this.gapY = gapY;
        this.scale = scale;

        this.spritesheet = new Spritesheet("../resources/spritesheets/bricks.png", 2, 2, 8, 4, 2, 1);

        this.cellsX = null;
        this.cellsY = null;
        this.tileWidth = null;
        this.tileHeight = null;

        this.width = null;
        this.height = null;

        /**
         * @type {(Brick | null)[][]}
         */
        this.tiles = [];

        /**
         * @type {{x: Number, y: Number} | null}
         */
        this.hovering = null;

        /**
         * @type {{x: Number, y: Number} | null}
         */
        this.corner1 = null;

        /**
         * @type {{x: Number, y: Number} | null}
         */
        this.corner2 = null;

        /**
         * @type {(brick: Brick) => void}
         */
        this.applyBlocksFunction = null;
    }

    /**
     * @param {(brick: Brick) => void} applyBlocksFunction
     */
    async init(applyBlocksFunction) {
        await this.spritesheet.load();

        this.applyBlocksFunction = applyBlocksFunction;

        this.cellsX = this.spritesheet.cellsX;
        this.cellsY = this.spritesheet.cellsY;
        this.tileWidth = this.spritesheet.tileWidth;
        this.tileHeight = this.spritesheet.tileHeight;

        this.width = (2 * this.paddingX + this.cellsX * this.tileWidth + (this.cellsX - 1) * this.gapX) * this.scale;
        this.height = (2 * this.paddingY + this.cellsY * this.tileHeight + (this.cellsY - 1) * this.gapY) * this.scale;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.hp = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [2, 1, 1, 1, 2],
        ];

        //@ts-ignore
        this.ctx.webkitImageSmoothingEnabled = false;
        //@ts-ignore
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        for (let y = 0; y < this.cellsY; y++) {
            this.tiles.push([]);

            for (let x = 0; x < this.cellsX; x++) {
                let v = this.spritesheet.get(x, y);

                if (typeof v === "boolean") {
                    throw new Error("AAAAAAAAAA");
                }

                let value = new Brick(v.spritePath, v.spriteX, v.spriteY, v.spriteWidth, v.spriteHeight, new Vector2(), this.scale, this.hp[y][x]);

                this.tiles[y].push(value);
            }
        }
    }

    render() {
        let ctx = this.ctx;

        ctx.fillStyle = "rgb(83,83,92)";
        ctx.fillRect(0, 0, this.width, this.height);

        for (let y = 0; y < this.cellsY; y++) {
            for (let x = 0; x < this.cellsX; x++) {
                ctx.globalAlpha = 0.5;

                if (this.hovering && x === this.hovering.x && y === this.hovering.y) {
                    ctx.globalAlpha = 1;
                }

                let value = this.tiles[y][x];

                let posX = (this.paddingX + x * (value.spriteWidth + this.gapX)) * this.scale;
                let posY = (this.paddingY + y * (value.spriteHeight + this.gapY)) * this.scale;

                if (value instanceof Brick) {
                    let img = this.spritesheet.image;

                    ctx.drawImage(img, value.spriteX, value.spriteY, value.spriteWidth, value.spriteHeight, posX, posY, value.spriteWidth * this.scale, value.spriteHeight * this.scale);
                    // ctx.drawImage(img, value.x, value.y, value.width, value.height, ws, hs, 8, 4);
                }
            }
        }

        ctx.globalAlpha = 1;

        requestAnimationFrame(this.render.bind(this));
    }

    /**
     * @param {MouseEvent} e 
     */
    onmousemove(e) {
        let hover = this.checkCollision(e.clientX, e.clientY);
        this.hovering = hover;

        if (hover) {
            this.canvas.classList.add("pointer");
        } else {
            this.canvas.classList.remove("pointer");
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onmousedown(e) {
        if (e.button !== 0) {
            return;
        }

        this.corner1 = this.checkCollision(e.clientX, e.clientY);
    }

    /**
     * @param {MouseEvent} e
     */
    onmouseup(e) {
        this.corner2 = this.checkCollision(e.clientX, e.clientY);

        if (this.corner1 && this.corner2 && this.corner1.x == this.corner2.x && this.corner1.y == this.corner2.y) {
            this.applyBlocks();
        }
    }

    applyBlocks() {
        if (this.applyBlocksFunction) {
            this.applyBlocksFunction(this.tiles[this.corner2.y][this.corner2.x])
        }
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {{x: Number, y: Number} | null}
     */
    checkCollision(mouseX, mouseY) {
        let bbox = this.canvas.getBoundingClientRect();

        if (
            mouseX < bbox.left ||
            mouseX > bbox.right ||
            mouseY < bbox.top ||
            mouseY > bbox.bottom
        ) {
            return null
        }

        for (let y = 0; y < this.cellsY; y++) {
            for (let x = 0; x < this.cellsX; x++) {
                let cell = this.cellToScreen(x, y);

                if (
                    mouseX >= cell.x1 &&
                    mouseX <= cell.x2 &&
                    mouseY >= cell.y1 &&
                    mouseY <= cell.y2
                ) {
                    return { x, y }
                }
            }
        }

        return null
    }


    /**
     * @param {number} x
     * @param {number} y
     * @returns {{x1: Number, y1: Number, x2: Number, y2: Number}}
     */
    cellToScreen(x, y) {
        let bbox = this.canvas.getBoundingClientRect();

        let x1 = (this.paddingX + x * (this.tileWidth + this.gapX)) * this.scale + bbox.left;
        let y1 = (this.paddingY + y * (this.tileHeight + this.gapY)) * this.scale + bbox.top;
        let x2 = x1 + this.tileWidth * this.scale;
        let y2 = y1 + this.tileHeight * this.scale;

        return { x1, y1, x2, y2 }
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     */
    isInside(mouseX, mouseY) {
        let bbox = this.canvas.getBoundingClientRect();

        if (mouseX > bbox.left && mouseX < bbox.right && mouseY > bbox.top && mouseY < bbox.bottom) {
            return true;
        }

        return false;
    }
}