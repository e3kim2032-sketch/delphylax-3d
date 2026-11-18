import { useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { AbyssalEnvironment } from '../components/canvas/AbyssalEnvironment'
import { Effects } from '../components/canvas/Effects'
import { BoatParts, PinsContext, mm, BOAT_S as S } from '../components/canvas/DelphylaxModel'
import { sceneRefs } from '../components/canvas/sceneRefs'
import { useSiteStore } from '../store/useSiteStore'
import { live, sinceStep, SLIDE } from './live'

/**
 * The 3D stage behind the pitch deck. It reuses the site's boat model and water,
 * and adds what the pitch talks about: a camera that flies to each part, halo
 * rings on the highlighted part, the LiDAR on top, and the Delphylax Pod.
 *
 * World frame: the boat sits at the origin with its bow toward +X; boat-local
 * millimetres (x across, y along with the bow at -y, z up) map to world as
 * (-y, z, x) * S.
 */

type V3 = [number, number, number]
const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b)
const HOME_YAW = -Math.PI / 2

/* ------------------------------------------------------------------ */
/* Camera shots                                                         */
/* ------------------------------------------------------------------ */
interface Shot {
  pos: V3
  look: V3
  fov: number
  /** how far the picture is pushed to the right, as a fraction of the slide width */
  shift: number
  /** 0 above water .. 1 deep: tints fog and sky like the main site does */
  depth?: number
}

const WIDE: Shot = { pos: [4.8, 1.7, 6.6], look: [0, 0.2, 0], fov: 38, shift: 0.06 }

const HOW: Shot[] = [
  // overview
  { pos: [2.4, 1.4, 4.2], look: [0, 0.22, 0], fov: 36, shift: 0.24 },
  // 1 sonar: the float between the bows, with its pings spreading over the water ahead
  { pos: [2.35, 0.42, 1.25], look: [0.78, 0.0, 0.05], fov: 32, shift: 0.24 },
  // 2 LiDAR on top
  { pos: [1.9, 1.25, 1.75], look: [0.22, 0.5, 0], fov: 34, shift: 0.24 },
  // 3 heat sensor and searchlights in the bow bezel
  { pos: [2.55, 0.75, 1.1], look: [0.42, 0.34, 0], fov: 32, shift: 0.24 },
  // 4 brain: the exploded view, on the lifted ESP32 board
  { pos: [1.3, 1.75, 3.3], look: [-0.25, 1.05, 0.05], fov: 34, shift: 0.23 },
  // 5 thrusters: under the stern
  { pos: [-2.8, -0.5, 2.2], look: [-0.7, -0.14, 0], fov: 34, shift: 0.24, depth: 0.3 },
  // 6 hulls: high three-quarter view
  { pos: [2.3, 2.5, 3.4], look: [0, 0.02, 0], fov: 36, shift: 0.23 },
]

const POD: Shot[] = [
  { pos: [4.0, 1.3, 1.9], look: [0, 0.26, 0.28], fov: 33, shift: 0.25 },
  { pos: [3.7, 1.05, 2.3], look: [-0.25, 0.1, 0.62], fov: 32, shift: 0.25 },
]

