import Editor from "../js/Editor.js";

(async () => {
    let e = new Editor(
        //@ts-ignore
        document.getElementById("canvas"),
        //@ts-ignore
        document.getElementById("select")
    )

    await e.init();
    e.registerHTMLEvents();
})()

