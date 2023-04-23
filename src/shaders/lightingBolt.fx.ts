
export const lightningBoltVertexShader = `
precision highp float;

attribute vec3 position;
uniform mat4 worldViewProjection;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
}
`

export const lightningBoltFragmentShader = `
precision highp float;

uniform vec3 color;

void main(void) {
    float glowIntensity = 10.0 - smoothstep(0.2, 0.5, gl_FragCoord.y);
    gl_FragColor = vec4(color, 1.0) * glowIntensity;
}
`