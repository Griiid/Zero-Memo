import State from 'ampersand-state';

export default Option = State.extend({
    props: {
        type: {
            type: 'string',
            required: true,
            setOnce: true
        },
        name: 'string',
        value: 'number',
        min: 'number',
        max: 'number',
        stepCount: {
            type: 'number',
            default: 100
        }
    }
});

export const BlurSigma = Option.extend({
    props: {
        type: {
            type: 'string',
            default: 'blur-sigma',
            setOnce: true
        },
        name: {
            type: 'string',
            default: '模糊'
        },
        min: {
            type: 'number',
            default: 0,
            setOnce: true
        },
        max: {
            type: 'number',
            default: 1,
            setOnce: true
        }
    }
});

export const Brightness = Option.extend({
    props: {
        type: {
            type: 'string',
            default: 'brightness',
            required: true,
            setOnce: true
        },
        name: {
            type: 'string',
            default: '亮度'
        },
        min: {
            type: 'number',
            default: -1,
            setOnce: true
        },
        max: {
            type: 'number',
            default: 1,
            setOnce: true
        }
    }
});
