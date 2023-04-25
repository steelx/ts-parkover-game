/**
 * @author https://github.com/RolandCsibrei/babylonjs-meshline/blob/main/src/MeshLine.ts
 */
import { Matrix, Ray, Vector3, Buffer, Geometry, VertexBuffer, Mesh, VertexData, Effect, ShaderMaterial, Scene, Color3, Vector2, Texture } from '@babylonjs/core'

export interface MeshLineParameters {
    points?: Vector3[] | Float32Array
    lineWidth?: number
    map?: Texture
    alphaMap?: Texture
    useMap?: boolean
    useAlphaMap?: boolean
    color?: Color3
    opacity?: number
    resolution?: Vector2
    sizeAttenuation?: boolean
    dashArray?: number
    dashOffset?: number
    dashRatio?: number
    useDash?: boolean
    visibility?: number
    alphaTest?: boolean
    repeat?: Vector2
    widthCallback?: WidthCallback
}

type WidthCallback = (pointWidth: number) => number


Effect.ShadersStore['meshLineVertexShader'] = [
    '',
    // THREE.ShaderChunk.logdepthbuf_pars_vertex,
    // THREE.ShaderChunk.fog_pars_vertex,
    '',
    'attribute vec3 previous;',
    'attribute vec3 next;',
    'attribute float side;',
    'attribute float width;',
    'attribute float counters;',
    'attribute vec2 uv;',
    'attribute vec3 position;',
    '',
    'uniform vec2 resolution;',
    'uniform float lineWidth;',
    'uniform vec3 color;',
    'uniform float opacity;',
    'uniform float sizeAttenuation;',
    'uniform mat4 projection;',
    'uniform mat4 view;',
    '',
    'varying vec2 vUV;',
    'varying vec4 vColor;',
    'varying float vCounters;',
    '',
    'vec2 fix( vec4 i, float aspect ) {',
    '',
    '    vec2 res = i.xy / i.w;',
    '    res.x *= aspect;',
    '	 vCounters = counters;',
    '    return res;',
    '',
    '}',
    '',
    'void main() {',
    '',
    '    float aspect = resolution.x / resolution.y;',
    '',
    '    vColor = vec4( color, opacity );',
    '    vUV = uv;',
    '',
    '    mat4 m = projection * view;',
    '    vec4 finalPosition = m * vec4( position, 1.0 );',
    '    vec4 prevPos = m * vec4( previous, 1.0 );',
    '    vec4 nextPos = m * vec4( next, 1.0 );',
    '',
    '    vec2 currentP = fix( finalPosition, aspect );',
    '    vec2 prevP = fix( prevPos, aspect );',
    '    vec2 nextP = fix( nextPos, aspect );',
    '',
    '    float w = lineWidth * width;',
    '',
    '    vec2 dir;',
    '    if( nextP == currentP ) dir = normalize( currentP - prevP );',
    '    else if( prevP == currentP ) dir = normalize( nextP - currentP );',
    '    else {',
    '        vec2 dir1 = normalize( currentP - prevP );',
    '        vec2 dir2 = normalize( nextP - currentP );',
    '        dir = normalize( dir1 + dir2 );',
    '',
    '        vec2 perp = vec2( -dir1.y, dir1.x );',
    '        vec2 miter = vec2( -dir.y, dir.x );',
    '        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );',
    '',
    '    }',
    '',
    '    //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;',
    '    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );',
    '    normal.xy *= .5 * w;',
    '    normal *= projection;',
    '    if( sizeAttenuation == 0. ) {',
    '        normal.xy *= finalPosition.w;',
    '        normal.xy /= ( vec4( resolution, 0., 1. ) * projection ).xy;',
    '    }',
    '',
    '    finalPosition.xy += normal.xy * side;',
    '',
    '    gl_Position = finalPosition;',
    '',
    //   THREE.ShaderChunk.logdepthbuf_vertex,
    //   THREE.ShaderChunk.fog_vertex && '    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
    //   THREE.ShaderChunk.fog_vertex,
    '}',
].join('\n')

