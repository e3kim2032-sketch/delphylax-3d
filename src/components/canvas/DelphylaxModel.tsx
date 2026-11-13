import { useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteStore } from '../../store/useSiteStore'
import { HOW_IT_WORKS, type SubsystemId } from '../../data/research'
import { sceneRefs, MM } from './sceneRefs'

/**
 * DELPHYLAX — procedural model of the real boat, ported from the design
 * (boat coords in mm: x across, y along with the bow at -y, z up).
 * Inside <Boat/> we use three.js local coords: x across, y up, z along (bow = -z).
 * The whole group is yawed so the bow points at +X in the scene.
 */
const S = MM
const HX = 210 // pipe centre offset (mm) — pipes 420 mm apart
const PR = 57 // pipe radius (114 mm diameter)
const PL = 760 // pipe length
const SLEEVE_R = 60.6

const mm = (x: number, y: number, z: number): [number, number, number] => [x * S, z * S, y * S]

/* ------------------------------------------------------------------ */
/* Materials                                                            */
/* ------------------------------------------------------------------ */
function useMaterials() {
  return useMemo(() => {
    const mk = (color: string, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.9, ...o })
    return {
      coral: mk('#ff7f66', { roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
      pvc: mk('#eef0ee', { roughness: 0.32, clearcoat: 0.4 }),
      deck: mk('#1b1f24', { roughness: 0.85 }),
      grey: mk('#5b636b', { roughness: 0.6 }),
      black: mk('#15181b', { roughness: 0.4, metalness: 0.3 }),
      steel: mk('#b8c0c8', { roughness: 0.25, metalness: 0.9 }),
      prop: mk('#c0302a', { roughness: 0.3, transparent: true, opacity: 0.9 }),
      glass: mk('#0b1015', { roughness: 0.12, metalness: 0.35, clearcoat: 1 }),
      box: mk('#cfe0ee', { transparent: true, opacity: 0.5, roughness: 0.2, clearcoat: 1 }),
      pcb: mk('#1f6a3a', { roughness: 0.5 }),
      esp: mk('#1565c0', { roughness: 0.5 }),
      disc: mk('#9cc7ea', { roughness: 0.4 }),
      tape: new THREE.MeshBasicMaterial({ color: '#ff8a73', toneMapped: false }),
      led: new THREE.MeshBasicMaterial({ color: '#fff4c2', toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ color: '#ff2d55', toneMapped: false }),
    }
  }, [])
}
type Mats = ReturnType<typeof useMaterials>

/* ------------------------------------------------------------------ */
/* Explodable part                                                     */
/* ------------------------------------------------------------------ */
interface PartProps {
  base?: [number, number, number]
  explode: [number, number, number]
  children: ReactNode
}
function Part({ base = [0, 0, 0], explode, children }: PartProps) {
  const ref = useRef<THREE.Group>(null)
  const b = useMemo(() => new THREE.Vector3(...base), [base])
  const e = useMemo(() => new THREE.Vector3(...explode), [explode])
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const k = sceneRefs.exploded
    g.position.set(b.x + e.x * k, b.y + e.y * k, b.z + e.z * k)
  })
  return <group ref={ref}>{children}</group>
}

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */
function alongZ(g: THREE.BufferGeometry) {
  g.rotateX(Math.PI / 2)
  return g
}

