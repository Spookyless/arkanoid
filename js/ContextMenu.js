export default class {

    /**
     * @param {HTMLElement} HTMLHandle
     */
    constructor(HTMLHandle) {
        this.HTMLHandle = HTMLHandle;

        this.container = null;
        this.background = null;
        this.foreground = null;

        this.shown = false;

        this.initHTML();
    }

    initHTML() {
        this.container = document.createElement("div");
        this.background = document.createElement("div");
        this.foreground = document.createElement("div");

        this.container.id = "context-menu";
        this.background.id = "context-menu-background";
        this.foreground.id = "context-menu-foreground";

        this.background.addEventListener("click", (e) => {
            this.hide();
        });

        this.container.append(this.background, this.foreground);
        this.HTMLHandle.append(this.container);
    }


    /**
     * @param {string} name
     * @param {string} keys
     * @param {any} fun
     */
    addButton(name, keys, fun) {
        let d = document.createElement("div");
        let t1 = document.createElement("div");
        let t2 = document.createElement("div");

        d.classList.add("field");
        t1.classList.add("name");
        t2.classList.add("keys");

        t1.innerText = name;
        t2.innerText = keys;

        d.addEventListener("click", (e) => {
            e.stopPropagation();
            this.hide();
            fun();
        });

        d.append(t1, t2);
        this.foreground.append(d);
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    show(x, y) {
        this.container.classList.add("show");
        this.foreground.style.left = `${x}px`;
        this.foreground.style.top = `${y}px`;

        this.shown = true;
    }

    hide() {
        this.container.classList.remove("show");

        this.shown = false;
    }
}