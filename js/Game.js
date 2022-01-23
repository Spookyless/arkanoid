import ContextMenu from "./ContextMenu.js";
import GameBoard from "./GameBoard.js";

export default class Game {
    /**
     * @param {HTMLCanvasElement} gameCanvas
     */
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;

        this.gameBoard = new GameBoard(gameCanvas, 14, 9, 6);

        this.contextMenu = new ContextMenu(document.body);
        this.contextMenu.addButton("Load", "CTRL + L", this.gameBoard.load.bind(this.gameBoard));
    }

    async init() {
        await this.gameBoard.init();

        this.gameBoard.render();
    }

    registerHTMLEvents() {
        window.addEventListener("keydown", (e) => {
            if (this.contextMenu.shown == false) {
                this.gameBoard.onkeydown(e);
            }
        });

        window.addEventListener("keyup", (e) => {
            if (this.contextMenu.shown == false) {
                this.gameBoard.onkeyup(e);
            }
        });

        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();

            if (this.gameBoard.gameStarted === false) {
                this.contextMenu.show(e.clientX + 1, e.clientY + 1);
            }
        });
    }
}
