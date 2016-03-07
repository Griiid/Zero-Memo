import State from 'ampersand-state';

import ImageLoader from '../lib/image-loader';
import uploadImage from '../lib/upload-image';

export default State.extend({
    props: {
        name: 'string',
        input: 'object',
        type: {
            type: 'string',
            default: 'url'
        },
        loader: {
            type: 'object',
            default() {
                return new ImageLoader();
            }
        }
    },
    derived: {
        image: {
            deps: ['url', 'loader'],
            fn() {
                return this.url.then((url) => this.loader.load(url));
            },
            cache: false
        },
        url: {
            deps: ['input', 'loader'],
            fn() {
                return this.input.then((url) => {
                    if (this.type === 'url') return url;
                    if (this.type === 'file') return uploadImage(url);
                });
            },
            cache: false
        }
    }
});
