import State from 'ampersand-state';

import replaceBackground from '../lib/postcss-replace-background';

function getCss() {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://raw.githubusercontent.com/akira02/Zero-Memo/master/plurk.css');
        xhr.responseType = 'text';

        xhr.onload = function() {
            resolve(xhr.response);
        };

        xhr.onerror = reject;

        xhr.send();
    });
}

export default State.extend({
    props: {
        text: 'string',
        urls: 'object'
    },
    initialize() {
        this.on('change:urls', _ => {
            getCss()
                .then(css => replaceBackground.process(css, this.urls))
                .then(css => this.text = css.toString());
        })
    }
});