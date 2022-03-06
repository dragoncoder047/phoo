



export class Threadlock {
    constructor() {
        this.queue = [];
        this.locked = false;
    }

    async acquire() {
        if (!this.locked) {
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