function noseGeometry() {
  const pts: THREE.Vector2[] = []
  const NL = 140
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    pts.push(new THREE.Vector2(SLEEVE_R * S * Math.pow(1 - t, 0.62) + 0.0001, t * NL * S))
  }
  const g = new THREE.LatheGeometry(pts, 48)
  g.rotateX(-Math.PI / 2) // extends toward -z (bow)
  return g
}
function tailGeometry() {
  const pts: THREE.Vector2[] = []
  const TL = 46
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    pts.push(new THREE.Vector2(SLEEVE_R * S * Math.sqrt(Math.max(0, 1 - t * t * 0.82)) + 0.0001, t * TL * S))
  }
  const g = new THREE.LatheGeometry(pts, 48)
  g.rotateX(Math.PI / 2) // extends toward +z (stern)
  return g
}
function deckGeometry() {
  const w = 240
  const h = 230
  const r = 40
  const s = new THREE.Shape()
  s.moveTo(-w + r, -h)
  s.lineTo(w - r, -h)
  s.quadraticCurveTo(w, -h, w, -h + r)
  s.lineTo(w, h - r)
  s.quadraticCurveTo(w, h, w - r, h)
  s.lineTo(-w + r, h)
  s.quadraticCurveTo(-w, h, -w, h - r)
  s.lineTo(-w, -h + r)
  s.quadraticCurveTo(-w, -h, -w + r, -h)
  const g = new THREE.ExtrudeGeometry(s, { depth: 8, bevelEnabled: false })
  g.scale(S, S, S)
  g.rotateX(Math.PI / 2) // shape y → boat y (z local)
  return g
}
function shellGeometry() {
  const sh = new THREE.Shape()
  sh.moveTo(-175, 86)
  sh.lineTo(-175, 165)
  sh.quadraticCurveTo(-170, 178, -150, 186)
  sh.lineTo(-127, 198)
  sh.lineTo(120, 198)
  sh.quadraticCurveTo(133, 198, 133, 186)
  sh.lineTo(133, 86)
  sh.lineTo(-175, 86)
  const g = new THREE.ExtrudeGeometry(sh, { depth: 150, bevelEnabled: true, bevelThickness: 12, bevelSize: 10, bevelSegments: 4, curveSegments: 16 })
  g.translate(0, 0, -75)
  g.scale(S, S, S)
  g.rotateY(-Math.PI / 2) // shape x → boat y (local z), depth → x
  return g
}
function finGeometry() {
  const fs = new THREE.Shape()
  fs.moveTo(0, 0)
  fs.lineTo(160, 0)
  fs.lineTo(138, 130)
  fs.quadraticCurveTo(110, 140, 78, 130)
  fs.lineTo(0, 0)
  const g = new THREE.ExtrudeGeometry(fs, { depth: 24, bevelEnabled: true, bevelThickness: 5, bevelSize: 4, bevelSegments: 3 })
  g.translate(0, 0, -12)
  g.scale(S, S, S)
  g.rotateY(-Math.PI / 2)
  return g
}

