import View from 'ampersand-view';
import CollectionView from'ampersand-collection-view';

import RangeView from './range'

export default View.extend({
    template: require('../templates/image-output.jade'),
    subviews: {
        'options': {
            hook: 'options-container',
            waitFor: 'model.options',
            prepareView(el) {
                return new CollectionView({
                    el,
                    view: RangeView,
                    collection: this.model.options,
                });
            }
        }
    }
});
