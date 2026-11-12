import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { DelphylaxModel } from './DelphylaxModel'
import { SonarField } from './SonarField'
import { AbyssalEnvironment } from './AbyssalEnvironment'
import { CameraRig } from './CameraRig'
import { Effects } from './Effects'
import { useSiteStore } from '../../store/useSiteStore'
import { sceneRefs } from './sceneRefs'

if (import.meta.env.DEV) {
  ;(window as unknown as { __dlx: unknown }).__dlx = { store: useSiteStore, refs: sceneRefs }
}

function PointerTracker() {
  const setPointer = useSiteStore((s) => s.setPointer)
  useEffect(() => {
    let raf = 0
    let nx = 0
    let ny = 0
    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1
      ny = (e.clientY / window.innerHeight) * 2 - 1
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0
        setPointer(nx, ny)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [setPointer])
  return null
}

export function Scene() {
  const setWebglOk = useSiteStore((s) => s.setWebglOk)
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
        camera={{ fov: 40, near: 0.1, far: 140, position: [3.4, 1.0, 4.0] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.1
          gl.setClearColor('#0f1519')
        }}
        onError={() => setWebglOk(false)}
      >
        <CameraRig />
          {/* procedural reflection environment — no external HDR to fail */}
          <Environment resolution={256} frames={1}>
            <Lightformer form="ring" intensity={3} color="#8fb6d2" position={[0, 5, -4]} scale={8} />
            <Lightformer form="rect" intensity={1.6} color="#ff8a73" position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} />
            <Lightformer form="rect" intensity={2} color="#7fb3d5" position={[6, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 1.5, 1]} />
            <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[2, 6, 3]} scale={3} />
            <Lightformer form="rect" intensity={0.8} color="#1e3a8a" position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
          </Environment>
          <AbyssalEnvironment />
          <SonarField />
          <DelphylaxModel />
          <Effects />
          <Preload all />
        <AdaptiveDpr pixelated />
      </Canvas>
      <div
        ref={(el) => {
          sceneRefs.htmlPortal.current = el
        }}
        className="pointer-events-none absolute inset-0"
      />
      <PointerTracker />
    </div>
  )
}