/* ------------------------------------------------------------------ */
/* Sub-assemblies                                                      */
/* ------------------------------------------------------------------ */
function Hull({ side, m }: { side: 1 | -1; m: Mats }) {
  const nose = useMemo(noseGeometry, [])
  const tail = useMemo(tailGeometry, [])
  const pipe = useMemo(() => alongZ(new THREE.CylinderGeometry(PR * S, PR * S, PL * S, 48)), [])
  const sleeve = useMemo(() => alongZ(new THREE.CylinderGeometry(SLEEVE_R * S, SLEEVE_R * S, 30 * S, 48)), [])
  const x = side * HX
  return (
    <Part explode={[side * 0.42, -0.12, 0]}>
      <mesh geometry={pipe} material={m.pvc} position={mm(x, 0, 0)} />
      {/* reflective tape on the pipe bottoms */}
      <mesh position={mm(x, 0, -PR + 4)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[PR * S + 0.003, PR * S + 0.003, 600 * S, 32, 1, true, Math.PI * 0.42, Math.PI * 0.16]} />
        <meshBasicMaterial color="#9fd8ff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* nose cone + sleeve */}
      <mesh geometry={nose} material={m.coral} position={mm(x, -PL / 2, 0)} />
      <mesh geometry={sleeve} material={m.coral} position={mm(x, -PL / 2 + 15, 0)} />
      {/* tail cone + sleeve */}
      <mesh geometry={tail} material={m.coral} position={mm(x, PL / 2, 0)} />
      <mesh geometry={sleeve} material={m.coral} position={mm(x, PL / 2 - 15, 0)} />
      {/* hose clamps */}
      {[-250, -60, 250].map((y) => (
        <mesh key={y} position={mm(x, y, 0)} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[PR * S + 0.002, PR * S + 0.002, 12 * S, 32, 1, true]} />
          <meshStandardMaterial color="#c7ced6" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* saddles */}
      {[-190, 190].map((y) => (
        <mesh key={y} material={m.grey} position={mm(x, y, 64)}>
          <boxGeometry args={[60 * S, 28 * S, 50 * S]} />
        </mesh>
      ))}
    </Part>
  )
}

function Thruster({ side, m }: { side: 1 | -1; m: Mats }) {
  const prop = useRef<THREE.Group>(null)
  const ring = useRef<THREE.MeshBasicMaterial>(null)
  const x = side * HX
  const ty = 300
  const tz = -111
  useFrame(({ clock }, dt) => {
    if (prop.current) prop.current.rotation.z += dt * 9 * side
    if (ring.current) {
      const p = 0.6 + 0.4 * Math.sin(clock.elapsedTime * 7 + side)
      ring.current.color.setRGB(0.3 * p, 0.65 * p, 1.3 * p)
    }
  })
  const can = useMemo(() => alongZ(new THREE.CylinderGeometry(25 * S, 25 * S, 110 * S, 32)), [])
  const shaft = useMemo(() => alongZ(new THREE.CylinderGeometry(6 * S, 6 * S, 24 * S, 16)), [])
  return (
    <Part explode={[side * 0.18, -0.42, 0.28]}>
      {/* mount */}
      <mesh material={m.grey} position={mm(x, ty, -76)}>
        <boxGeometry args={[72 * S, 60 * S, 62 * S]} />
      </mesh>
      {/* hose clamps around the can */}
      {[-30, 30].map((dy) => (
        <mesh key={dy} position={mm(x, ty + dy, tz)} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[27 * S, 27 * S, 8 * S, 24, 1, true]} />
          <meshStandardMaterial color="#c7ced6" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={can} material={m.black} position={mm(x, ty, tz)} />
      <mesh geometry={shaft} material={m.steel} position={mm(x, ty + 66, tz)} />
      {/* status ring */}
      <mesh position={mm(x, ty - 56, tz)} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[25 * S, 2.5 * S, 8, 32]} />
        <meshBasicMaterial ref={ring} color="#7fb3d5" toneMapped={false} />
      </mesh>
      {/* propeller */}
      <group ref={prop} position={mm(x, ty + 80, tz)}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} material={m.prop} rotation={[0, 0.35, (k * Math.PI * 2) / 3]}>
            <boxGeometry args={[9 * S, 30 * S, 2.5 * S]} />
          </mesh>
        ))}
      </group>
    </Part>
  )
}