Effect.ShadersStore['meshLineFragmentShader'] = [
    '',
    //   THREE.ShaderChunk.fog_pars_fragment,
    //   THREE.ShaderChunk.logdepthbuf_pars_fragment,
    '',
    'uniform sampler2D map;',
    'uniform sampler2D alphaMap;',
    'uniform float useMap;',
    'uniform float useAlphaMap;',
    'uniform float useDash;',
    'uniform float dashArray;',
    'uniform float dashOffset;',
    'uniform float dashRatio;',
    'uniform float visibility;',
    'uniform float alphaTest;',
    'uniform vec2 repeat;',
    '',
    'varying vec2 vUV;',
    'varying vec4 vColor;',
    'varying float vCounters;',
    '',
    'void main() {',
    '',
    //   THREE.ShaderChunk.logdepthbuf_fragment,
    '',
    '    vec4 c = vColor;',
    '    if( useMap == 1. ) c *= texture2D( map, vUV * repeat );',
    '    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;',
    '    if( c.a < alphaTest ) discard;',
    '    if( useDash == 1. ){',
    '        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));',
    '    }',
    '    gl_FragColor = c;',
    '    gl_FragColor.a *= step(vCounters, visibility);',
    '',
    //   THREE.ShaderChunk.fog_fragment,
    '}',
].join('\n')

export class MeshLineMaterial extends ShaderMaterial {
    private static _bton(bool?: boolean) {
        return bool ? 1 : 0
    }
    constructor(name: string, scene: Scene, parameters: MeshLineParameters) {
        super(
            name,
            scene,
            {
                vertex: 'meshLine',
                fragment: 'meshLine',
            },
            {
                attributes: ['uv', 'position', 'normal', 'previous', 'next', 'side', 'width', 'counters'],
                uniforms: [
                    'world',
                    'worldView',
                    'worldViewProjection',
                    'view',
                    'projection',
                    'lineWidth',
                    'map',
                    'useMap',
                    'alphaMap',
                    'useAlphaMap',
                    'color',
                    'opacity',
                    'resolution',
                    'sizeAttenuation',
                    'dashArray',
                    'dashOffset',
                    'dashRatio',
                    'useDash',
                    'visibility',
                    'alphaTest',
                    'repeat',
                ],
            },
        )

        this.setFloat('lineWidth', parameters.lineWidth ?? 1)
        if (parameters.alphaMap) {
            this.setTexture('alphaMap', parameters.alphaMap)
        }

        if (parameters.map) {
            this.setTexture('map', parameters.map)
        }

        this.setFloat('useMap', MeshLineMaterial._bton(parameters.useMap))
        this.setFloat('useAlphaMap', MeshLineMaterial._bton(parameters.useAlphaMap))
        this.setColor3('color', parameters.color ?? Color3.White())
        this.setFloat('opacity', parameters.opacity ?? 1)
        this.setVector2('resolution', parameters.resolution ?? new Vector2(1, 1))
        this.setFloat('sizeAttenuation', MeshLineMaterial._bton(parameters.sizeAttenuation))
        this.setFloat('dashArray', parameters.dashArray ?? 0)
        this.setFloat('dashOffset', parameters.dashOffset ?? 0)
        this.setFloat('dashRatio', parameters.dashRatio ?? 0.5)
        this.setFloat('useDash', MeshLineMaterial._bton(parameters.useDash))
        this.setFloat('visibility', parameters.visibility ?? 1)
        this.setFloat('alphaTest', MeshLineMaterial._bton(parameters.alphaTest))
        this.setVector2('repeat', parameters.repeat ?? new Vector2(1, 1))
    }

    // public get lineWidth() {
    //   return this.getEffect().getUniform('lineWidth')?._currentState as number
    // }

    // public set lineWidth(value: number) {
    //   this.getEffect().setFloat('lineWidth', value)
    // }
}
