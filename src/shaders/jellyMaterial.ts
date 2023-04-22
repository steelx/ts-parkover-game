export const jellyVertexShader = `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 worldViewProjection;
uniform vec3 cameraPosition;

uniform float time;
uniform vec3 moveDirection;

varying vec3 vNormal;
varying vec2 vUV;

float waveFunction(float x) {
    return sin(x * 10.0 + time * 3.0) * 0.05;
}

void main() {
    vec3 pos = position;

    // Add the wavy effect
    pos.y += waveFunction(pos.x + moveDirection.x);
    pos.z += waveFunction(pos.z + moveDirection.z);

    gl_Position = worldViewProjection * vec4(pos, 1.0);
    vNormal = normalize(vec3(worldViewProjection * vec4(normal, 0.0)));
    vUV = uv;
}
`;

export const jellyFragmentShader = `
precision highp float;

uniform vec3 diffuseColor;
uniform vec3 cameraPosition;

varying vec3 vNormal;
varying vec2 vUV;

void main() {
    vec3 light = normalize(vec3(0.0, 1.0, 0.5));
    float brightness = max(0.1, dot(vNormal, light));
    gl_FragColor = vec4(diffuseColor * brightness, 1.0);
}
`;
