import Sprite from "./Sprite.js";
import Spritesheet from "./Spritesheet.js";
import { controlName, clamp } from "./utils.js";
import Paddle from "./Paddle.js";
import Vector2 from "./Vector2.js";
import Ball from "./Ball.js";
import Clock from "./Clock.js";
import Brick from "./Brick.js";
import BoxCollider from "./BoxCollider.js";

let cellWidth = 8;
let cellHeight = 4;

let pipeSize = 8;
let scoreHeight = 13;
let paddingTop = 12;

let bgWidth = 128;
let bgHeight = 128;

let paddleStartX = 50;
let paddleStartY = 106;

let ballStartX = 62;
let ballStartY = 101;

let shadowAlpha = 0.8;

export default class GameBoard {

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} cellsX
     * @param {number} cellsY
     * @param {number} [scale]
     */
    constructor(canvas, cellsX, cellsY, scale = 1) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.cellsX = cellsX;
        this.cellsY = cellsY;
        this.scale = scale;

        this.cellWidth = cellWidth * scale;
        this.cellHeight = cellHeight * scale;

        this.pipeSize = pipeSize * scale;
        this.scoreHeight = scoreHeight * scale;
        this.paddingTop = paddingTop * scale;

        this.tileWidth = cellWidth * scale;
        this.tileHeight = cellHeight * scale;

        this.gameOffsetX = this.pipeSize;
        this.gameOffsetY = this.scoreHeight + this.pipeSize + this.paddingTop;

        this.width = bgWidth * scale;
        this.height = bgHeight * scale;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        //@ts-ignore
        this.ctx.webkitImageSmoothingEnabled = false;
        //@ts-ignore
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        this.controlName = controlName();
        this.controlMetaCurrent = false;

        /**
         * @type {(Brick | null)[][]}
         */
        this.tiles = [];

        this.background = null;

        this.paddle = null;
        this.ball = null;

        this.moveLeft = false;
        this.moveRight = false;

        this.dummyCanvas = document.createElement("canvas");
        this.dummyCanvas.width = 100;
        this.dummyCanvas.height = 100;
        this.dummyCtx = this.dummyCanvas.getContext("2d");

        this.clock = new Clock();

        this.gameStarted = false;

        this.bricks = new Spritesheet("../../resources/spritesheets/bricks.png", 2, 2, 8, 4, 2, 1);
        this.backgrounds = new Spritesheet("../../resources/spritesheets/backgrounds.png", 0, 0, 128, 128, 0, 0);
        this.foreground = new Spritesheet("../../resources/spritesheets/foreground.png", 0, 0, 128, 128, 0, 0);

        this.pipeColliders = [
            new BoxCollider(new Vector2(0, this.scoreHeight), new Vector2(), new Vector2(this.width, this.pipeSize)),
            new BoxCollider(new Vector2(0, this.scoreHeight + this.pipeSize), new Vector2(), new Vector2(this.pipeSize, this.height - this.scoreHeight - this.pipeSize)),
            new BoxCollider(new Vector2(this.width - this.pipeSize, this.scoreHeight + this.pipeSize), new Vector2(), new Vector2(this.pipeSize, this.height - this.scoreHeight - this.pipeSize))
        ];
    }

    async init() {
        await this.bricks.load();
        await this.backgrounds.load();
        await this.foreground.load();

        this.background = this.backgrounds.getRandom();

        this.paddle = new Paddle(this.foreground.path, 15, 111, 27, 6, new Vector2(paddleStartX, paddleStartY), this.scale, 0, 0, 72);
        this.paddle.minX = this.pipeSize;
        this.paddle.maxX = this.width - this.pipeSize - this.paddle.width;
        this.ball = new Ball(this.foreground.path, 61, 97, 4, 4, new Vector2(ballStartX, ballStartY), this.scale, new Vector2(1, -1), 52, this);

        for (let y = 0; y < this.cellsY; y++) {
            this.tiles.push([]);

            for (let x = 0; x < this.cellsX; x++) {
                let value = null;

                if (Math.random() < 0.2) {
                    let ctl = this.cellToLocal(x, y);
                    let s = this.bricks.getRandom();
                    value = new Brick(s.spritePath, s.spriteX, s.spriteY, s.spriteWidth, s.spriteHeight, new Vector2(ctl.x1, ctl.y1), this.scale, 1);
                }

                this.tiles[y].push(value);
            }
        }
    }

    render() {
        let ctx = this.ctx;
        let delta = this.clock.time();

        if (this.gameStarted) {
            this.updatePaddle(delta);
            this.updateBall(delta);
            this.updateBricks(delta);
        }

        this.renderBackground(ctx);

        this.renderBlocksShadows(ctx);
        this.renderBordersShadows(ctx);
        this.renderForegroundsShadows(ctx);

        this.renderBlocks(ctx);
        this.renderBorder(ctx);
        this.renderForeground(ctx);

        //! Draw bounding boxes
        // this.renderBoundingBoxes(ctx);

        requestAnimationFrame(this.render.bind(this));
    }


    /**
     * @param {number} delta
     */
    updatePaddle(delta) {
        //@ts-ignore
        let newX = this.paddle.position.x + ((this.paddle.speed * this.moveRight) - (this.paddle.speed * this.moveLeft)) * delta;

        this.paddle.update(newX);
    }

    /**
     * @param {number} delta
     */
    updateBall(delta) {
        this.ball.update(delta, this.pipeColliders, this.paddle);
    }

    /**
     * @param {number} delta
     */
    updateBricks(delta) {
        this.tiles.forEach(el => {
            if (el instanceof Brick) {
                el.update(delta);
            }
        });
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderBlocks(ctx) {
        ctx.globalAlpha = 1;

        for (let iy = 0; iy < this.tiles.length; iy++) {
            for (let ix = 0; ix < this.tiles[iy].length; ix++) {
                let value = this.tiles[iy][ix];

                let x = this.gameOffsetX + this.tileWidth * ix;
                let y = this.gameOffsetY + this.tileHeight * iy;
                let w = this.tileWidth;
                let h = this.tileHeight;

                if (value instanceof Brick) {
                    let img = this.bricks.image;

                    ctx.drawImage(img, value.spriteX, value.spriteY, value.spriteWidth, value.spriteHeight, x, y, w, h);
                }
            }
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    renderBlocksShadows(ctx) {
        ctx.globalAlpha = shadowAlpha;
        ctx.fillStyle = "rgb(0,0,0)";

        let shadowOffsetX = this.tileWidth / 2;
        let shadowOffsetY = this.tileHeight;

        for (let iy = 0; iy < this.tiles.length; iy++) {
            for (let ix = 0; ix < this.tiles[iy].length; ix++) {
                let value = this.tiles[iy][ix];

                let x = this.gameOffsetX + this.tileWidth * ix;
                let y = this.gameOffsetY + this.tileHeight * iy;
                let w = this.tileWidth;
                let h = this.tileHeight;

                if (value instanceof Sprite) {
                    // let img = this.bricks.image;

                    ctx.fillRect(x + shadowOffsetX, y + shadowOffsetY, w, h);
                    // ctx.drawImage(img, value.x, value.y, value.width, value.height, );
                }
            }
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderBackground(ctx) {
        ctx.globalAlpha = 1;

        let b = this.background;

        ctx.drawImage(this.backgrounds.image, b.spriteX, b.spriteY, b.spriteWidth, b.spriteHeight, 0, 0, this.width, this.height);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderBorder(ctx) {
        ctx.globalAlpha = 1;

        //top pipe + score
        ctx.drawImage(this.foreground.image, 0, 0, bgWidth, scoreHeight + pipeSize, 0, 0, this.width, this.scoreHeight + this.pipeSize);

        //left pipe
        ctx.drawImage(this.foreground.image, 0, 0, pipeSize, bgHeight, 0, 0, this.pipeSize, this.height);

        //right pipe
        ctx.drawImage(this.foreground.image, bgWidth - pipeSize, 0, bgWidth, bgHeight, this.width - this.pipeSize, 0, this.width, this.height);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderBordersShadows(ctx) {
        ctx.globalAlpha = shadowAlpha;
        ctx.fillStyle = "rgb(0,0,0)";

        let shadowOffsetX = 4 * this.scale;
        let shadowOffsetY = 3 * this.scale;

        //top pipe
        ctx.fillRect(0 + shadowOffsetX, 0 + shadowOffsetY, this.width, this.scoreHeight + this.pipeSize);

        //left pipe
        ctx.fillRect(0 + shadowOffsetX, 0 + shadowOffsetY, this.pipeSize, this.height);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderForeground(ctx) {
        ctx.globalAlpha = 1;

        let p = this.paddle;
        let b = this.ball;

        ctx.drawImage(this.foreground.image, p.spriteX, p.spriteY, p.spriteWidth, p.spriteHeight, p.position.x, p.position.y, p.width, p.height);

        ctx.drawImage(this.foreground.image, b.spriteX, b.spriteY, b.spriteWidth, b.spriteHeight, b.position.x, b.position.y, b.width, b.height)
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderForegroundsShadows(ctx) {
        let dummyCanvasReset = () => {
            this.dummyCtx.globalCompositeOperation = "source-over";
            this.dummyCtx.globalAlpha = 1;
            this.dummyCtx.fillStyle = "rgb(0,0,0)";
            this.dummyCtx.clearRect(0, 0, this.dummyCanvas.width, this.dummyCanvas.height);
            this.dummyCtx.fillRect(0, 0, this.dummyCanvas.width, this.dummyCanvas.height);
        }

        ctx.globalAlpha = shadowAlpha;

        let paddleShadowOffsetX = 3 * this.scale;
        let paddleShadowOffsetY = 4 * this.scale;
        let ballShadowOffsetX = 3 * this.scale;
        let ballShadowOffsetY = 3 * this.scale;

        let p = this.paddle;
        let b = this.ball;

        dummyCanvasReset();
        this.dummyCtx.globalCompositeOperation = "destination-in";
        this.dummyCtx.drawImage(this.foreground.image, p.spriteX, p.spriteY, p.spriteWidth, p.spriteHeight, 0, 0, p.spriteWidth, p.spriteHeight);

        ctx.drawImage(this.dummyCanvas, 0, 0, p.spriteWidth, p.spriteHeight,
            p.position.x + paddleShadowOffsetX, p.position.y + paddleShadowOffsetY, p.width, p.height);

        dummyCanvasReset();
        this.dummyCtx.globalCompositeOperation = "destination-in";
        this.dummyCtx.drawImage(this.foreground.image, b.spriteX, b.spriteY, b.spriteWidth, b.spriteHeight, 0, 0, b.spriteWidth, b.spriteHeight);

        ctx.drawImage(this.dummyCanvas, 0, 0, b.spriteWidth, b.spriteHeight,
            b.position.x + ballShadowOffsetX, b.position.y + ballShadowOffsetY, b.width, b.height);

    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    renderBoundingBoxes(ctx) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(40,160,40)";

        ctx.beginPath();
        ctx.arc(this.ball.collider.position.x, this.ball.collider.position.y, this.ball.collider.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();

        let coll = this.paddle.collider;
        ctx.strokeStyle = "rgb(40,40,160)";

        ctx.beginPath();
        ctx.moveTo(coll.x1, coll.y1);
        ctx.lineTo(coll.x2, coll.y1);
        ctx.lineTo(coll.x2, coll.y2);
        ctx.lineTo(coll.x1, coll.y2);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = "rgb(160,40,40)";

        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                let el = this.tiles[y][x];

                if (el instanceof Brick) {
                    let coll = el.collider;

                    ctx.beginPath();
                    ctx.moveTo(coll.x1, coll.y1);
                    ctx.lineTo(coll.x2, coll.y1);
                    ctx.lineTo(coll.x2, coll.y2);
                    ctx.lineTo(coll.x1, coll.y2);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }

        ctx.strokeStyle = "rgb(160,160,40)";

        this.pipeColliders.forEach(el => {
            ctx.beginPath();
            ctx.moveTo(el.x1, el.y1);
            ctx.lineTo(el.x2, el.y1);
            ctx.lineTo(el.x2, el.y2);
            ctx.lineTo(el.x1, el.y2);
            ctx.closePath();
            ctx.stroke();
        });
    }

    removeDeadBricks() {
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                if (this.tiles[y][x] instanceof Brick) {
                    if (this.tiles[y][x].destroyed === true) {
                        this.tiles[y][x] = null;
                    }
                }
            }
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {{x1: Number, y1: Number, x2: Number, y2: Number}}
     */
    cellToLocal(x, y) {
        let x1 = x * this.tileWidth + this.gameOffsetX;
        let y1 = y * this.tileHeight + this.gameOffsetY;
        let x2 = x1 + this.tileWidth;
        let y2 = y1 + this.tileWidth;

        return { x1, y1, x2, y2 };
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    localToCell(x, y) {
        let cellX = Math.floor((x - this.gameOffsetX) / this.tileWidth);
        let cellY = Math.floor((y - this.gameOffsetY) / this.tileHeight);

        if (cellX >= -1 && cellX <= this.cellsX && cellY >= -1 && cellY <= this.cellsY) {
            return { x: cellX, y: cellY };
        } else {
            return null;
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @returns {Brick[][]}
     */
    cellRegion(x, y, radius) {
        let x1 = Math.max(0, x - radius);
        let x2 = Math.min(this.cellsX - 1, x + radius);
        let y1 = Math.max(0, y - radius);
        let y2 = Math.min(this.cellsY - 1, y + radius);

        let arr = [];

        for (let y = y1; y <= y2; y++) {
            arr.push([]);

            for (let x = x1; x <= x2; x++) {
                arr[y - y1].push(this.tiles[y][x]);
            }
        }

        return arr;
    }

    load() {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = ".fkarka";
        input.click();

        input.addEventListener("change", () => {
            console.log(input);

            if (input.files.length === 0) {
                return alert("Nie wybrano pliku!");
            }

            let name = input.files[0];
            let reader = new FileReader();
            reader.readAsText(name, "utf-8");

            reader.onload = (e) => {
                try {
                    let result = e.target.result;
                    //@ts-ignore
                    let json = atob(result);

                    /**
                     * @type {Brick[][]}
                     */
                    let arr = JSON.parse(json);

                    /**
                     * @type {Brick[][]}
                     */
                    let out = [];

                    for (let y = 0; y < arr.length; y++) {
                        out.push([]);

                        for (let x = 0; x < arr[y].length; x++) {
                            let v = arr[y][x];
                            if (v !== null) {
                                if (v.type === "brick") {
                                    let ctl = this.cellToLocal(x, y);
                                    out[y][x] = new Brick(v.spritePath, v.spriteX, v.spriteY, v.spriteWidth, v.spriteHeight, new Vector2(ctl.x1, ctl.y1), this.scale, v.hp);
                                }
                            }
                        }
                    }

                    this.tiles = out;
                } catch (e) {
                    alert(`Błąd parsowania pliku!\n${e}`);
                }
            }
        });
    }

    /**
     * @param {KeyboardEvent} e
     */
    onkeydown(e) {
        switch (e.key) {
            case this.controlName: { this.controlMetaCurrent = true; break; }
            case "l": {
                if (this.controlMetaCurrent === true && this.gameStarted === false) {
                    e.preventDefault();
                    this.load();
                }
                break;
            }
            case "a": { this.moveLeft = true; break; }
            case "d": { this.moveRight = true; break; }
            case " ": { this.gameStarted = true; break; }
        }
    }

    /**
     * @param {KeyboardEvent} e
     */
    onkeyup(e) {
        switch (e.key) {
            case this.controlName: { this.controlMetaCurrent = false; break; }
            case "a": { this.moveLeft = false; break; }
            case "d": { this.moveRight = false; break; }
        }
    }
}