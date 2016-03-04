const Promise = require('bluebird');

const createBuffer = require('gl-buffer');
const createFBO = require('gl-fbo');
const createShader = require('gl-shader');
const createTexture = require('gl-texture2d');

const shaderSource = {
    vertex:  require('./shaders/vertex-shader.vert'),
    lighten: require('./shaders/lighten.frag'),
    darken:  require('./shaders/darken.frag'),
    blurX:   require('./shaders/blurX.frag'),
    blurY:   require('./shaders/blurY.frag'),
    flipY:   require('./shaders/flipY.frag')
}

function clear(gl) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

const _brightness = Symbol('_brightness');
const _brightnessMode = Symbol('_brightnessMode');
const _blurPasses = Symbol('_blurPasses');

const _shaders = Symbol('_shaders');
const _fbos = Symbol('_fbos');

module.exports = class Renderer {
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
    blurPasses(value) {
        this[_blurPasses] = value;

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
    getShader(name) {
        if (this[_shaders][name]) return this[_shaders][name];
        let shader = createShader(
                this.gl,
                shaderSource.vertex,
                shaderSource[name]);
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

        const fbos = [];
        let state = 0;
        const nextFBO = _ => {
            state ^= 1;
            return fbos[state] = fbos[state] || createFBO(gl, this.shape, {depth: false});
        }

        if (this[_brightnessMode] != undefined) {
            console.log(`apply ${this[_brightnessMode]} ${this[_brightness]}`);
            const shader = this.getShader(this[_brightnessMode]);

            shader.bind();
            shader.uniforms.amount = this[_brightness];

            let fbo = nextFBO();

            this.applyFilter(texture, shader, fbo);

            texture = fbo.color[0];
        }

        if (this[_blurPasses]) {
            console.log(`apply blur * ${this[_blurPasses]} times`);

            const blurX = this.getShader('blurX');
            const blurY = this.getShader('blurY');

            let fbo1 = nextFBO();
            let fbo2 = nextFBO();

            for (let i = this[_blurPasses]; i > 0; i--) {
                this.applyFilter(texture, blurX, fbo1);
                this.applyFilter(fbo1.color[0], blurY, fbo2);

                texture = fbo2.color[0];
            }
        }

        this.applyFilter(texture, this.getShader('flipY'));

        if (fbos[0]) fbos[0].dispose();
        if (fbos[1]) fbos[1].dispose();

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
