import View from 'ampersand-view';
import CollectionView from'ampersand-collection-view';

import ImageInputView from './image-input';
import ImageOutputView from './image-output';

export default View.extend({
    template: require('../templates/options.jade'),
    subviews: {
        input: {
            hook: 'input-container',
            prepareView(el) {
                return new ImageInputView({
                    el,
                    model: this.model.input
                });
            }
        },
        outputs: {
            hook: 'outputs-container',
            waitFor: 'model.outputs',
            prepareView(el) {
                return new CollectionView({
                    el,
                    view: ImageOutputView,
                    collection: this.model.outputs,
                });
            }
        }
    },
    events: {
        'submit form': 'handleSubmit'
    },
    handleSubmit(event) {
        event.preventDefault();
        this.model.submit();
    }
});
