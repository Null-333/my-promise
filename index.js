const PENDING = 'pending';
const REJECTED = 'rejected';
const FULFILLED = 'fulfilled';
class MyPromise {
    constructor(execute) {
        execute(this.resolve, this.reject);
    }
    status = PENDING;
    value = null;
    reason = null;
    successCallback = [];
    failCallback = [];
    resolve = value => {
        if (this.status === REJECTED) {
            return;
        }
        this.status = FULFILLED;
        this.value = value;
        while(this.successCallback.length > 0) {
            this.successCallback.shift()(this.value);
        }
    }
    reject = reason => {
        if (this.status === FULFILLED) {
            return;
        }
        this.status = REJECTED;
        this.reason = reason;
        while(this.failCallback.length > 0) {
            this.failCallback.shift()(this.reason);
        }
    }
    then(successCallback, failCallback) {
        return new MyPromise((resolve, reject) => {
            if (this.status === FULFILLED) {
                const x = successCallback(this.value);
                resolvePromise(x, resolve);
            } else if (this.status === REJECTED) {
                failCallback(this.reason)
            } else {
                this.successCallback.push(successCallback);
                this.failCallback.push(failCallback);
            }
        });
    }
}

function resolvePromise (x, resolve) {
    if (x instanceof MyPromise) {
        x.then((v) => {
            resolve(v);
        });
    } else {
        resolve(x);
    }
}

const promise = new MyPromise((resolve, reject) => {
    resolve('成功');
}).then((value) => {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(value);
        }, 1000);
    });
}).then((value) => {
    console.log(value);
});