function DeckAndCabin({ m }: { m: Mats }) {
  const deck = useMemo(deckGeometry, [])
  const shell = useMemo(shellGeometry, [])
  const fin = useMemo(finGeometry, [])
  const lightsMat = useRef<THREE.MeshBasicMaterial>(null)
  const spotL = useRef<THREE.SpotLight>(null)
  const spotR = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, -0.3, -4)
    return o
  }, [])
  useFrame((_, dt) => {
    const on = useSiteStore.getState().lights ? 1 : 0
    if (lightsMat.current) {
      const c = lightsMat.current.color
      c.lerp(on ? new THREE.Color('#fff4c2') : new THREE.Color('#3a3a30'), 1 - Math.exp(-dt * 6))
    }
    for (const s of [spotL.current, spotR.current]) if (s) s.intensity = THREE.MathUtils.lerp(s.intensity, on * 14, 1 - Math.exp(-dt * 6))
  })
  return (
    <>
      {/* deck */}
      <Part explode={[0, 0.3, 0]}>
        <mesh geometry={deck} material={m.deck} position={[0, 86 * S, 0]} />
        {/* LED edge strip under the deck lip */}
        <mesh position={[0, 80 * S, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[232 * S, 1.6 * S, 6, 64]} />
          <meshBasicMaterial color="#5ab0ff" toneMapped={false} />
        </mesh>
        {/* rescue ring on the deck, starboard side */}
        <mesh position={mm(150, 60, 98)} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[95 * S, 22 * S, 12, 40]} />
          <meshStandardMaterial color="#ff7f66" roughness={0.6} />
        </mesh>
      </Part>

      {/* electronics box + boards: the airtight food box lies flat on the deck,
          250 mm long (bow to stern) × 150 mm wide × 100 mm tall, under the shell.
          boxGeometry args are [across, up, along]; the deck top is at z = 86. */}
      <Part explode={[0, 0.62, 0]}>
        <mesh material={m.box} position={mm(0, 0, 86 + 50)}>
          <boxGeometry args={[150 * S, 100 * S, 250 * S]} />
        </mesh>
        {/* 5 V converter / power PCB, flat on the floor near the bow end */}
        <mesh material={m.pcb} position={mm(0, -80, 86 + 3)}>
          <boxGeometry args={[56 * S, 6 * S, 75 * S]} />
        </mesh>
        {/* ESP32 screw-terminal board, flat, starboard half */}
        <mesh material={m.esp} position={mm(35, 30, 86 + 7.5)}>
          <boxGeometry args={[70 * S, 15 * S, 55 * S]} />
        </mesh>
        {/* 3S 18650 battery pack, flat, port half */}
        <mesh position={mm(-38, 50, 86 + 10)}>
          <boxGeometry args={[60 * S, 20 * S, 75 * S]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* ESP32 status LED on top of the board */}
        <mesh position={mm(48, 18, 86 + 15 + 3)}>
          <sphereGeometry args={[3 * S, 10, 10]} />
          <meshBasicMaterial color="#7fb3d5" toneMapped={false} />
        </mesh>
      </Part>

      {/* coral shell + sensor visor */}
      <Part explode={[0, 1.05, 0]}>
        <mesh geometry={shell} material={m.coral} />
        <mesh material={m.glass} position={mm(0, -187, 141)}>
          <boxGeometry args={[130 * S, 3 * S, 56 * S]} />
        </mesh>
        {/* searchlights */}
        {[-47, 47].map((x, i) => (
          <group key={x}>
            <mesh position={mm(x, -190, 141)} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[11 * S, 11 * S, 4 * S, 24]} />
              <meshBasicMaterial ref={i === 0 ? lightsMat : undefined} color="#fff4c2" toneMapped={false} />
            </mesh>
            <spotLight
              ref={i === 0 ? spotL : spotR}
              position={mm(x, -195, 141)}
              target={target}
              angle={0.45}
              penumbra={0.7}
              intensity={14}
              distance={9}
              color="#fff1c2"
              decay={1.5}
            />
          </group>
        ))}
        <primitive object={target} />
        {/* camera + thermal sensor */}
        {[-17, 17].map((x) => (
          <mesh key={x} material={m.grey} position={mm(x, -190, 141)}>
            <boxGeometry args={[18 * S, 4 * S, 18 * S]} />
          </mesh>
        ))}
        <mesh position={mm(17, -193, 141)}>
          <circleGeometry args={[5 * S, 16]} />
          <meshBasicMaterial color="#ff2d55" toneMapped={false} />
        </mesh>
      </Part>

      {/* dorsal fin (GPS lives under it) */}
      <Part explode={[0, 1.45, 0]}>
        <mesh geometry={fin} material={m.coral} position={mm(0, -70, 204)} />
        <mesh position={mm(0, 10, 215)}>
          <boxGeometry args={[25 * S, 25 * S, 6 * S]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </Part>
    </>
  )
}

