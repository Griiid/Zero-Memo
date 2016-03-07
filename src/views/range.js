import View from 'ampersand-view';

export default View.extend({
    template: require('../templates/range.jade'),
    derived: {
        rawValue: {
            deps: ['model.stepCount', 'model.value'],
            fn() {
                const {max, min, value, stepCount} = this.model;
                return (value - min) * stepCount / (max - min);
            }
        }
    },
    bindings: {
        rawValue: {
            hook: 'range',
            type: 'value'
        }
    },
    events: {
        'change [data-hook=range]': 'handleChange'
    },
    handleChange(event) {
        const {max, min, stepCount=(max - min)} = this.model;
        const rawValue = parseInt(event.target.value);
        this.model.value = min + (rawValue * (max - min) / stepCount);
    }
});
