import 'babel-polyfill';

const Promise = require('bluebird');
import $ from 'jquery';

import Renderer from './renderer';
import ImageLoader from './image-loader';
import replaceBackground from './postcss-replace-background';

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
        xhr.setRequestHeader('Authorization', 'Client-ID f28cb80465f9e25');

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

const updatePreview = (function() {
    const needRevoke = {};
    return function updatePreview(key, image) {
        if (needRevoke[key] != null) {
            URL.revokeObjectURL(needRevoke[key]);
            needRevoke[key] = null;
        }
        if (image instanceof Blob) {
            image = URL.createObjectURL(image);
            needRevoke[key] = image;
        }
        const elements = document.getElementsByClassName(`background-${key}`);
        Array.prototype.forEach.call(elements, element => {
            element.style.backgroundImage = `url(${image})`;
        });
    }
})();


const textarea = document.getElementById("result");

$('#image-input-type').change(function() {
    $('#image-input').attr('type', this.value);
});

let waitForUpload = null;

$('#upload').click(() => {
    if (waitForUpload == null)
        return;
    const images = waitForUpload;
    waitForUpload = null;
    $('#upload').prop('disabled', true);
    const urls = {};
    const keys = ['timeline', 'dashboard', 'plurk'];
    Promise.map(keys, key => uploadImage(images[key]).then(url => { urls[key] = url; }))
        .then(getCss)
        .then(css => replaceBackground.process(css, urls))
        .then(css => { textarea.value = css; })
        .catch(err => alert('上傳失敗'));
});

const renderer = new Renderer();

$('#form').submit(function(event) {
    event.preventDefault();

    const images = {};
    const setImage = key => image => {
      images[key] = image;
      updatePreview(key, image);
    }

    const loader = new ImageLoader();

    getUrlInput($('#image-input')[0])
        .tap(setImage('timeline'))
        .then(loader.load.bind(loader))
        .then(renderer.image.bind(renderer))
        .then(renderer =>
            Promise.map(['dashboard', 'plurk'], key =>
                renderer
                    .brightness(getBrightness(key))
                    .blurSigma(getBlurSigma(key) * Math.min.apply(Math, renderer.shape) / 200)
                    .render()
                    .toImage()
                    .then(setImage(key))
            )
        )
        .then(() => {
            waitForUpload = images;
            $('#upload').prop('disabled', false);
        })
        .then(() => alert('好惹'))
        .catch(err => {
            console.error(err);
            alert('☆生☆成☆大☆失☆敗☆');
        });
});

$('#copy').click(() => {
    textarea.select();
    document.execCommand("copy");
});

