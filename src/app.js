import 'babel-polyfill';

import app from 'ampersand-app';

import MainModel from './models/main';
import MainView from './views/main';

import Renderer from './models/renderer';

app.extend({
    init() {
        this.renderer = new Renderer();

        this.model = new MainModel({
            input: {
                id: 'timeline',
                name: '時間軸背景(原圖)'
            },
            outputs: [
                {
                    id: 'dashboard',
                    name: '資訊面板背景',
                    brightness: {
                        value: -0.5
                    },
                    blurSigma: {
                        value: 0.2
                    },
                    renderer: this.renderer
                },
                {
                    id: 'plurk',
                    name: '噗文背景',
                    brightness: {
                        value: 0.5
                    },
                    blurSigma: {
                        value: 0.2
                    },
                    renderer: this.renderer
                }
            ]
        });

        this.view = new MainView({
            model: this.model
        });

        this.view.render();

        document.body.appendChild(this.view.el);
    }
});

window.app = app;

app.init();