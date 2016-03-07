import State from 'ampersand-state';
import Collection from 'ampersand-collection';

import ImageInput from './image-input';
import Renderer from './renderer';
import Option, { BlurSigma, Brightness } from './option';

import uploadImage from '../lib/upload-image';

export default State.extend({
    props: {
        name: 'string'
    },
    children: {
        input: ImageInput,
        brightness: Brightness,
        blurSigma: BlurSigma,
        renderer: Renderer
    },
    collections: {
        options: Collection.extend({
            model: Option
        })
    },
    derived: {
        url: {
            deps: ['renderer', 'options', 'input.image'],
            fn() {
                return this.input.image.then((image) => {
                    this.renderer.setImage(image);
                    this.renderer.options = this.options;
                    return this.renderer
                        .render()
                        .toImage()
                        .then(uploadImage);
                });
            },
            cache: false
        }
    },
    initialize() {
        this.options.set([this.brightness, this.blurSigma], { remove: false });
    }
});
