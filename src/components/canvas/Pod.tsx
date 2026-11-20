import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneRefs, MM } from './sceneRefs'

type V3 = [number, number, number]
const S = MM
/** boat millimetres (x across, y along with the bow at -y, z up) to boat-local scene units */
const mm = (x: number, y: number, z: number): V3 => [x * S, z * S, y * S]
const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b)
/** the boat's resting yaw: bow toward +X */
const HOME_YAW = -Math.PI / 2

/* ------------------------------------------------------------------ */
/* The Delphylax Pod: a dolphin-shaped float                            */
/* ------------------------------------------------------------------ */
const POD_LEN = 300 // mm

function podBodyGeometry() {
  // radius (mm) along the body, beak tip first
  const profile: [number, number][] = [
    [0.6, 0],
    [6, 5],
    [9, 24],
    [12, 42],
    [27, 58],
    [37, 84],
    [44, 122],
    [45, 152],
    [40, 192],
    [30, 232],
    [18, 266],
    [10, 290],
    [7, POD_LEN],
  ]
  const curve = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r * S, y * S)))
  const g = new THREE.LatheGeometry(curve.getPoints(60), 40)
  g.rotateX(Math.PI / 2) // length along +z, beak first
  g.translate(0, 0, (-POD_LEN / 2) * S)
  g.scale(0.9, 1, 1)
  return g
}
function podFinGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.lineTo(70, 0)
  s.lineTo(64, 50)
  s.quadraticCurveTo(52, 60, 38, 52)
  s.lineTo(0, 0)
  const g = new THREE.ExtrudeGeometry(s, { depth: 8, bevelEnabled: true, bevelThickness: 2, bevelSize: 2, bevelSegments: 2 })
  g.translate(0, 0, -4)
  g.scale(S, S, S)
  g.rotateY(-Math.PI / 2) // shape x runs toward the tail
  return g
}
function podFlukeGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.quadraticCurveTo(34, 2, 66, 40)
  s.quadraticCurveTo(30, 26, 0, 30)
  s.quadraticCurveTo(-30, 26, -66, 40)
  s.quadraticCurveTo(-34, 2, 0, 0)
  const g = new THREE.ExtrudeGeometry(s, { depth: 7, bevelEnabled: true, bevelThickness: 2, bevelSize: 2, bevelSegments: 2 })
  g.translate(0, 0, -3.5)
  g.scale(S, S, S)
  g.rotateX(Math.PI / 2) // lies flat, shape y runs toward the tail
  return g
}
function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,214,196,1)')
    grad.addColorStop(0.25, 'rgba(255,150,125,0.55)')
    grad.addColorStop(1, 'rgba(255,138,115,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** where the Pod rides before the drop: on the rescue ring, starboard side of the deck (boat mm) */
export const POD_DOCK_MM: V3 = [150, 60, 158]
const POD_DOCK: V3 = mm(...POD_DOCK_MM)
/** in the exploded view the Pod lifts off the deck and out to starboard, like the other parts */
export const POD_EXPLODE: V3 = [0.5, 0.55, 0.1]

/** What the scene tells the Pod each frame. */
export interface PodControl {
  /** draw it at all */
  show: boolean
  /** false: it rides on the deck. true: it has been dropped */
  dropped: boolean
  /** seconds since the drop */
  since: number
  /** reduced motion: no bobbing, final state only */
  reduce: boolean
}
const FALL = 0.9 // seconds from the deck to the water

/**
 * The Delphylax Pod: a dolphin-shaped float. It rides on the deck, and when it is
 * dropped it arcs into the water, lights up and floats while the boat backs away.
 * It lives in world space (not inside the boat group) so it stays put when the boat leaves.
 */
export function Pod({ boat, control }: { boat: RefObject<THREE.Group | null>; control: () => PodControl }) {
  const g = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const halo = useRef<THREE.Sprite>(null)
  const ripples = useRef<(THREE.Mesh | null)[]>([])
  const body = useMemo(podBodyGeometry, [])
  const fin = useMemo(podFinGeometry, [])
  const fluke = useMemo(podFlukeGeometry, [])
  const tex = useMemo(glowTexture, [])
  const skin = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f3ede1', roughness: 0.35, clearcoat: 0.6, emissive: '#ff9478', emissiveIntensity: 0 }), [])
  const trim = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ff7f66', roughness: 0.42, clearcoat: 0.6, emissive: '#ff7f66', emissiveIntensity: 0 }), [])
  const dock = useMemo(() => new THREE.Vector3(), [])
  const water = useMemo(() => new THREE.Vector3(), [])
  const start = useMemo(() => new THREE.Vector3(), [])
  const show = useRef(0)
  const released = useRef(false)

  useFrame(({ clock }, dt) => {
    const grp = g.current
    const b = boat.current
    if (!grp || !b) return
    const t = clock.elapsedTime
    const c = control()
    show.current = c.reduce ? (c.show ? 1 : 0) : THREE.MathUtils.lerp(show.current, c.show ? 1 : 0, 1 - Math.exp(-dt * 6))
    grp.visible = show.current > 0.01
    const drop = c.show && c.dropped
    const e = drop ? c.since : -1

    const k = sceneRefs.exploded
    dock.set(POD_DOCK[0] + POD_EXPLODE[0] * k, POD_DOCK[1] + POD_EXPLODE[1] * k, POD_DOCK[2] + POD_EXPLODE[2] * k)
    b.localToWorld(dock)
    if (!drop) released.current = false
    else if (!released.current) {
      // remember where it left the deck and where it will float
      released.current = true
      start.copy(dock)
      start.x -= b.position.x // measured from where the boat floats, even if it has already backed off
      water.set(start.x + 0.04, 0.035, start.z + 0.66)
    }

    let glow = 0
    grp.rotation.order = 'YXZ'
    if (!drop) {
      grp.position.copy(dock)
      grp.rotation.set(0, b.rotation.y, 0)
    } else if (e < FALL) {
      const u = e / FALL
      grp.position.set(
        THREE.MathUtils.lerp(start.x, water.x, u),
        start.y + (water.y - start.y) * u * u + Math.sin(Math.PI * u) * 0.14,
        THREE.MathUtils.lerp(start.z, water.z, u * (2 - u)),
      )
      grp.rotation.set(Math.sin(Math.PI * u) * 0.2, HOME_YAW, Math.sin(Math.PI * u) * 0.8)
    } else {
      const s = e - FALL
      const settle = Math.exp(-Math.min(s, 20) * 2.2)
      const idle = c.reduce ? 0 : 1
      grp.position.set(water.x, water.y - 0.1 * settle * Math.cos(s * 7) + Math.sin(t * 1.3) * 0.012 * idle, water.z)
      grp.rotation.set(Math.sin(t * 1.1) * 0.04 * idle, HOME_YAW + Math.sin(t * 0.4) * 0.08 * idle, Math.sin(t * 0.9) * 0.06 * idle + 0.35 * settle * Math.sin(s * 6))
      glow = smooth(s, 0, 0.9)
    }
    grp.scale.setScalar(Math.max(0.001, show.current))

    // it lights up when it touches the water
    const breathe = c.reduce ? 1 : 0.85 + 0.15 * Math.sin(t * 3)
    skin.emissiveIntensity = glow * 0.8 * breathe
    trim.emissiveIntensity = glow * 1.2 * breathe
    if (light.current) light.current.intensity = glow * 1.8 * breathe
    if (halo.current) {
      halo.current.material.opacity = glow * 0.42 * breathe * show.current
      halo.current.scale.setScalar(1.15 + 0.12 * breathe)
    }
    for (let i = 0; i < 3; i++) {
      const m = ripples.current[i]
      if (!m) continue
      const s = e - FALL
      m.visible = drop && s > 0 && grp.visible
      if (!m.visible) continue
      const ph = c.reduce ? (i + 1) / 4 : (s * 0.38 + i / 3) % 1
      m.position.set(water.x, 0.045, water.z)
      m.scale.setScalar(0.16 + ph * 0.9)
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.55 * Math.max(glow, 0.3)
    }
  })

  return (
    <>
      <group ref={g} visible={false}>
        <mesh geometry={body} material={skin} />
        {/* dorsal fin */}
        <mesh geometry={fin} material={trim} position={[0, 40 * S, -34 * S]} />
        {/* tail flukes */}
        <mesh geometry={fluke} material={trim} position={[0, 0, (POD_LEN / 2 - 20) * S]} />
        {/* flippers */}
        {[-1, 1].map((side) => (
          <mesh key={side} material={trim} position={[side * 40 * S, -20 * S, -50 * S]} rotation={[0.35, side * -0.35, side * -0.75]} scale={[26 * S, 5 * S, 44 * S]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
        {/* eyes */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 24 * S, 10 * S, -86 * S]}>
            <sphereGeometry args={[4 * S, 10, 10]} />
            <meshBasicMaterial color="#0f1519" />
          </mesh>
        ))}
        <pointLight ref={light} color="#ff9d85" intensity={0} distance={5} decay={1.6} position={[0, 0.12, 0]} />
        <sprite ref={halo} renderOrder={25}>
          <spriteMaterial map={tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      </group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            ripples.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
          renderOrder={8}
        >
          <ringGeometry args={[0.94, 1, 64]} />
          <meshBasicMaterial color="#ffb4a6" transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}