const SHOTS: Record<number, Shot> = {
  [SLIDE.title]: { pos: [0.4, 1.15, 4.5], look: [0, 0.3, 0], fov: 36, shift: 0.265 },
  1: WIDE,
  2: { pos: [-4.6, 1.5, 6.2], look: [0, 0.2, 0], fov: 38, shift: -0.05 },
  [SLIDE.what]: { pos: [2.9, 1.15, 4.1], look: [0, 0.25, 0], fov: 36, shift: 0.27 },
  6: { pos: [-3.6, 2.2, 6.0], look: [0, 0.2, 0], fov: 38, shift: 0.05 },
  7: { pos: [5.6, 1.2, 4.6], look: [0, 0.2, 0], fov: 38, shift: -0.04 },
  8: { pos: [0.2, 3.4, 6.4], look: [0, 0.1, 0], fov: 38, shift: 0 },
  [SLIDE.society]: { pos: [3.3, 0.85, 4.4], look: [0, 0.25, 0], fov: 36, shift: 0.26 },
  10: { pos: [-5.2, 1.3, 5.2], look: [0, 0.2, 0], fov: 38, shift: 0.04 },
  11: { pos: [4.2, 2.6, 5.6], look: [0, 0.2, 0], fov: 38, shift: -0.05 },
  12: { pos: [-2.0, 1.1, 7.2], look: [0, 0.2, 0], fov: 38, shift: 0 },
  [SLIDE.thanks]: { pos: [-0.3, 1.15, 4.5], look: [0, 0.3, 0], fov: 36, shift: 0.265 },
}

function shotFor(slide: number, step: number): Shot {
  if (slide === SLIDE.how) return HOW[Math.min(step, HOW.length - 1)]
  if (slide === SLIDE.pod) return POD[Math.min(step, POD.length - 1)]
  return SHOTS[slide] ?? WIDE
}

function Director() {
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const cur = useRef({ fov: 36, shift: 0, ready: false })

  useFrame(({ camera, size, clock }, dt) => {
    const shot = shotFor(live.slide, live.step)
    const c = cur.current
    const snap = live.reduce || !c.ready
    const k = snap ? 1 : 1 - Math.exp(-dt * 2.3)
    c.ready = true

    tmp.set(...shot.pos)
    if (!live.reduce) {
      // a slow breathing drift so the picture is never frozen
      const t = clock.elapsedTime
      tmp.x += Math.sin(t * 0.13) * 0.12
      tmp.y += Math.sin(t * 0.21) * 0.04
      tmp.z += Math.cos(t * 0.13) * 0.08
    }
    pos.lerp(tmp, k)
    look.lerp(tmp.set(...shot.look), k)
    c.fov = THREE.MathUtils.lerp(c.fov, shot.fov, k)
    c.shift = THREE.MathUtils.lerp(c.shift, shot.shift, k)

    camera.position.copy(pos)
    camera.lookAt(look)

    // The composition is designed for the 16:9 slide frame. The canvas covers the
    // whole window, so the frustum is widened around that frame: nothing designed
    // is cropped and the water simply continues into the margins.
    const pc = camera as THREE.PerspectiveCamera
    const f = live.frame
    pc.fov = c.fov
    pc.aspect = 16 / 9
    pc.setViewOffset(f.w, f.h, -f.x - c.shift * f.w, -f.y, size.width, size.height)

    sceneRefs.depth01 = THREE.MathUtils.lerp(sceneRefs.depth01, shot.depth ?? 0, snap ? 1 : 1 - Math.exp(-dt * 3))
    sceneRefs.caPulse = 0
  })
  return null
}

/* ------------------------------------------------------------------ */
/* LiDAR puck on top of the shell (the pitch describes it)              */
/* ------------------------------------------------------------------ */
const LIDAR_AT: V3 = [0, -98, 198]

