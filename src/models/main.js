const Promise = require('bluebird');

import State from 'ampersand-state';
import Collection from 'ampersand-collection';

import _ from 'underscore';

import ImageInput from './image-input';
import ImageOutput from './image-output';
import Result from './result';


export default State.extend({
    children: {
        input: ImageInput,
        result: Result
    },
    collections: {
        outputs: Collection.extend({
            model: ImageOutput
        })
    },
    initialize() {
        this.outputs.each(output => output.input = this.input);
    },
    submit() {
        const models = this.outputs.models.concat([this.input]);
        Promise
            .map(models, model => [model.id, model.url])
            .then(_.object)
            .then((urls) => this.result.urls = urls);
    }
});
