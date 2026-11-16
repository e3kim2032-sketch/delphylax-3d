import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSiteStore } from '../../store/useSiteStore'
import { SECTIONS, MAX_DEPTH_M } from '../../data/research'
import { sceneRefs } from './sceneRefs'

interface Waypoint {
  pos: THREE.Vector3
  look: THREE.Vector3
  fov: number
}

const WAYPOINTS: Record<string, Waypoint> = {
  // above the surface
  hero: { pos: new THREE.Vector3(2.6, 1.1, 4.3), look: new THREE.Vector3(-1.7, 0.1, 0), fov: 40 },
  // just under the surface, looking up at the hulls from the port quarter
  crisis: { pos: new THREE.Vector3(-3.4, -0.5, 3.8), look: new THREE.Vector3(0.6, -0.25, 0), fov: 44 },
  // surface level, exploded parts rise above
  engineering: { pos: new THREE.Vector3(3.4, 2.1, 7.2), look: new THREE.Vector3(0.1, 0.74, 0), fov: 40 },
  // diver's view: hulls overhead, sonar field on the riverbed ahead
  sandbox: { pos: new THREE.Vector3(-0.2, -0.8, 7.6), look: new THREE.Vector3(3.0, -1.9, -0.6), fov: 50 },
  matrix: { pos: new THREE.Vector3(5.6, -0.6, -4.2), look: new THREE.Vector3(0.7, -1.0, 1.3), fov: 38 },
  business: { pos: new THREE.Vector3(0.2, 1.5, 5.6), look: new THREE.Vector3(-1.9, -0.25, 0), fov: 38 },
}

const ORDER = SECTIONS.map((s) => s.id)

/**
 * Scroll-driven camera: section waypoints blended with smoothstep,
 * plus mouse parallax and a slow idle orbit so the robot can always be inspected.
 */
export function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(), [])
  const lookCur = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const posCur = useMemo(() => WAYPOINTS.hero.pos.clone(), [])
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])
  const fovRef = useRef(40)

  useFrame(({ camera, clock, size }, dt) => {
    const st = useSiteStore.getState()
    // portrait screens: pull the camera back along its view line so the robot stays in frame
    const portrait = size.width < size.height
    const back = portrait ? 1.75 : size.width < 1100 ? 1.2 : 1
    const p = st.scrollProgress * (ORDER.length - 1) // 0..5 continuous
    const i = Math.min(ORDER.length - 2, Math.max(0, Math.floor(p)))
    const f = THREE.MathUtils.smoothstep(p - i, 0, 1)
    const a = WAYPOINTS[ORDER[i]]
    const b = WAYPOINTS[ORDER[i + 1]]
    tmpPos.lerpVectors(a.pos, b.pos, f)
    tmpLook.lerpVectors(a.look, b.look, f)
    if (portrait) {
      // the desktop side-offsets push the boat out of a narrow frame: recentre it, and sit it low behind the lower text
      tmpLook.x *= 0.15
      tmpPos.x *= 0.4
      tmpLook.y += 0.7
    }
    if (back !== 1) tmpPos.sub(tmpLook).multiplyScalar(back).add(tmpLook)
    const fov = THREE.MathUtils.lerp(a.fov, b.fov, f)

    // mouse parallax + idle orbit
    const t = clock.elapsedTime
    const px = st.pointer.x
    const py = st.pointer.y
    const orbit = Math.sin(t * 0.12) * 0.25
    tmpPos.x += px * 0.55 + orbit
    tmpPos.y += -py * 0.35 + Math.sin(t * 0.2) * 0.08
    tmpPos.z += Math.cos(t * 0.12) * 0.15

    const k = 1 - Math.exp(-dt * 2.4)
    posCur.lerp(tmpPos, k)
    lookCur.lerp(tmpLook, k)
    fovRef.current = THREE.MathUtils.lerp(fovRef.current, fov, k)

    camera.position.copy(posCur)
    target.copy(lookCur)
    camera.lookAt(target)
    const pc = camera as THREE.PerspectiveCamera
    if (Math.abs(pc.fov - fovRef.current) > 0.01) {
      pc.fov = fovRef.current
      pc.updateProjectionMatrix()
    }

    // fps estimate for the HUD
    if (dt > 0) sceneRefs.fps = THREE.MathUtils.lerp(sceneRefs.fps, 1 / dt, 0.05)

    // depth factor for environment
    const d01 = Math.min(1, Math.max(0, -st.depthM / MAX_DEPTH_M))
    sceneRefs.depth01 = THREE.MathUtils.lerp(sceneRefs.depth01, d01, 1 - Math.exp(-dt * 3))
  })
  return null
}
