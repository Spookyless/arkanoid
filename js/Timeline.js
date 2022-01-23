export default class {
    /**
     * @param {any} snapshot
     */
    constructor(snapshot) {
        /** @type {any[]} */
        this.timeline = []
        // this.timeline.push(JSON.parse(JSON.stringify(snapshot)));

        if (snapshot instanceof Array) {
            let a = snapshot.map((v, i, arr) => [...v]);
            // console.log(snapshot);
            // console.log(a);
            this.timeline.push(a);
        }

        this.timelineIndex = 0;
    }

    /**
     * @param {any} snapshot 
     */
    addSnapshot(snapshot) {
        // this.timeline.push(JSON.parse(JSON.stringify(snapshot)));

        if (snapshot instanceof Array) {
            let a = snapshot.map((v, i, arr) => [...v]);
            // console.log(snapshot);
            // console.log(a);
            this.timeline.push(a);
        }

        this.timelineIndex++;
    }

    /**
     * @param {"past" | "future"} type
     */
    clearSnapshots(type) {
        if (type === "past") {
            let a = this.timeline.splice(0, this.timelineIndex + 1);
            this.timelineIndex -= a.length;
        } else if (type === "future") {
            this.timeline.splice(this.timelineIndex + 1);
        }
    }

    clearAllSnapshots() {
        this.timeline.length = 0;
        this.timelineIndex = 0;
    }

    /**
     * @param {"past" | "future"} direction
     * @returns {Boolean}
     */
    canStep(direction) {
        if (direction === "past") {
            if (this.timelineIndex != 0) {
                return true;
            }

            return false;
        } else if (direction === "future") {
            if (this.timelineIndex < this.timeline.length - 1) {
                return true;
            }

            return false;
        }
    }

    /**
     * @param {"past" | "future"} direction
     * @returns {any[] | null}
     */
    step(direction) {
        if (direction === "past") {
            if (this.canStep(direction)) {
                let outArr = this.timeline[--this.timelineIndex];
                return outArr.map((v) => [...v]);
            }

            return null;
        } else if (direction === "future") {
            if (this.canStep(direction)) {
                // return this.timeline[++this.timelineIndex];

                let outArr = this.timeline[++this.timelineIndex];
                return outArr.map((v) => [...v]);
            }

            return null;
        }

        return null;
    }
}