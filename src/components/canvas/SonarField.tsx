import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { createSonarMaterial, MAX_PINGS } from './SonarWaveShader'
import { sceneRefs, FLOOR_Y, METERS_PER_UNIT, SONAR_SPEED, PING_TTL } from './sceneRefs'
import { useSiteStore } from '../../store/useSiteStore'
import { SONAR } from '../../data/research'

const ROCK_COUNT = 170
const LOW_COUNT = 48

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Victim position is derived from the store seed so sandbox "re-hide" is deterministic. */
export function victimFromSeed(seed: number) {
  const r = seeded(seed * 7919 + 17)
  const ang = -0.55 + r() * 1.1
  const dist = 5.5 + r() * 4.5 // ≈ 2.5–4.5 m ahead of the bow
  return new THREE.Vector3(Math.cos(ang) * dist + 0.8, FLOOR_Y + 0.12, Math.sin(ang) * dist)
}

function GlowMarkers() {
  const markers = useSiteStore((s) => s.markers)
  return (
    <>
      {markers.map((mk) => (
        <GlowMarker key={mk.id} x={mk.x} y={mk.y} z={mk.z} t={mk.t} />
      ))}
    </>
  )
}

/** A dropped glow marker: falls from the rack, floats on the water, pulses pink; sinker line goes to the floor. */
function GlowMarker({ x, y, z, t }: { x: number; y: number; z: number; t: number }) {
  const g = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, FLOOR_Y - 0.05, 0)])
    return geo
  }, [])
  useFrame(({ clock }) => {
    const age = performance.now() / 1000 - t
    const waterY = 0.02
    const fall = Math.min(1, age / 0.6)
    const yy = THREE.MathUtils.lerp(y, waterY + 0.03, 1 - Math.pow(1 - fall, 3)) + Math.sin(clock.elapsedTime * 2 + x) * 0.01
    if (g.current) g.current.position.set(x, yy, z)
    if (ring.current) {
      const p = (clock.elapsedTime * 0.6 + x) % 1
      ring.current.scale.setScalar(0.3 + p * 1.6)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.7 * fall
    }
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.035, 14, 14]} />
        <meshBasicMaterial color="#ff2d55" toneMapped={false} />
      </mesh>
      <pointLight color="#ff2d55" intensity={2.5} distance={2.5} decay={2} />
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.18, 0.21, 48]} />
        <meshBasicMaterial color="#ff6b57" transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={line}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </lineSegments>
    </group>
  )
}

