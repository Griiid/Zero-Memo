import View from 'ampersand-view';

import OptionsView from './options';
import ResultView from './result';

export default View.extend({
    template: require('../templates/main.jade'),
    subviews: {
        options: {
            hook: 'options',
            prepareView(el) {
                return new OptionsView({
                    el,
                    model: this.model
                });
            }
        },
        result: {
            hook: 'result',
            prepareView(el) {
                return new ResultView({
                    el,
                    model: this.model.result
                });
            }
        }
    }
});