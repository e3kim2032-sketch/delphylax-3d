import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { sceneRefs, MM } from './sceneRefs'

/**
 * The Delphylax Pod, drawn from the team's own CAD model
 * (public/models/delphylax_pod.glb): a dolphin-shaped float about 372 mm long,
 * 169 mm wide and 217 mm tall, with a dorsal fin, a tail and raised DELPHYLAX
 * lettering. Every place the Pod appears uses this one file.
 *
 * The file is in millimetres, centred on its middle, long axis along X and up along +Z.
 * In the mesh itself the pointed head is at -X and the forked tail at +X.
 */

type V3 = [number, number, number]
const S = MM
/** boat millimetres (x across, y along with the bow at -y, z up) to boat-local scene units */
const mm = (x: number, y: number, z: number): V3 => [x * S, z * S, y * S]
const smooth = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b)
/** the boat's resting yaw: bow toward +X */
const HOME_YAW = -Math.PI / 2
export const POD_CORAL = '#e8654f'

/** half-sizes of the model, in millimetres */
const HALF = { length: 186.1, width: 84.4, height: 108.2 }

/**
 * Turns the CAD axes into the boat's: the head (-X in the file) toward the bow (-z here),
 * up (+Z in the file) to +y. Use it as the `rotation` of the mesh.
 */
export const POD_ORIENT: [number, number, number, THREE.EulerOrder] = [-Math.PI / 2, -Math.PI / 2, 0, 'YXZ']

const loads = new Map<string, Promise<THREE.BufferGeometry>>()
function loadPod(url: string) {
  let p = loads.get(url)
  if (!p) {
    p = new GLTFLoader().loadAsync(url).then((gltf) => {
      let found: THREE.BufferGeometry | null = null
      gltf.scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!found && mesh.isMesh) found = mesh.geometry
      })
      if (!found) throw new Error('The Pod model has no mesh')
      const geo = (found as THREE.BufferGeometry).clone()
      // the file carries no normals, and its grey vertex colour is not used: the Pod is coral
      geo.deleteAttribute('color')
      return toCreasedNormals(geo, 0.6)
    })
    loads.set(url, p)
  }
  return p
}

