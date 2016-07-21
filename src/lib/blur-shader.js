function* weights(sigma) {
    const tmp1 = 1 / Math.sqrt(Math.PI * 2 * Math.pow(sigma, 2));

    const tmp2 = -1 / (2 * Math.pow(sigma, 2));

    for (let offset = 0; ; offset++) {
        let weight = tmp1 * Math.pow(Math.E,  Math.pow(offset, 2) * tmp2);
        if (offset === 0) weight /= 2;

        yield { offset,  weight };
    }
}

function* optimize(weights) {
    for (;;) {
        const a = weights.next().value;
        const b = weights.next().value;

        const weight = a.weight + b.weight;

        const offset = (a.offset * a.weight + b.offset * b.weight) / weight;

        yield { offset,  weight };
    }
}

function generateGlsl(weights, maxRadius) {
    const result = {};
    result.x = result.y = `
        uniform sampler2D texture;

        uniform highp vec2 shape;

        void main() {
            highp vec2 coord = vec2(gl_FragCoord) / shape;
            lowp vec4 color = vec4(0.0);
    `;
    for (let { weight, offset } of weights) {
        if (offset > maxRadius) break;
        result.x += `
            color += pow(texture2D(texture, coord - vec2(${ offset }, 0.0) / shape), 2) * ${weight};
            color += pow(texture2D(texture, coord + vec2(${ offset }, 0.0) / shape), 2) * ${weight};
        `;
        result.y += `
            color += pow(texture2D(texture, coord - vec2(0.0, ${ offset }) / shape), 2) * ${weight};
            color += pow(texture2D(texture, coord + vec2(0.0, ${ offset }) / shape), 2) * ${weight};
        `;
    }
    result.x += `
            gl_FragColor = sqrt(color);
        }
    `;
    result.y += `
            gl_FragColor = sqrt(color);
        }
    `;
    return result;
}

export default function makeBlurShader(sigma, maxRadius=Math.ceil(sigma * 3)) {
    return generateGlsl(optimize(weights(sigma)), maxRadius);
}
