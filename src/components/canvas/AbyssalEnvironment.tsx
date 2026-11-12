import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneRefs } from './sceneRefs'

/* ---------------- Water surface ---------------- */

const waterVert = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vWave;
void main(){
  vec3 p = position;
  float w = sin(p.x*1.3 + uTime*0.9)*0.06 + sin(p.y*1.7 - uTime*1.2)*0.05 + sin((p.x+p.y)*0.6 + uTime*0.5)*0.08;
  p.z += w;
  vWave = w;
  vec4 wp = modelMatrix * vec4(p,1.0);
  vWorld = wp.xyz;
  // approximate normal via finite difference
  float e = 0.08;
  float wx = sin((p.x+e)*1.3 + uTime*0.9)*0.06 + sin(p.y*1.7 - uTime*1.2)*0.05 + sin((p.x+e+p.y)*0.6 + uTime*0.5)*0.08;
  float wy = sin(p.x*1.3 + uTime*0.9)*0.06 + sin((p.y+e)*1.7 - uTime*1.2)*0.05 + sin((p.x+p.y+e)*0.6 + uTime*0.5)*0.08;
  vec3 n = normalize(vec3(-(wx-w)/e, -(wy-w)/e, 1.0));
  vNormalW = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`
const waterFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uSky;
uniform vec3 uHorizon;
uniform float uDepth;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vWave;
void main(){
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNormalW);
  bool fromBelow = dot(N, V) < 0.0;
  if (fromBelow) N = -N;
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  vec3 R = reflect(-V, N);
  vec3 sky = mix(uHorizon, uSky, clamp(R.y*1.6, 0.0, 1.0));
  vec3 col = mix(uDeep, sky, fres*0.85 + 0.1);
  // specular from a "moon"
  vec3 L = normalize(vec3(-0.4, 0.8, 0.3));
  float spec = pow(max(dot(R, L), 0.0), 120.0);
  col += vec3(1.0, 0.9, 0.95) * spec * 0.9;
  // ripples brightening
  col += uSky * 0.08 * smoothstep(0.08, 0.14, vWave);
  float alpha = fromBelow ? 0.72 : 0.9;
  gl_FragColor = vec4(col, alpha);
}
`

function WaterSurface() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#0d2638') },
      uSky: { value: new THREE.Color('#2c4a60') },
      uHorizon: { value: new THREE.Color('#3b3244') },
      uDepth: { value: 0 },
    }),
    [],
  )
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uDepth.value = sceneRefs.depth01
    if (mesh.current) mesh.current.position.y = 0.02
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} renderOrder={5}>
      <planeGeometry args={[90, 90, 90, 90]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={waterVert}
        fragmentShader={waterFrag}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ---------------- Sky / abyss dome ---------------- */

const domeVert = /* glsl */ `
varying vec3 vPos;
void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const domeFrag = /* glsl */ `
uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom; uniform float uDepth; uniform float uTime;
varying vec3 vPos;
void main(){
  float h = normalize(vPos).y;
  vec3 c = h > 0.0 ? mix(uMid, uTop, smoothstep(0.0, 0.7, h)) : mix(uMid, uBottom, smoothstep(0.0, -0.6, h));
  // soft light shafts from above when underwater
  float shaft = 0.0;
  if (h > 0.1) {
    float a = atan(vPos.x, vPos.z);
    shaft = pow(0.5 + 0.5*sin(a*14.0 + uTime*0.15), 6.0) * smoothstep(0.1, 0.8, h) * 0.35;
  }
  c += vec3(0.3, 0.55, 0.95) * shaft * uDepth;
  gl_FragColor = vec4(c, 1.0);
}
`

function Dome() {
  const u = useMemo(
    () => ({
      uTop: { value: new THREE.Color('#0f1519') },
      uMid: { value: new THREE.Color('#1b2a36') },
      uBottom: { value: new THREE.Color('#070b0f') },
      uDepth: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  )
  const sky = useMemo(
    () => ({
      top: new THREE.Color('#0f1519'),
      mid: new THREE.Color('#223240'),
      bottom: new THREE.Color('#070b0f'),
    }),
    [],
  )
  const deep = useMemo(
    () => ({
      top: new THREE.Color('#163a52'),
      mid: new THREE.Color('#0c1f2b'),
      bottom: new THREE.Color('#04090d'),
    }),
    [],
  )
  useFrame(({ clock }) => {
    const d = sceneRefs.depth01
    u.uDepth.value = d
    u.uTime.value = clock.elapsedTime
    u.uTop.value.copy(sky.top).lerp(deep.top, d)
    u.uMid.value.copy(sky.mid).lerp(deep.mid, d)
    u.uBottom.value.copy(sky.bottom).lerp(deep.bottom, d)
  })
  return (
    <mesh scale={[60, 60, 60]}>
      <sphereGeometry args={[1, 32, 24]} />
      <shaderMaterial uniforms={u} vertexShader={domeVert} fragmentShader={domeFrag} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}

/* ---------------- Suspended sediment ---------------- */

const partVert = /* glsl */ `
uniform float uTime; uniform float uDepth; uniform float uPixelRatio;
attribute float aSize; attribute float aPhase;
varying float vAlpha;
void main(){
  vec3 p = position;
  p.x += sin(uTime*0.25 + aPhase)*0.35;
  p.y += sin(uTime*0.18 + aPhase*1.7)*0.25 + uTime*0.02;
  p.y = mod(p.y + 6.0, 12.0) - 6.0;
  p.z += cos(uTime*0.22 + aPhase*0.6)*0.3;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);
  vAlpha = (0.25 + 0.75*uDepth) * smoothstep(-6.0, -1.0, p.y);
  gl_Position = projectionMatrix * mv;
}
`
const partFrag = /* glsl */ `
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(vec3(0.62, 0.72, 0.8), a*0.5);
}
`

function Sediment({ count = 1800 }: { count?: number }) {
  const { gl } = useThree()
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26
      size[i] = 0.6 + Math.random() * 2.2
      phase[i] = Math.random() * Math.PI * 2
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return g
  }, [count])
  const u = useMemo(
    () => ({ uTime: { value: 0 }, uDepth: { value: 0 }, uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } }),
    [gl],
  )
  useFrame(({ clock }) => {
    u.uTime.value = clock.elapsedTime
    u.uDepth.value = sceneRefs.depth01
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial uniforms={u} vertexShader={partVert} fragmentShader={partFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* ---------------- Lighting + fog ---------------- */

function Atmosphere() {
  const { scene } = useThree()
  const fog = useMemo(() => new THREE.FogExp2('#0c1b26', 0.03), [])
  const key = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.PointLight>(null)
  useMemo(() => {
    scene.fog = fog
  }, [scene, fog])
  useFrame(({ clock }) => {
    const d = sceneRefs.depth01
    fog.density = 0.028 + d * 0.075
    fog.color.set('#12283a').lerp(new THREE.Color('#070f16'), d)
    if (key.current) key.current.intensity = 2.2 - d * 1.2
    if (rim.current) rim.current.intensity = 3.2 + Math.sin(clock.elapsedTime * 1.3) * 0.9
  })
  return (
    <>
      <ambientLight intensity={0.4} color="#9fb8cc" />
      <hemisphereLight args={['#6f94b3', '#101820', 0.6]} />
      <directionalLight ref={key} position={[3, 6, 2]} intensity={2.2} color="#c7dcff" />
      <pointLight ref={rim} position={[-3, 1.2, -2.5]} intensity={3.2} color="#ff6fae" distance={10} decay={2} />
      <pointLight position={[2.5, -1.2, 2.5]} intensity={3} color="#3b9eff" distance={10} decay={2} />
    </>
  )
}

export function AbyssalEnvironment() {
  return (
    <>
      <Atmosphere />
      <Dome />
      <WaterSurface />
      <Sediment />
    </>
  )
}
