uniform sampler2D texture;

uniform highp vec2 shape;

void main() {
    highp vec2 coord = vec2(gl_FragCoord) / shape;

    lowp vec4 color = texture2D(texture, coord) * 0.2270270270;
    color += texture2D(texture, coord - vec2(1.3846153846, 0.0) / shape) * 0.3162162162;
    color += texture2D(texture, coord + vec2(1.3846153846, 0.0) / shape) * 0.3162162162;
    color += texture2D(texture, coord - vec2(3.2307692308, 0.0) / shape) * 0.0702702703;
    color += texture2D(texture, coord + vec2(3.2307692308, 0.0) / shape) * 0.0702702703;

    gl_FragColor = color;
}