uniform sampler2D texture;

uniform highp vec2 shape;

uniform lowp float target;

uniform lowp float amount;

void main() {
    lowp vec4 color = texture2D(texture, vec2(gl_FragCoord) / shape);
    color.rgb = mix(color.rgb, vec3(target), amount);
    gl_FragColor = color;
}
