const Promise = require('bluebird');

import View from 'ampersand-view';

export default View.extend({
    template: require('../templates/image-input.jade'),
    bindings: {
        'model.type': [
            {
                type: 'value',
                hook: 'input-type'
            },
            {
                type: 'attribute',
                name: 'type',
                hook: 'input'
            }
        ]
    },
    events: {
        'change [data-hook=input-type]': 'handleTypeChange',
        'change [data-hook=input]': 'handleChange'
    },
    initialize() {
        this.fileReader = new FileReader();
    },
    handleTypeChange(event) {
        this.model.type = event.target.value;
    },
    handleChange(event) {
        this.fileReader.abort();
        this.model.input = new Promise((resolve, reject) => {
            if (this.model.type === 'url') {
                resolve(event.target.value);
            }
            if (this.model.type === 'file') {
                reader.onload = _ => resolve(reader.result);
                reader.onerror = reject;
                reader.onabort = reject;
                reader.readAsDataURL(event.target.files[0]);
            }
        });
    }
});