function MarkerRack({ m }: { m: Mats }) {
  const disc = useRef<THREE.Mesh>(null)
  const discAngle = useRef(0)
  const lastCount = useRef(0)
  const RY = 314
  useFrame((_, dt) => {
    const n = useSiteStore.getState().markers.length
    if (n !== lastCount.current) {
      lastCount.current = n
      discAngle.current += Math.PI / 2
    }
    if (disc.current) disc.current.rotation.y = THREE.MathUtils.lerp(disc.current.rotation.y, discAngle.current, 1 - Math.exp(-dt * 6))
  })
  const markers = useSiteStore((s) => s.markers.length)
  const rackPlate = useMemo(() => new THREE.CylinderGeometry(84 * S, 84 * S, 6 * S, 48, 1, false, Math.PI / 2, Math.PI), [])
  return (
    <Part explode={[0, 0.42, 0.55]}>
      <mesh geometry={rackPlate} material={m.grey} position={mm(0, RY, 89)} />
      <mesh ref={disc} material={m.disc} position={mm(0, RY, 76)}>
        <cylinderGeometry args={[78 * S, 78 * S, 4 * S, 48]} />
      </mesh>
      {[22.5, 67.5, 112.5, 157.5].map((a, i) => {
        const rad = (a * Math.PI) / 180
        const loaded = i >= markers
        return (
          <group key={a}>
            <mesh material={m.grey} position={mm(Math.cos(rad) * 55, RY + Math.sin(rad) * 55 * 0.9 - 20, 122)}>
              <cylinderGeometry args={[11 * S, 11 * S, 60 * S, 20, 1, true]} />
            </mesh>
            {loaded && (
              <mesh position={mm(Math.cos(rad) * 55, RY + Math.sin(rad) * 55 * 0.9 - 20, 108)}>
                <sphereGeometry args={[6 * S, 10, 10]} />
                <meshBasicMaterial color="#ff2d55" toneMapped={false} />
              </mesh>
            )}
          </group>
        )
      })}
      {/* servo */}
      <mesh material={m.esp} position={mm(0, RY - 40, 98)}>
        <boxGeometry args={[24 * S, 14 * S, 24 * S]} />
      </mesh>
      {/* low shroud */}
      <mesh position={mm(0, RY + 10, 104)}>
        <boxGeometry args={[150 * S, 28 * S, 110 * S]} />
        <meshStandardMaterial color="#5b636b" transparent opacity={0.35} roughness={0.6} />
      </mesh>
    </Part>
  )
}

function SonarFloat({ m }: { m: Mats }) {
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    const since = clock.elapsedTime - sceneRefs.lastPing
    const flash = Math.max(0, 1 - since * 2.2)
    if (glow.current) glow.current.color.setRGB(0.3 + flash, 0.5 + flash * 0.3, 1)
  })
  return (
    <Part explode={[0, -0.15, -0.55]}>
      <mesh material={m.grey} position={mm(0, -250, 48)}>
        <boxGeometry args={[16 * S, 16 * S, 80 * S]} />
      </mesh>
      <mesh material={m.black} position={mm(0, -277, 0)}>
        <sphereGeometry args={[32 * S, 32, 20]} />
      </mesh>
      <mesh position={mm(0, -277, -22)}>
        <sphereGeometry args={[12 * S, 16, 12]} />
        <meshBasicMaterial ref={glow} color="#7fb3d5" toneMapped={false} />
      </mesh>
      <pointLight position={mm(0, -277, -30)} color="#7fb3d5" intensity={1.2} distance={1.5} />
    </Part>
  )
}

/* ------------------------------------------------------------------ */
/* Callouts                                                            */
/* ------------------------------------------------------------------ */
const PIN_POS: Record<SubsystemId, [number, number, number]> = {
  hulls: mm(-HX - 60, -120, -120),
  cabin: mm(0, -40, 420),
  thrusters: mm(HX + 60, 320, -220),
  senses: mm(0, -330, 150),
  markers: mm(0, 420, 240),
  brain: mm(-120, 60, 300),
}

