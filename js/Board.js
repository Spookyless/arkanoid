import Sprite from "./Sprite.js";
import Spritesheet from "./Spritesheet.js";
import { controlName, clamp, asc, randomChars } from "./utils.js";
import Timeline from "./Timeline.js";
import Brick from "./Brick.js";

export default class {

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} cellsX
     * @param {number} cellsY
     * @param {number} [scale]
     */
    constructor(canvas, cellsX, cellsY, scale = 1) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.controlName = controlName();

        let cellWidth = 8;
        let cellHeight = 4;
        let paddingX = 2;
        let paddingY = 2;
        let borderX = 2;
        let borderY = 2;

        this.cellsX = cellsX;
        this.cellsY = cellsY;
        this.scale = scale;

        this.cellWidth = cellWidth * scale;
        this.cellHeight = cellHeight * scale;
        this.paddingX = paddingX;
        this.paddingY = paddingY;
        this.borderX = borderX;
        this.borderY = borderY;

        this.tileWidth = cellWidth * scale + 2 * paddingX + 2 * borderX;
        this.tileHeight = cellHeight * scale + 2 * paddingY + 2 * borderY;

        this.insideX = this.paddingX + this.borderX;
        this.insideY = this.paddingY + this.borderY;

        this.width = this.tileWidth * cellsX;
        this.height = this.tileHeight * cellsY;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.controlMeta = false;
        this.controlMetaCurrent = false;

        //@ts-ignore
        this.ctx.webkitImageSmoothingEnabled = false;
        //@ts-ignore
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        /**
         * @type {(Brick | null)[][]}
         */
        this.tiles = [];

        /**
         * @type {Boolean[][]}
         */
        this.selected = [];

        /**
         * @type {Boolean[][]}
         */
        this.hovered = [];

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
        this.corner1px = null;

        /**
         * @type {{x: Number, y: Number} | null}
         */
        this.corner2 = null;

        /**
         * @type {{x: Number, y: Number} | null}
         */
        this.corner2px = null;

        this.selectingRegion = false;
        this.somethingSelected = false;
        this.initialBlockSelectedState = false;

        this.bricks = new Spritesheet("../resources/spritesheets/bricks.png", 2, 2, 8, 4, 2, 1);

        this.timeline = null;
    }

    async init() {
        await this.bricks.load();

        for (let y = 0; y < this.cellsY; y++) {
            this.tiles.push([]);
            this.selected.push([]);
            this.hovered.push([]);

            for (let x = 0; x < this.cellsX; x++) {
                let value = null;

                this.tiles[y].push(value);
                this.selected[y].push(false);
                this.hovered[y].push(false);
            }
        }

        this.timeline = new Timeline(this.tiles);
    }

    render() {
        let ctx = this.ctx;

        this.somethingSelected = false;

        ctx.fillStyle = "rgb(83,83,92)";
        ctx.fillRect(0, 0, this.width, this.height);

        for (let iy = 0; iy < this.tiles.length; iy++) {
            for (let ix = 0; ix < this.tiles[iy].length; ix++) {
                let value = this.tiles[iy][ix];

                let x = this.tileWidth * ix;
                let y = this.tileHeight * iy;
                let w = this.tileWidth;
                let h = this.tileHeight;

                if (value instanceof Brick) {
                    let img = this.bricks.image;

                    ctx.drawImage(img, value.spriteX, value.spriteY, value.spriteWidth, value.spriteHeight, x + this.insideX + 1, y + this.insideY + 1, w - 2 * this.insideX, h - 2 * this.insideY);
                }

                ctx.fillStyle = "transparent";
                ctx.lineWidth = this.borderX;
                ctx.strokeStyle = "rgb(255,255,255)";

                if (this.hovering && ix === this.hovering.x && iy === this.hovering.y) {
                    // ctx.strokeStyle = "fuchsia";
                    ctx.strokeStyle = "rgb(255,155,40)";
                } else if (this.hovered[iy][ix] && this.selected[iy][ix] == this.initialBlockSelectedState) {
                    ctx.strokeStyle = "rgb(255,155,40)";
                    // ctx.strokeStyle = "fuchsia";
                    // ctx.strokeStyle = "#5e8714";
                } else if (this.selected[iy][ix]) {
                    this.somethingSelected = true;
                    ctx.strokeStyle = "rgb(255,40,40)";
                }

                let o = this.borderX;

                ctx.strokeRect(x + o, y + o, w - o, h - o);
            }
        }

        if (this.selectingRegion) {
            // ctx.fillStyle = "rgb(60, 120, 60)";
            ctx.fillStyle = "rgb(0, 120, 215)";
            // ctx.strokeStyle = "rgb(90, 180, 90)";
            ctx.strokeStyle = "rgb(0, 120, 215)";
            ctx.globalAlpha = 0.5;

            ctx.fillRect(this.corner1px.x, this.corner1px.y, this.corner2px.x - this.corner1px.x, this.corner2px.y - this.corner1px.y);

            ctx.globalAlpha = 1;

            ctx.strokeRect(this.corner1px.x, this.corner1px.y, this.corner2px.x - this.corner1px.x, this.corner2px.y - this.corner1px.y);
        }

        requestAnimationFrame(this.render.bind(this));
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {{x1: Number, y1: Number, x2: Number, y2: Number}}
     */
    cellToScreen(x, y) {
        let bbox = this.canvas.getBoundingClientRect();

        let x1 = x * this.tileWidth + bbox.left;
        let y1 = y * this.tileHeight + bbox.top;
        let x2 = x1 + this.tileWidth;
        let y2 = y1 + this.tileHeight;

        return { x1, y1, x2, y2 };
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     * @param {Boolean} clampResult
     * @returns {{x: Number, y: Number} | null}
     */

    screenToCell(mouseX, mouseY, clampResult = false) {
        let bbox = this.canvas.getBoundingClientRect();

        let x = Math.floor((mouseX - bbox.left) / this.tileWidth);
        let y = Math.floor((mouseY - bbox.top) / this.tileHeight);

        if (x >= 0 && x < this.cellsX && y >= 0 && y < this.cellsY) {
            return { x, y };
        } else if (clampResult) {
            x = clamp(x, 0, this.cellsX - 1);
            y = clamp(y, 0, this.cellsY - 1);

            return { x, y };
        }

        return null;
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     * @param {Boolean} allowOverflow
     * @returns {{x: Number, y: Number} | null}
     */
    screenToLocal(mouseX, mouseY, allowOverflow = false) {
        let bbox = this.canvas.getBoundingClientRect();

        if (allowOverflow) {
            let x = mouseX - bbox.left;
            let y = mouseY - bbox.top;

            return { x, y };
        } else {
            if (mouseX > bbox.left && mouseX < bbox.right && mouseY > bbox.top && mouseY < bbox.bottom) {
                let x = mouseX - bbox.left;
                let y = mouseY - bbox.top;

                return { x, y };
            }

            return null;
        }
    }

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     * @returns {Boolean}
     */
    isInside(mouseX, mouseY) {
        let bbox = this.canvas.getBoundingClientRect();

        if (mouseX > bbox.left && mouseX < bbox.right && mouseY > bbox.top && mouseY < bbox.bottom) {
            return true;
        }

        return false;
    }

    /**
     * @param {"hovered" | "selected"} type
     * @param {Boolean} [keep]
     */
    applySelection(type, keep = false, initiallySelected = false) {
        let arr = this[type];

        let x1 = this.corner1.x;
        let y1 = this.corner1.y;
        let x2 = this.corner2.x;
        let y2 = this.corner2.y;

        [x1, x2] = [x1, x2].sort(asc);
        [y1, y2] = [y1, y2].sort(asc);

        for (let y = 0; y < arr.length; y++) {
            for (let x = 0; x < arr[y].length; x++) {
                if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                    arr[y][x] = !initiallySelected;
                } else if (!keep) {
                    arr[y][x] = false;
                }
            }
        }
    }

    /**
     * @param {"hovered" | "selected"} type
     * @param {any} value
     */
    resetSelection(type, value = false) {
        let arr = this[type];

        for (let y = 0; y < arr.length; y++) {
            for (let x = 0; x < arr[y].length; x++) {
                arr[y][x] = value;
            }
        }
    }

    /**
     * @param {Brick} brick
     */
    applyBlocks(brick) {
        if (this.somethingSelected) {
            for (let y = 0; y < this.cellsY; y++) {
                for (let x = 0; x < this.cellsX; x++) {
                    if (this.selected[y][x]) {
                        this.tiles[y][x] = brick;
                        this.selected[y][x] = false;
                    }
                }
            }

            this.timeline.clearSnapshots("future");
            this.timeline.addSnapshot(this.tiles);
        }
    }

    deleteBlocks() {
        if (this.somethingSelected) {
            for (let y = 0; y < this.cellsY; y++) {
                for (let x = 0; x < this.cellsX; x++) {
                    if (this.selected[y][x]) {
                        this.tiles[y][x] = null;
                        this.selected[y][x] = false;
                    }
                }
            }

            this.timeline.clearSnapshots("future");
            this.timeline.addSnapshot(this.tiles);
        }
    }

    undo() {
        let result = this.timeline.step("past");

        if (result != null) {
            this.tiles = result;
            this.resetSelection("hovered");
            this.resetSelection("selected");
        }
    }

    redo() {
        let result = this.timeline.step("future");

        if (result != null) {
            this.tiles = result;
            this.resetSelection("hovered");
            this.resetSelection("selected");
        }
    }

    save() {
        let json = JSON.stringify(this.tiles);
        let base64 = btoa(json);
        let blob = new Blob([base64], { type: "text/javascript" });
        let a = document.createElement("a");
        let url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `${randomChars(16)}.fkarka`;
        a.click();
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
                     * @type {(Brick | null)[][]}
                     */
                    let arr = JSON.parse(json);

                    for (let y = 0; y < arr.length; y++) {
                        for (let x = 0; x < arr[y].length; x++) {
                            let v = arr[y][x];
                            if (v !== null) {
                                if (v.type === "brick") {
                                    arr[y][x] = new Brick(v.spritePath, v.spriteX, v.spriteY, v.spriteWidth, v.spriteHeight, v.position, v.scale, v.hp);
                                }
                            }
                        }
                    }

                    this.tiles = arr;

                    this.timeline = new Timeline(this.tiles);
                    this.resetSelection("hovered");
                    this.resetSelection("selected");

                    setTimeout(() => {
                        alert("Level loaded!");
                    }, 100);
                } catch (e) {
                    alert(`Błąd parsowania pliku!\n${e}`);
                }
            }
        });
    }

    /**
     * @param {MouseEvent} e 
     */
    onmousemove(e) {
        let pos = this.screenToCell(e.clientX, e.clientY);
        let pospx = this.screenToLocal(e.clientX, e.clientY, true);

        if (this.selectingRegion) {
            pos = this.screenToCell(e.clientX, e.clientY, true);

            if (this.corner2.x != pos.x || this.corner2.y != pos.y) {
                this.corner2 = pos;
                this.applySelection("hovered");
            }

            this.corner2 = pos;
            this.corner2px = pospx;
        } else {
            this.hovering = pos;
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onmousedown(e) {
        if (e.button !== 0) {
            return;
        }

        let pos = this.screenToCell(e.clientX, e.clientY);
        let pospx = this.screenToLocal(e.clientX, e.clientY);

        this.controlMeta = this.controlMetaCurrent;

        if (this.isInside(e.clientX, e.clientY)) {
            this.initialBlockSelectedState = false;
            this.corner1 = pos;
            this.corner1px = pospx;
            this.corner2 = pos;
            this.corner2px = pospx;
            this.selectingRegion = true;

            if (this.controlMeta == false) {
                this.resetSelection("selected", false);
            } else {
                this.initialBlockSelectedState = this.selected[pos.y][pos.x];
            }
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onmouseup(e) {
        let pos = this.screenToCell(e.clientX, e.clientY);

        if (this.selectingRegion) {
            //select
            this.resetSelection("hovered", false);
            this.applySelection("selected", this.controlMeta, this.initialBlockSelectedState);
        }

        this.selectingRegion = false;
    }

    /**
     * @param {KeyboardEvent} e
     */
    onkeydown(e) {
        switch (e.key) {
            case this.controlName: { this.controlMetaCurrent = true; break; }
            case "Delete": { this.deleteBlocks(); break; }
            case "z": {
                if (this.controlMetaCurrent === true) {
                    this.undo();
                }
                break;
            }
            case "y": {
                if (this.controlMetaCurrent === true) {
                    e.preventDefault();
                    this.redo();
                }
                break;
            }
            case "s": {
                if (this.controlMetaCurrent === true) {
                    e.preventDefault();
                    this.save();
                }
                break;
            }
            case "l": {
                if (this.controlMetaCurrent === true) {
                    e.preventDefault();
                    this.load();
                }
                break;
            }
        }
    }

    /**
     * @param {KeyboardEvent} e
     */
    onkeyup(e) {
        switch (e.key) {
            case this.controlName: { this.controlMetaCurrent = false; break; }
        }
    }
}