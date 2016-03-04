const Promise = require('bluebird');

module.exports = class ImageLoader {
    constructor() {
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';
    }
    load(src) {
        const image = this.image;

        if (src === image.src) return this.lastPromise;
        return this.lastPromise = new Promise((resolve, reject) => {
            image.onload = () => {
                resolve(image);
            }

            image.onerror = reject;

            image.src = src;
        });
    }
    static stopAll() {
        if (window.stop !== undefined) {
            window.stop();
        } else if (document.execCommand !== undefined) {
            document.execCommand("Stop", false);
        }
    }
}
