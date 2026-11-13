import * as THREE from 'three'

export const MAX_PINGS = 6

export const sonarVertexShader = /* glsl */ `
uniform float uTime;
uniform float uTerrain;

varying vec3 vWorld;
varying vec2 vUv;
varying float vHeight;

#include <fog_pars_vertex>

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 pos = position;
  vec4 wp;
  #ifdef INSTANCED
    wp = modelMatrix * instanceMatrix * vec4(pos, 1.0);
    vHeight = 0.0;
  #else
    float h = 0.0;
    if (uTerrain > 0.5) {
      vec2 q = pos.xy * 0.33;
      h = fbm(q) * 1.9 + fbm(q * 3.3) * 0.28;
      float basin = smoothstep(1.5, 7.5, length(pos.xy - vec2(1.5, 0.0)));
      h *= basin;
      // riverbank: rise toward -x (behind the robot)
      h += smoothstep(-6.0, -16.0, pos.x) * 3.2;
      pos.z += h;
    }
    wp = modelMatrix * vec4(pos, 1.0);
    vHeight = h;
  #endif
  vWorld = wp.xyz;
  vUv = uv;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

export const sonarFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec4 uPings[${MAX_PINGS}];
uniform int uPingCount;
uniform vec3 uVictim;
uniform float uVictimRadius;
uniform float uReveal;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorRed;
uniform vec3 uBase;
uniform float uDepth;
uniform float uSpeed;
uniform float uSparsity;   // 1 = sparsity filter on
uniform float uRock;       // 1 = rock variant
uniform float uTerrain;

varying vec3 vWorld;
varying vec2 vUv;
varying float vHeight;

#include <fog_pars_fragment>

float hash3(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }

void main() {
  vec3 dx = dFdx(vWorld);
  vec3 dy = dFdy(vWorld);
  vec3 n = normalize(cross(dx, dy));
  if (!gl_FrontFacing) n = -n;

  vec3 keyDir = normalize(vec3(0.35, 1.0, 0.25));
  float diff = clamp(dot(n, keyDir), 0.0, 1.0);
  float rim = pow(1.0 - clamp(dot(n, normalize(cameraPosition - vWorld)), 0.0, 1.0), 3.0);

  vec3 col = uBase * (0.22 + 0.78 * diff);
  col += uColorA * rim * 0.18;

  // volumetric caustics near the surface
  vec2 p = vWorld.xz * 0.85;
  float c1 = sin(p.x * 3.1 + uTime * 0.9) * sin(p.y * 2.7 - uTime * 0.7);
  float c2 = sin((p.x + p.y) * 2.2 + uTime * 1.3);
  float caus = pow(max(0.0, c1 * 0.5 + 0.5) * max(0.0, c2 * 0.5 + 0.5), 2.2);
  col += mix(uColorA, vec3(0.6, 0.9, 1.0), 0.4) * caus * 0.5 * (1.0 - uDepth) * (1.0 - uRock);

  // tactical grid on the floor
  if (uTerrain > 0.5) {
    vec2 gp = vWorld.xz * 0.5;
    vec2 g = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);
    float grid = 1.0 - min(min(g.x, g.y), 1.0);
    col += uColorA * grid * 0.09 * (1.0 - smoothstep(0.0, 1.0, vHeight * 0.5));
  }

  // ---- sonar wavefronts ----
  float ring = 0.0;
  float hue = 0.0;
  float speckle = 0.0;
  for (int i = 0; i < ${MAX_PINGS}; i++) {
    if (i >= uPingCount) break;
    vec4 pg = uPings[i];
    float age = uTime - pg.w;
    if (age < 0.0) continue;
    float r = age * uSpeed;
    float d = distance(vWorld, pg.xyz);
    float w = 0.16 + age * 0.06;
    float band = exp(-pow((d - r) / w, 2.0));
    float decay = exp(-age * 0.42);

    // leading wavefront
    ring += band * decay * 1.2;
    hue += band * decay * 1.2 * (0.5 + 0.5 * sin(age * 2.2));

    // trailing interference rings (blue/pink alternate), thin and fading
    float behind = step(d, r) * max(0.0, 1.0 - (r - d) / 1.8);
    float stripes = pow(0.5 + 0.5 * sin(d * 14.0 - age * 6.0), 3.0);
    float wake = behind * stripes * decay * 0.28;
    ring += wake;
    hue += wake * step(0.5, fract(d * 0.9 + 0.2));

    // clutter speckle — energy-spread returns that the sparsity filter rejects
    float sp = step(d, r) * exp(-(r - d) * (uSparsity > 0.5 ? 2.4 : 0.55)) * decay;
    vec3 cellId = floor(vWorld * 16.0 + float(i));
    float cell = hash3(cellId);
    float bright = 0.4 + 0.6 * hash3(cellId + 7.1);
    speckle += sp * step(uSparsity > 0.5 ? 0.992 : 0.955, cell) * bright * (uRock > 0.5 ? 1.6 : 0.6);
  }
  ring = clamp(ring, 0.0, 1.6);
  float hueMix = clamp(hue / max(ring, 0.001), 0.0, 1.0);
  vec3 ringCol = mix(uColorA, uColorB, hueMix);
  col += ringCol * ring * (uRock > 0.5 ? 1.15 : 1.45);
  col += mix(uColorB, vec3(1.0), 0.35) * clamp(speckle, 0.0, 1.0) * 1.6;

  // ---- victim silhouette reveal (terrain only) ----
  if (uTerrain > 0.5) {
    float dv = distance(vWorld.xz, uVictim.xz);
    float sil = 1.0 - smoothstep(uVictimRadius * 0.55, uVictimRadius, dv);
    float halo = exp(-dv / (uVictimRadius * 1.9));
    float pulse = 0.85 + 0.15 * sin(uTime * 6.0);
    col += uColorRed * (sil * 1.3 + halo * 0.9) * uReveal * pulse;
  }

  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}
`