/** The Pod's geometry, or null until the model file has loaded. No Suspense needed. */
export function usePodGeometry(url: string) {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null)
  useEffect(() => {
    let alive = true
    loadPod(url)
      .then((g) => {
        if (alive) setGeo(g)
      })
      .catch((err) => console.warn('Delphylax Pod model did not load:', err))
    return () => {
      alive = false
    }
  }, [url])
  return geo
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,196,176,0.9)')
    grad.addColorStop(0.3, 'rgba(255,138,115,0.45)')
    grad.addColorStop(1, 'rgba(232,101,79,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** where the Pod rides before the drop: on the starboard side of the deck, over the rescue ring (boat mm, centre of the Pod) */
export const POD_DOCK_MM: V3 = [176, 30, 100 + HALF.height]
const POD_DOCK: V3 = mm(...POD_DOCK_MM)
/** top of the Pod in boat mm, for the numbered pin */
export const POD_TOP_MM: V3 = [POD_DOCK_MM[0], POD_DOCK_MM[1], POD_DOCK_MM[2] + HALF.height]
/** in the exploded view the Pod lifts off the deck and out to starboard, like the other parts */
export const POD_EXPLODE: V3 = [0.62, 0.55, 0.1]

/** What the scene tells the Pod each frame. */
export interface PodControl {
  /** draw it at all */
  show: boolean
  /** false: it rides on the deck. true: it has been dropped */
  dropped: boolean
  /** seconds since the drop */
  since: number
  /** reduced motion: no bobbing or turning, final state only */
  reduce: boolean
  /** show it off: lift it clear of the deck and turn it slowly (ignored once dropped) */
  spin?: boolean
}

const FALL = 0.95 // seconds from the deck to the water
/** how high the Pod's centre floats above the water line (about a third of it is under water) */
const FLOAT_Y = 0.02 + 36 * S

/**
 * The Pod in the scene. It rides on the deck; when it is dropped it arcs into the water,
 * lights up softly and floats while the boat moves away. It lives in world space (not
 * inside the boat group) so it stays put when the boat leaves.
 */
export function Pod({ boat, control, url }: { boat: RefObject<THREE.Group | null>; control: () => PodControl; url: string }) {
  const g = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const halo = useRef<THREE.Sprite>(null)
  const ripples = useRef<(THREE.Mesh | null)[]>([])
  const geo = usePodGeometry(url)
  const tex = useMemo(glowTexture, [])
  const skin = useMemo(() => new THREE.MeshPhysicalMaterial({ color: POD_CORAL, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 0.9, emissive: '#ff5a3c', emissiveIntensity: 0 }), [])
  const dock = useMemo(() => new THREE.Vector3(), [])
  const water = useMemo(() => new THREE.Vector3(), [])
  const start = useMemo(() => new THREE.Vector3(), [])
  const show = useRef(0)
  const lift = useRef(0)
  const turn = useRef(0)
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

    // on show: it rises clear of the deck and turns slowly, so every side can be seen
    const showing = !!c.spin && !drop && !c.reduce
    lift.current = THREE.MathUtils.lerp(lift.current, showing ? 1 : 0, 1 - Math.exp(-dt * 3))

    const k = sceneRefs.exploded
    dock.set(POD_DOCK[0] + POD_EXPLODE[0] * k, POD_DOCK[1] + POD_EXPLODE[1] * k, POD_DOCK[2] + POD_EXPLODE[2] * k)
    b.localToWorld(dock)
    dock.y += lift.current * 0.5

    if (!drop) {
      released.current = false
      if (showing) turn.current += dt * 0.55
      else {
        // back on the deck: unwind to face the bow again
        const home = Math.PI * 2 * Math.round(turn.current / (Math.PI * 2))
        turn.current = c.reduce ? home : THREE.MathUtils.lerp(turn.current, home, 1 - Math.exp(-dt * 4))
      }
    } else if (!released.current) {
      // remember where it left from and where it will float
      released.current = true
      start.copy(grp.visible && lift.current > 0.02 ? grp.position : dock)
      start.x -= b.position.x // measured from where the boat floats, even if it has already moved off
      water.set(start.x + 0.05, FLOAT_Y, start.z + 0.8)
      if (c.reduce) turn.current = 0
    }

    let glow = 0
    grp.rotation.order = 'YXZ'
    if (!drop) {
      grp.position.copy(dock)
      grp.rotation.set(0, b.rotation.y + turn.current, 0)
    } else if (e < FALL) {
      const u = e / FALL
      turn.current += dt * 0.9
      grp.position.set(
        THREE.MathUtils.lerp(start.x, water.x, u),
        start.y + (water.y - start.y) * u * u + Math.sin(Math.PI * u) * 0.16,
        THREE.MathUtils.lerp(start.z, water.z, u * (2 - u)),
      )
      grp.rotation.set(Math.sin(Math.PI * u) * 0.22, HOME_YAW + turn.current, Math.sin(Math.PI * u) * 0.7)
    } else {
      const s = e - FALL
      const settle = Math.exp(-Math.min(s, 20) * 2.0)
      const idle = c.reduce ? 0 : 1
      // afloat, it keeps turning slowly
      turn.current += dt * 0.22 * idle
      grp.position.set(water.x, water.y - 0.16 * settle * Math.cos(s * 6.5) + Math.sin(t * 1.3) * 0.014 * idle, water.z)
      grp.rotation.set(Math.sin(t * 1.1) * 0.04 * idle, HOME_YAW + turn.current, Math.sin(t * 0.9) * 0.06 * idle + 0.3 * settle * Math.sin(s * 6))
      glow = smooth(s, 0, 1.0)
    }
    grp.scale.setScalar(Math.max(0.001, show.current) * (1 + lift.current * 0.12))

    // a soft glow once it is in the water
    const breathe = c.reduce ? 1 : 0.86 + 0.14 * Math.sin(t * 2.6)
    skin.emissiveIntensity = glow * 0.5 * breathe
    if (light.current) light.current.intensity = glow * 1.2 * breathe
    if (halo.current) {
      halo.current.material.opacity = glow * 0.36 * breathe * show.current
      halo.current.scale.setScalar(1.7 + 0.14 * breathe)
    }
    for (let i = 0; i < 3; i++) {
      const m = ripples.current[i]
      if (!m) continue
      const s = e - FALL
      m.visible = drop && s > 0 && grp.visible
      if (!m.visible) continue
      const ph = c.reduce ? (i + 1) / 4 : (s * 0.36 + i / 3) % 1
      m.position.set(water.x, 0.045, water.z)
      m.scale.setScalar(0.32 + ph * 1.0)
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.5 * Math.max(glow, 0.3)
    }
  })

  return (
    <>
      <group ref={g} visible={false}>
        {geo && <mesh geometry={geo} material={skin} rotation={POD_ORIENT} scale={S} />}
        <pointLight ref={light} color="#ff8a73" intensity={0} distance={5} decay={1.6} position={[0, 0.2, 0]} />
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
          <ringGeometry args={[0.95, 1, 64]} />
          <meshBasicMaterial color="#ffb4a6" transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}
