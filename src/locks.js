export class Threadlock {
    constructor() {
        this.promise = Promise.resolve();
        this.locks = 0;
    }

    async acquire() {
        var self = this;
        this.locks++;
        var unlock;
        var willLock = new Promise(r => {
            unlock = () => {
                self.locks--;
                r();
            }
        });
        var willUnlock = this.promise.then(() => unlock);
        this.promise = this.promise.then(() => willLock);
        return willUnlock;
    }

    get locked() {
        return this.locks > 0;
    }
}
