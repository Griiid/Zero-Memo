const Promise = require('bluebird');

import createBuffer from 'gl-buffer';
import createShader from 'gl-shader';
import createTexture from 'gl-texture2d';

import FBOPair from './fbo-pair';
import makeBlurShader from './blur-shader';

const shaderSource = {
    vertex:  require('./shaders/vertex-shader.vert'),
    lighten: require('./shaders/lighten.frag'),
    darken:  require('./shaders/darken.frag'),
    flipY:   require('./shaders/flip-y.frag')
}

function clear(gl) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

const _brightness = Symbol('_brightness');
const _brightnessMode = Symbol('_brightnessMode');
const _blurSigma = Symbol('_blurSigma');

const _shaders = Symbol('_shaders');

export default class Renderer {
    constructor() {
        this.canvas = document.createElement('canvas');

        this.gl = this.canvas.getContext('webgl') ||
                  this.canvas.getContext('experimental-webgl');

        this.texture = null;

        this[_shaders] = {};

        clear(this.gl);

        this.buffer = createBuffer(this.gl, [
            -1.0,  1.0,
            -1.0, -1.0,
             1.0,  1.0,
             1.0,  1.0,
            -1.0, -1.0,
             1.0, -1.0
        ]);

    }
    brightness(value) {
        this[_brightness] = Math.abs(value);

        if (value === 0) {
            this[_brightnessMode] = null;
        } else if (value > 0) {
            this[_brightnessMode] = 'lighten';
        } else {
            this[_brightnessMode] = 'darken';
        }
        
        return this;
    }
    blurSigma(value) {
        this[_blurSigma] = value;

        return this;
    }
    image(image) {
        const gl = this.gl;
        const {width, height} = image;

        this.shape = [width, height];

        gl.canvas.width = width;
        gl.canvas.height = height;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
        gl.viewport(0, 0, width, height);

        clear(this.gl);

        this.texture = createTexture(gl, image);

        return this;
    }
    getShader(name, source=shaderSource[name]) {
        if (this[_shaders][name]) return this[_shaders][name];
        const shader = createShader(
                this.gl,
                shaderSource.vertex,
                source);
        shader.attributes.a_position.location = 0;
        return this[_shaders][name] = shader;
    }
    applyFilter(texture, shader, fbo) {
        const gl = this.gl;


        if (fbo == undefined) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
            fbo.bind();
        }

        shader.bind();

        this.buffer.bind();

        shader.uniforms.texture = texture.bind();

        shader.uniforms.shape = this.shape;

        texture.magFilter = texture.minFilter = gl.LINEAR;

        clear(this.gl);

        shader.attributes.a_position.pointer();

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }
    render() {
        const gl = this.gl;

        let texture = this.texture;

        const fboPair = new FBOPair(gl, this.shape, { depth: false });

        if (this[_brightnessMode] != undefined) {
            const shader = this.getShader(this[_brightnessMode]);

            shader.bind();
            shader.uniforms.amount = this[_brightness];

            const fbo = fboPair.next().value;

            this.applyFilter(texture, shader, fbo);

            texture = fbo.color[0];
        }

        if (this[_blurSigma]) {
            const sigma = this[_blurSigma];
            const source = makeBlurShader(sigma);
            const blurX = this.getShader(`blurX-${sigma}`, source.x);
            const blurY = this.getShader(`blurY-${sigma}`, source.y);

            const fbo1 = fboPair.next().value;
            const fbo2 = fboPair.next().value;

            this.applyFilter(texture, blurX, fbo1);
            this.applyFilter(fbo1.color[0], blurY, fbo2);

            texture = fbo2.color[0];
        }

        this.applyFilter(texture, this.getShader('flipY'));

        fboPair.dispose();

        gl.finish();

        return this;
    }
    toImage(format='image/jpeg') {
        return new Promise((resolve) => {
            if (this.canvas.toBlob) {
                this.canvas.toBlob(resolve, format);
            } else {
                resolve(this.canvas.toDataURL(format));
            }
        });
    }
}
