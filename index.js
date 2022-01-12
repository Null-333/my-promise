const PENDING = 'pending';
const REJECTED = 'rejected';
const FULFILLED = 'fulfilled';
class MyPromise {
    constructor(execute) {
        try {
            execute(this.resolve, this.reject);
        } catch (e) {
            this.reject(e);
        }
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
            this.successCallback.shift()();
        }
    }
    reject = reason => {
        if (this.status === FULFILLED) {
            return;
        }
        this.status = REJECTED;
        this.reason = reason;
        while(this.failCallback.length > 0) {
            this.failCallback.shift()();
        }
    }
    then(successCallback, failCallback) {
        successCallback ? successCallback : value => value;
        failCallback ? failCallback : err => {throw new Error(err)};
        const promise2 = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                if (this.status === FULFILLED) {
                    try {
                        const x = successCallback(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                } else if (this.status === REJECTED) {
                    try {
                        const x = failCallback(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    this.successCallback.push(() => {
                        try {
                            const x = successCallback(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                    this.failCallback.push(() => {
                        try {
                            const x = failCallback(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                }
            }, 0);
        });
        return promise2;
    }
    // TODO
    finally() {}
    catch(failCallback) {
        return this.then(undefined, failCallback);
    }
    static all(arr) {
        const resolveArr = [];
        let index = 0;
        return new MyPromise((resolve) => {
            function addData(key, value) {
                index++;
                resolveArr[key] = value;
                if (index === arr.length) {
                    resolve(resolveArr);
                }
            }
            arr.forEach((item, i) => {
                if (item instanceof MyPromise) {
                    item.then((value) => {
                        addData(i, value);
                    });
                } else {
                    addData(i, item);
                }
            })
        })
    }
    static resolve(value) {
        if (value instanceof MyPromise) {
            return value;
        }
        return new MyPromise((resolve) => resolve(value));
    }
}

function resolvePromise (promise2, x, resolve, reject) {
    if (x === promise2) {
        return reject(new TypeError('then方法不能返回自身的promise'));
    }
    if (x instanceof MyPromise) {
        x.then(resolve, reject);
    } else {
        resolve(x);
    }
}

function p1() {
    return new MyPromise((resolve) => {
        resolve(1);
    });
}
p1().finally(() => {
    console.log('finally');
}).then((value) => {
    console.log('value====-132', value);
})
    
