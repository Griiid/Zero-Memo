const createFBO = require('gl-fbo');

module.exports = class FBOPair {
    constructor() {
        this.args = arguments;
        this.state = 0;
        this[0] = this[1] = null;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        this.state ^= 1;
        if (!this[this.state]) this[this.state] = createFBO.apply(null, this.args);
        return { done: false, value: this[this.state] };
    }
    dispose() {
        if (this[0]) this[0].dispose();
        if (this[1]) this[1].dispose();
    }
}
