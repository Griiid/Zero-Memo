require('babel-polyfill');

const $ = require('jquery');
const Promise = require('bluebird');

const Renderer = require('./renderer');
const ImageLoader = require('./image-loader');
const replaceBackground = require('./postcss-replace-background');

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

function uploadImage(image) {
    return new Promise(function(resolve, reject) {
        if (typeof image == 'string' && image.startsWith('data:')) {
            image = image.slice(image.indexOf(',') + 1);
        }
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.imgur.com/3/image.json');
        xhr.responseType = 'json';
        xhr.setRequestHeader('Authorization', 'Client-ID f2c48785e9ed652');

        xhr.onload = _ => xhr.response.success ?
            resolve(xhr.response.data.link) :
            reject(new Error(xhr.response.data.error));

        xhr.onerror = reject;
        
        const data = new FormData();
        data.append('image', image);
        xhr.send(data);
    });
}

function getUrlInput(input) {
    return new Promise(function(resolve, reject) {
        if (input.type === 'url') {
            resolve(input.value);
        } else if (input.type === 'file') {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = _ => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }
    });
}

function getBrightness(key) {
    return parseInt(document.getElementById(key + '-brightness').value) / 100;
}

function getBlurSigma(key) {
    return parseInt(document.getElementById(key + '-blur-sigma').value) / 100;
}

const textarea = document.getElementById("result");

$('#image-input-type').change(function() {
    $('#image-input').attr('type', this.value);
});

const renderer = new Renderer();

$('#form').submit(function(event) {
    event.preventDefault();

    const images = {};
    const setImage = key => value => images[key] = value;

    const loader = new ImageLoader();

    getUrlInput($('#image-input')[0])
        .tap(url => uploadImage(url).then(setImage('timeline')))
        .then(loader.load.bind(loader))
        .then(renderer.image.bind(renderer))
        .then(renderer =>
            Promise.map(['dashboard', 'plurk'], key =>
                renderer
                    .brightness(getBrightness(key))
                    .blurSigma(getBlurSigma(key))
                    .render()
                    .toImage()
                    .then(uploadImage)
                    .then(setImage(key))
            )
        )
        .then(getCss)
        .then(css => replaceBackground.process(css, images))
        .then(css => {
            textarea.value = css;
            alert('好惹');
        })
        .catch(err => {
            console.error(err);
            alert('☆生☆成☆大☆失☆敗☆');
        });
});

$('#copy').click(() => {
    textarea.select();
    document.execCommand("copy");
});
