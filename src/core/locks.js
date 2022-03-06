



export class Threadlock {
    constructor() {
        this.queue = [];
        this.locked = false;
    }

    async acquire() {
        if (!this.locked) { // still reeks of #1 -- but this would be the ONLY place a race condition could occur
            this.locked = true;
        } else {
            var self = this;
            await new Promise(unlock => self.queue.push(unlock));
        }
    }

    release() {
        var unlockNextThread = this.queue.shift();
        if (unlockNextThread) unlockNextThread();
        else this.locked = false;
    }
}