uniform sampler2D texture;

uniform highp vec2 shape;

void main() {
    highp vec2 coord = vec2(gl_FragCoord) / shape;
    gl_FragColor = texture2D(texture, vec2(coord.x, 1.0 - coord.y));
}