import Board from "./Board.js";
import Select from "./Select.js";
import ContextMenu from "./ContextMenu.js";

export default class {
    /**
     * @param {HTMLCanvasElement} boardCanvas
     * @param {HTMLCanvasElement} selectCanvas
     */
    constructor(boardCanvas, selectCanvas) {
        this.boardCanvas = boardCanvas;
        this.selectCanvas = selectCanvas;

        this.board = new Board(boardCanvas, 14, 9, 5);
        this.select = new Select(selectCanvas, 3, 3, 3, 3, 5);
        this.contextMenu = new ContextMenu(document.body);
        this.contextMenu.addButton("Undo", "CTRL + Z", this.board.undo.bind(this.board));
        this.contextMenu.addButton("Redo", "CTRL + Y", this.board.redo.bind(this.board));
        this.contextMenu.addButton("Delete", "DEL", this.board.deleteBlocks.bind(this.board));
        this.contextMenu.addButton("Save", "CTRL + S", this.board.save.bind(this.board));
        this.contextMenu.addButton("Load", "CTRL + L", this.board.load.bind(this.board));
    }

    async init() {
        await this.board.init();
        await this.select.init(this.board.applyBlocks.bind(this.board));

        this.board.render();
        this.select.render();
    }

    registerHTMLEvents() {
        window.addEventListener("mousedown", (e) => {
            if (this.contextMenu.shown == false) {
                this.board.onmousedown(e);
                this.select.onmousedown(e);
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (this.contextMenu.shown == false) {
                this.select.onmousemove(e);
                this.board.onmousemove(e);
            }
        });

        window.addEventListener("mouseup", (e) => {
            if (this.contextMenu.shown == false) {
                this.board.onmouseup(e);
                this.select.onmouseup(e);
            }
        });

        window.addEventListener("keydown", (e) => {
            if (this.contextMenu.shown == false) {
                this.board.onkeydown(e);
            }
        });

        window.addEventListener("keyup", (e) => {
            if (this.contextMenu.shown == false) {
                this.board.onkeyup(e);
            }
        });

        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();

            this.contextMenu.show(e.clientX + 1, e.clientY + 1);
        });
    }
}