function Lidar() {
  const head = useRef<THREE.Group>(null)
  const beam = useRef<THREE.MeshBasicMaterial>(null)
  const disc = useRef<THREE.MeshBasicMaterial>(null)
  const fan = useRef<THREE.MeshBasicMaterial>(null)
  const [x, y, z] = LIDAR_AT
  useFrame((_, dt) => {
    const on = live.slide === SLIDE.how && live.step === 2
    if (head.current && !live.reduce) head.current.rotation.y += dt * (on ? 6 : 1.5)
    const k = live.reduce ? 1 : 1 - Math.exp(-dt * 5)
    if (beam.current) beam.current.opacity = THREE.MathUtils.lerp(beam.current.opacity, on ? 0.9 : 0, k)
    if (disc.current) disc.current.opacity = THREE.MathUtils.lerp(disc.current.opacity, on ? 0.12 : 0, k)
    if (fan.current) fan.current.opacity = THREE.MathUtils.lerp(fan.current.opacity, on ? 0.3 : 0, k)
  })
  const reach = 560 * S
  return (
    <group>
      {/* base */}
      <mesh position={mm(x, y, z + 10)}>
        <cylinderGeometry args={[28 * S, 30 * S, 20 * S, 32]} />
        <meshStandardMaterial color="#20262b" roughness={0.55} metalness={0.2} />
      </mesh>
      {/* spinning head */}
      <group ref={head} position={mm(x, y, z + 30)}>
        <mesh>
          <cylinderGeometry args={[26 * S, 26 * S, 20 * S, 32]} />
          <meshPhysicalMaterial color="#0b1015" roughness={0.15} metalness={0.4} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 26.5 * S]}>
          <boxGeometry args={[18 * S, 8 * S, 2 * S]} />
          <meshBasicMaterial color="#ff8a73" toneMapped={false} />
        </mesh>
        {/* the laser: one thin line sweeping all the way round */}
        <mesh position={[0, 0, reach / 2 + 27 * S]}>
          <boxGeometry args={[5 * S, 5 * S, reach]} />
          <meshBasicMaterial ref={beam} color="#ff8a73" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
        {/* a short fading fan behind the line, so the sweep reads in a still frame too */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[28 * S, reach + 27 * S, 24, 1, -Math.PI / 2, 0.7]} />
          <meshBasicMaterial ref={fan} color="#ff8a73" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      {/* the plane it scans */}
      <mesh position={mm(x, y, z + 30)} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[30 * S, reach + 27 * S, 64]} />
        <meshBasicMaterial ref={disc} color="#ff8a73" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* The boat                                                             */
