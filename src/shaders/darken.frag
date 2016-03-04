uniform sampler2D texture;

uniform highp vec2 shape;

uniform lowp float amount;

void main() {
    lowp vec4 color = texture2D(texture, vec2(gl_FragCoord) / shape);
    color.rgb *= amount;
    gl_FragColor = color;
}