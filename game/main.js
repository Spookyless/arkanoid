import Game from "../js/Game.js";

(async () => {
    let e = new Game(
        //@ts-ignore
        document.getElementById("game"),
    )
    console.log("Działam");

    await e.init();
    e.registerHTMLEvents();
})()