/* ------------------------------------------------------------------ */
function PitchBoat({ boat }: { boat: RefObject<THREE.Group | null> }) {
  const yaw = useRef(HOME_YAW)
  const back = useRef(0)
  const lastPing = useRef(0)
  useFrame(({ clock }, dt) => {
    const g = boat.current
    if (!g) return
    const t = clock.elapsedTime
    const { slide, step, reduce } = live

    // the exploded view opens for the "brain" step only
    const ex = slide === SLIDE.how && step === 4 ? 1 : 0
    sceneRefs.exploded = reduce ? ex : THREE.MathUtils.lerp(sceneRefs.exploded, ex, 1 - Math.exp(-dt * 3.2))

    // it turns slowly on the title and thank-you slides, and comes back to bow-right elsewhere
    if ((slide === SLIDE.title || slide === SLIDE.thanks) && !reduce) yaw.current += dt * 0.32
    else {
      const home = HOME_YAW + Math.PI * 2 * Math.round((yaw.current - HOME_YAW) / (Math.PI * 2))
      yaw.current = reduce ? home : THREE.MathUtils.lerp(yaw.current, home, 1 - Math.exp(-dt * 3))
    }

    // after the Pod is in the water the robot backs away from it
    const away = slide === SLIDE.pod && step >= 1 ? smooth(sinceStep(), 1.9, 5.4) : 0
    back.current = reduce ? -2.9 * away : THREE.MathUtils.lerp(back.current, -2.9 * away, 1 - Math.exp(-dt * 5))

    const bob = reduce ? 0 : 1
    g.position.set(back.current, 0.02 + 16 * S + Math.sin(t * 0.9) * 0.025 * bob, 0)
    g.rotation.set(Math.sin(t * 0.55 + 1) * 0.015 * bob, yaw.current, Math.sin(t * 0.7) * 0.02 * bob)

    // searchlights: off while other parts are being shown, so step 3 can switch them on
    const lights = !(slide === SLIDE.how && step !== 3)
    if (useSiteStore.getState().lights !== lights) useSiteStore.setState({ lights })

    // the sonar float flashes while it is the highlighted part
    if (slide === SLIDE.how && step === 1 && !reduce && t - lastPing.current > 1.5) {
      lastPing.current = t
      sceneRefs.lastPing = t
    }
  })
  return (
    <group ref={boat} rotation={[0, HOME_YAW, 0]}>
      <PinsContext.Provider value={false}>
        <BoatParts />
      </PinsContext.Provider>
      <Lidar />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Halo rings on the highlighted part                                   */
/* ------------------------------------------------------------------ */
interface HaloDef {
  step: number
  at: V3
  r: number
  /** the same lift the part gets in the exploded view */
  explode?: V3
}
const HALOS: HaloDef[] = [
  { step: 1, at: mm(0, -277, -6), r: 0.17 },
  { step: 2, at: mm(LIDAR_AT[0], LIDAR_AT[1], LIDAR_AT[2] + 24), r: 0.15 },
  { step: 3, at: mm(0, -192, 141), r: 0.22 },
  { step: 4, at: mm(35, 30, 96), r: 0.15, explode: [0, 0.93, 0.214] },
  { step: 5, at: mm(-210, 310, -111), r: 0.17 },
  { step: 5, at: mm(210, 310, -111), r: 0.17 },
  { step: 6, at: mm(-210, -440, 0), r: 0.2 },
  { step: 6, at: mm(210, -440, 0), r: 0.2 },
]

function Halo({ def, boat }: { def: HaloDef; boat: RefObject<THREE.Group | null> }) {
  const g = useRef<THREE.Group>(null)
  const inner = useRef<THREE.MeshBasicMaterial>(null)
  const outer = useRef<THREE.MeshBasicMaterial>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const v = useMemo(() => new THREE.Vector3(), [])
  const o = useRef(0)
  useFrame(({ camera, clock }, dt) => {
    const grp = g.current
    const b = boat.current
    if (!grp || !b) return
    const on = live.slide === SLIDE.how && live.step === def.step
    o.current = live.reduce ? (on ? 1 : 0) : THREE.MathUtils.lerp(o.current, on ? 1 : 0, 1 - Math.exp(-dt * (on ? 2.2 : 8)))
    grp.visible = o.current > 0.01
    if (!grp.visible) return
    const k = sceneRefs.exploded
    v.set(def.at[0], def.at[1], def.at[2])
    if (def.explode) v.set(v.x + def.explode[0] * k, v.y + def.explode[1] * k, v.z + def.explode[2] * k)
    b.localToWorld(v)
    grp.position.copy(v)
    grp.quaternion.copy(camera.quaternion)
    const ph = live.reduce ? 0.5 : (clock.elapsedTime * 0.6) % 1
    if (pulse.current) pulse.current.scale.setScalar(1 + ph * 0.9)
    if (inner.current) inner.current.opacity = o.current
    if (outer.current) outer.current.opacity = o.current * (1 - ph) * 0.7
  })
  return (
    <group ref={g} scale={def.r} visible={false}>
      <mesh renderOrder={30}>
        <ringGeometry args={[0.91, 1, 72]} />
        <meshBasicMaterial ref={inner} color="#ff8a73" transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={pulse} renderOrder={30}>
        <ringGeometry args={[0.95, 1, 72]} />
        <meshBasicMaterial ref={outer} color="#ffb4a6" transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Sonar pings spreading ahead of the bow float (step 1)                 */
/* ------------------------------------------------------------------ */
function SonarWaves({ boat }: { boat: RefObject<THREE.Group | null> }) {
  const rings = useRef<(THREE.Mesh | null)[]>([])
  const v = useMemo(() => new THREE.Vector3(), [])
  const o = useRef(0)
  const N = 4
  useFrame(({ clock }, dt) => {
    const b = boat.current
    if (!b) return
    const on = live.slide === SLIDE.how && live.step === 1
    o.current = live.reduce ? (on ? 1 : 0) : THREE.MathUtils.lerp(o.current, on ? 1 : 0, 1 - Math.exp(-dt * 4))
    v.set(...mm(0, -277, -22))
    b.localToWorld(v)
    for (let i = 0; i < N; i++) {
      const m = rings.current[i]
      if (!m) continue
      m.visible = o.current > 0.01
      const ph = ((live.reduce ? 0 : clock.elapsedTime * 0.42) + i / N) % 1
      m.position.set(v.x, 0.07, v.z)
      m.scale.setScalar(0.12 + ph * 1.5)
      ;(m.material as THREE.MeshBasicMaterial).opacity = o.current * Math.min(1, ph * 6) * (1 - ph) * 0.9
    }
  })
  return (
    <>
      {Array.from({ length: N }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={8}
          visible={false}
        >
          <ringGeometry args={[0.955, 1, 64, 1, -Math.PI / 4, Math.PI / 2]} />
          <meshBasicMaterial color="#8fd0ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  )
}

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

/** where the Pod rides before the drop: on the rescue ring, starboard side of the deck */
const POD_DOCK: V3 = mm(150, 60, 158)
const FALL = 0.9 // seconds from the deck to the water

function Pod({ boat }: { boat: RefObject<THREE.Group | null> }) {
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
    const onSlide = live.slide === SLIDE.pod
    show.current = live.reduce ? (onSlide ? 1 : 0) : THREE.MathUtils.lerp(show.current, onSlide ? 1 : 0, 1 - Math.exp(-dt * 6))
    grp.visible = show.current > 0.01
    const drop = onSlide && live.step >= 1
    const e = drop ? sinceStep() : -1

    dock.set(...POD_DOCK)
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
      const idle = live.reduce ? 0 : 1
      grp.position.set(water.x, water.y - 0.1 * settle * Math.cos(s * 7) + Math.sin(t * 1.3) * 0.012 * idle, water.z)
      grp.rotation.set(Math.sin(t * 1.1) * 0.04 * idle, HOME_YAW + Math.sin(t * 0.4) * 0.08 * idle, Math.sin(t * 0.9) * 0.06 * idle + 0.35 * settle * Math.sin(s * 6))
      glow = smooth(s, 0, 0.9)
    }
    grp.scale.setScalar(Math.max(0.001, show.current))

    // it lights up when it touches the water
    const breathe = live.reduce ? 1 : 0.85 + 0.15 * Math.sin(t * 3)
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
      const ph = live.reduce ? (i + 1) / 4 : (s * 0.38 + i / 3) % 1
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

/* ------------------------------------------------------------------ */
/* Stage                                                                */
/* ------------------------------------------------------------------ */
function World() {
  const boat = useRef<THREE.Group>(null)
  return (
    <>
      <Director />
      {/* procedural reflection environment, same as the main site */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="ring" intensity={3} color="#8fb6d2" position={[0, 5, -4]} scale={8} />
        <Lightformer form="rect" intensity={1.6} color="#ff8a73" position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#7fb3d5" position={[6, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 1.5, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[2, 6, 3]} scale={3} />
        <Lightformer form="rect" intensity={0.8} color="#1e3a8a" position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
      </Environment>
      <AbyssalEnvironment />
      <PitchBoat boat={boat} />
      {HALOS.map((def, i) => (
        <Halo key={i} def={def} boat={boat} />
      ))}
      <SonarWaves boat={boat} />
      <Pod boat={boat} />
      <Effects />
    </>
  )
}

export default function Stage3D({ onError }: { onError: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 36, near: 0.1, far: 140, position: [0.4, 1.25, 5.0] }}
      onCreated={(state) => {
        const { gl } = state
        if (import.meta.env.DEV) (window as unknown as { __pitch?: unknown }).__pitch = { r3f: state, live }
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
        gl.setClearColor('#0f1519')
      }}
      onError={onError}
    >
      <World />
    </Canvas>
  )
}