function Callouts() {
  const select = useSiteStore((s) => s.selectSubsystem)
  const selected = useSiteStore((s) => s.selectedSubsystem)
  const ref = useRef<HTMLButtonElement[]>([])
  useFrame(() => {
    const o = Math.max(0, (sceneRefs.exploded - 0.55) / 0.45)
    for (const el of ref.current) if (el) el.style.opacity = String(o)
  })
  return (
    <>
      {HOW_IT_WORKS.map((s, i) => (
        <Html key={s.id} position={PIN_POS[s.id]} center distanceFactor={3.6} zIndexRange={[30, 0]} portal={sceneRefs.htmlPortal as RefObject<HTMLElement>}>
          <button
            ref={(el) => {
              if (el) ref.current[i] = el
            }}
            onClick={(e) => {
              e.stopPropagation()
              select(selected === s.id ? null : s.id)
            }}
            className="glass-strong hud-corner flex items-center gap-2 px-3 py-2 text-left font-mono text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-all"
            style={{
              opacity: 0,
              pointerEvents: 'auto',
              borderColor: selected === s.id ? s.color : undefined,
              boxShadow: selected === s.id ? `0 0 24px ${s.color}66` : undefined,
            }}
          >
            <span className="block h-2 w-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
            <span className="text-white/90">{s.name}</span>
          </button>
        </Html>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Boat                                                                */
/* ------------------------------------------------------------------ */
export function DelphylaxModel() {
  const root = useRef<THREE.Group>(null)
  const m = useMaterials()
  const emitPing = useSiteStore((s) => s.emitPing)
  const noseLocal = useMemo(() => new THREE.Vector3(...mm(0, -277, -20)), [])
  const sternLocal = useMemo(() => new THREE.Vector3(...mm(0, 330, 60)), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }, dt) => {
    const g = root.current
    if (!g) return
    const t = clock.elapsedTime
    const st = useSiteStore.getState()

    sceneRefs.exploded = THREE.MathUtils.lerp(sceneRefs.exploded, st.explodedOn ? 1 : 0, 1 - Math.exp(-dt * 3.2))

    // float at the waterline: pipe centre ≈ 16 mm above the water, gentle pitch/roll
    const depth = sceneRefs.depth01
    const waterY = 0.02
    g.position.y = waterY + 16 * S + Math.sin(t * 0.9) * 0.025 * (1 - depth * 0.6)
    g.rotation.z = Math.sin(t * 0.7) * 0.02
    g.rotation.x = Math.sin(t * 0.55 + 1) * 0.015
    const yaw = -Math.PI / 2 + st.pointer.x * 0.1
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, yaw, 1 - Math.exp(-dt * 2))
    sceneRefs.heading = ((178 + st.pointer.x * 12 + 360) % 360 + 360) % 360

    g.updateMatrixWorld()
    tmp.copy(noseLocal).applyMatrix4(g.matrixWorld)
    sceneRefs.nose.copy(tmp)
    tmp.copy(sternLocal).applyMatrix4(g.matrixWorld)
    sceneRefs.stern.copy(tmp)
    sceneRefs.robot.copy(g.position)

    // autonomous sonar sweep
    const now = performance.now() / 1000
    const interval = st.section === 'hero' ? 3.4 : st.section === 'sandbox' ? 6.5 : 4.8
    if (now - sceneRefs.lastPing > interval) emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)
    const last = st.pings[st.pings.length - 1]
    if (last && last.t > sceneRefs.lastPing) {
      sceneRefs.lastPing = last.t
      sceneRefs.caPulse = 1
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return
    e.stopPropagation()
    emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)
  }

  return (
    <group ref={root} rotation={[0, -Math.PI / 2, 0]} onClick={onClick}>
      <Hull side={-1} m={m} />
      <Hull side={1} m={m} />
      <Thruster side={-1} m={m} />
      <Thruster side={1} m={m} />
      <DeckAndCabin m={m} />
      <MarkerRack m={m} />
      <SonarFloat m={m} />
      <Callouts />
    </group>
  )
}
