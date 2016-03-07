import View from 'ampersand-view';

export default View.extend({
    template: require('../templates/result.jade'),
    bindings: {
        'model.text': {
            type: 'value',
            hook: 'result-text'
        }
    },
    events: {
        'change [data-hook=result-text]': 'handleChange',
        'click [data-hook=copy-button]': 'copyText'
    },
    handleChange(event) {
        this.model.text = event.target.value;
    },
    copyText() {
        this.queryByHook('result-text').select();
        document.execCommand('copy');
    }
});