export function createSonarUniforms(opts: { rock?: boolean; terrain?: boolean } = {}) {
  const pings: THREE.Vector4[] = []
  for (let i = 0; i < MAX_PINGS; i++) pings.push(new THREE.Vector4(0, 0, 0, -100))
  return {
    uTime: { value: 0 },
    uPings: { value: pings },
    uPingCount: { value: 0 },
    uVictim: { value: new THREE.Vector3(5.2, -2.05, -1.9) },
    uVictimRadius: { value: 0.9 },
    uReveal: { value: 0 },
    uColorA: { value: new THREE.Color('#4dd4c6') },
    uColorB: { value: new THREE.Color('#eafffc') },
    uColorRed: { value: new THREE.Color('#ff1f4b') },
    uBase: { value: new THREE.Color(opts.rock ? '#1f2a31' : '#0d171e') },
    uDepth: { value: 0 },
    uSpeed: { value: 3.4 },
    uSparsity: { value: 1 },
    uRock: { value: opts.rock ? 1 : 0 },
    uTerrain: { value: opts.terrain ? 1 : 0 },
  }
}

export type SonarUniforms = ReturnType<typeof createSonarUniforms>

export function createSonarMaterial(opts: { rock?: boolean; terrain?: boolean; instanced?: boolean } = {}) {
  const uniforms = createSonarUniforms(opts)
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, uniforms]),
    vertexShader: sonarVertexShader,
    fragmentShader: sonarFragmentShader,
    fog: true,
    defines: opts.instanced ? { INSTANCED: '' } : {},
    side: THREE.FrontSide,
  })
  // UniformsUtils.merge clones objects; re-point to our typed uniforms for convenience.
  return { material: mat, uniforms: mat.uniforms as unknown as SonarUniforms & { fogColor: { value: THREE.Color } } }
}