export function SonarField() {
  const terrain = useMemo(() => createSonarMaterial({ terrain: true }), [])
  const rockMat = useMemo(() => createSonarMaterial({ rock: true, instanced: true }), [])
  const rocksRef = useRef<THREE.InstancedMesh>(null)
  const victimRef = useRef<THREE.Group>(null)
  const victimMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff2a55', transparent: true, opacity: 0, toneMapped: false }), [])
  const boxRef = useRef<THREE.LineSegments>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const emitPing = useSiteStore((s) => s.emitPing)
  const victimSeed = useSiteStore((s) => s.victimSeed)

  const victimPos = useMemo(() => victimFromSeed(victimSeed), [victimSeed])
  useEffect(() => {
    sceneRefs.victim.copy(victimPos)
    sceneRefs.reveal = 0
    useSiteStore.getState().setLock({ active: false, confidence: 0 })
  }, [victimPos])

  const rockData = useMemo(() => {
    const r = seeded(1337)
    const arr: THREE.Matrix4[] = []
    const tmp = new THREE.Object3D()
    for (let i = 0; i < ROCK_COUNT; i++) {
      const ang = -1.1 + r() * 2.2
      const dist = 2.2 + r() * 9.5
      const s = 0.12 + r() * 0.42
      tmp.position.set(Math.cos(ang) * dist + 0.6, FLOOR_Y + s * 0.45, Math.sin(ang) * dist)
      tmp.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI)
      tmp.scale.setScalar(s)
      tmp.updateMatrix()
      arr.push(tmp.matrix.clone())
    }
    return arr
  }, [])

  const clutter = useSiteStore((s) => s.clutter)
  useEffect(() => {
    const mesh = rocksRef.current
    if (!mesh) return
    const zero = new THREE.Matrix4().makeScale(0, 0, 0)
    const count = clutter === 'extreme' ? ROCK_COUNT : LOW_COUNT
    for (let i = 0; i < ROCK_COUNT; i++) mesh.setMatrixAt(i, i < count ? rockData[i] : zero)
    mesh.instanceMatrix.needsUpdate = true
  }, [clutter, rockData])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return
    e.stopPropagation()
    emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)
  }

  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const lockHold = useRef(0)

  useFrame(({ clock, camera }, dt) => {
    const t = clock.getElapsedTime()
    const st = useSiteStore.getState()
    const now = performance.now() / 1000

    const pings = st.pings
    const n = Math.min(pings.length, MAX_PINGS)
    for (let i = 0; i < MAX_PINGS; i++) {
      const u = terrain.uniforms.uPings.value[i]
      const ur = rockMat.uniforms.uPings.value[i]
      if (i < n) {
        const p = pings[i]
        const emitClock = t - (now - p.t)
        u.set(p.x, p.y, p.z, emitClock)
        ur.set(p.x, p.y, p.z, emitClock)
      } else {
        u.set(0, 0, 0, -100)
        ur.set(0, 0, 0, -100)
      }
    }
    if (n && now - pings[n - 1].t > PING_TTL) st.prunePings(now, PING_TTL)

    let reveal = 0
    for (let i = 0; i < n; i++) {
      const p = pings[i]
      const age = now - p.t
      const r = age * SONAR_SPEED
      tmpV.set(p.x, p.y, p.z)
      const d = tmpV.distanceTo(sceneRefs.victim)
      if (r >= d) {
        const passed = r - d
        const rise = Math.min(1, passed / 0.6)
        reveal = Math.max(reveal, rise * Math.exp(-passed * 0.09) * Math.exp(-age * 0.05))
      }
    }
    sceneRefs.reveal = THREE.MathUtils.lerp(sceneRefs.reveal, reveal, 1 - Math.exp(-Math.min(dt, 0.1) * 10))
    const sparsity = st.sparsity ? 1 : 0

    const base = st.sparsity ? (st.clutter === 'extreme' ? 0.941 : 0.984) : st.clutter === 'extreme' ? 0.468 : 0.712
    const conf = base * Math.min(1, sceneRefs.reveal * 1.6)
    const dist = sceneRefs.nose.distanceTo(sceneRefs.victim) * METERS_PER_UNIT
    const shouldLock = conf >= SONAR.lockThreshold
    if (shouldLock) lockHold.current = now
    const active = now - lockHold.current < 6.5 && lockHold.current > 0
    if (active !== st.lock.active || Math.abs(st.lock.confidence - conf) > 0.002) {
      tmpV.copy(sceneRefs.victim).project(camera)
      st.setLock({
        active,
        confidence: active ? Math.max(conf, st.lock.confidence * 0.995) : conf,
        distanceM: dist,
        sx: tmpV.x * 0.5 + 0.5,
        sy: -tmpV.y * 0.5 + 0.5,
        lockedAt: lockHold.current,
      })
    }

    for (const u of [terrain.uniforms, rockMat.uniforms]) {
      u.uTime.value = t
      u.uPingCount.value = n
      u.uVictim.value.copy(sceneRefs.victim)
      u.uReveal.value = sceneRefs.reveal
      u.uDepth.value = sceneRefs.depth01
      u.uSparsity.value = sparsity
    }

    if (victimRef.current) {
      victimRef.current.position.copy(sceneRefs.victim)
      victimRef.current.rotation.y = 0.4
    }
    victimMaterial.opacity = Math.min(1, sceneRefs.reveal * 1.3)
    if (boxRef.current) {
      const target = active ? 1 : 0
      const s = THREE.MathUtils.lerp(boxRef.current.scale.x, target, 1 - Math.exp(-dt * 8))
      boxRef.current.scale.setScalar(Math.max(s, 0.0001))
      boxRef.current.position.copy(sceneRefs.victim).y += 0.25
      boxRef.current.rotation.y = t * 0.6
      boxRef.current.visible = s > 0.02
    }
    if (labelRef.current) labelRef.current.style.opacity = active ? '1' : '0'
  })

  const boxGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.6, 1.0)), [])

  return (
    <group onClick={onClick}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} material={terrain.material}>
        <planeGeometry args={[70, 70, 150, 150]} />
      </mesh>

      <instancedMesh ref={rocksRef} args={[undefined, undefined, ROCK_COUNT]} material={rockMat.material} frustumCulled={false}>
        <dodecahedronGeometry args={[1, 0]} />
      </instancedMesh>

      {/* victim silhouette — low-poly human lying in the debris */}
      <group ref={victimRef}>
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} material={victimMaterial}>
          <capsuleGeometry args={[0.16, 0.55, 4, 10]} />
        </mesh>
        <mesh position={[0.5, 0.1, 0]} material={victimMaterial}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-0.45, 0.07, s * 0.14]} rotation={[0, s * 0.35, Math.PI / 2]} material={victimMaterial}>
            <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`a${s}`} position={[0.12, 0.08, s * 0.26]} rotation={[0, s * -0.6, Math.PI / 2]} material={victimMaterial}>
            <capsuleGeometry args={[0.06, 0.36, 4, 8]} />
          </mesh>
        ))}
      </group>

      <lineSegments ref={boxRef} geometry={boxGeo} visible={false}>
        <lineBasicMaterial color="#ff2a55" toneMapped={false} transparent opacity={0.95} />
      </lineSegments>

      <LockLabel labelRef={labelRef} />
      <GlowMarkers />
    </group>
  )
}

function LockLabel({ labelRef }: { labelRef: RefObject<HTMLDivElement | null> }) {
  const groupRef = useRef<THREE.Group>(null)
  const lock = useSiteStore((s) => s.lock)
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(sceneRefs.victim)
      groupRef.current.position.y += 0.95
    }
  })
  return (
    <group ref={groupRef}>
      <Html center distanceFactor={7.5} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }} portal={sceneRefs.htmlPortal as RefObject<HTMLElement>}>
        <div
          ref={labelRef}
          className="glass-strong hud-corner px-3 py-2 font-mono text-[11px] leading-tight whitespace-nowrap transition-opacity duration-300"
          style={{ opacity: 0, borderColor: 'rgba(255,42,85,0.7)', minWidth: 180 }}
        >
          <div className="text-[9px] tracking-[0.25em] text-[#ff6b57]">● TARGET · SONAR + THERMAL</div>
          <div className="mt-1 flex justify-between gap-4 text-white">
            <span>RANGE</span>
            <span className="text-[#ffb4a6]">{lock.distanceM.toFixed(1)}m</span>
          </div>
          <div className="flex justify-between gap-4 text-white">
            <span>CONFIDENCE</span>
            <span className="text-[#ffb4a6]">{(lock.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
