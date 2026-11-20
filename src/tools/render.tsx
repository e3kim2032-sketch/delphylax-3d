import { useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { BoatParts, PinsContext } from '../components/canvas/DelphylaxModel'
import { Pod } from '../components/canvas/Pod'

/**
 * Development tool, not part of the built site: the boat alone, on a transparent
 * background, with the same lights as the live scene. Open /tools/render.html in
 * `npm run dev` and screenshot it to refresh public/boat.webp (used by the hero in
 * Read mode and by the Team page).
 */
const podOnDeck = () => ({ show: true, dropped: false, since: 0, reduce: true })

function Boat() {
  const boat = useRef<THREE.Group>(null)
  return (
    <>
      <group ref={boat} rotation={[0, -Math.PI / 2, 0]} position={[0, 0.055, 0]}>
        <PinsContext.Provider value={false}>
          <BoatParts />
        </PinsContext.Provider>
      </group>
      <Pod boat={boat} control={podOnDeck} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <Canvas
    dpr={1}
    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
    camera={{ fov: 18, near: 0.1, far: 100, position: [2.9, 1.55, 4.7] }}
    onCreated={({ gl, camera }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping
      gl.toneMappingExposure = 1.1
      gl.setClearColor(0x000000, 0)
      camera.lookAt(0.05, 0.1, 0)
    }}
  >
    <Environment resolution={256} frames={1}>
      <Lightformer form="ring" intensity={3} color="#8fb6d2" position={[0, 5, -4]} scale={8} />
      <Lightformer form="rect" intensity={1.6} color="#ff8a73" position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} />
      <Lightformer form="rect" intensity={2} color="#7fb3d5" position={[6, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 1.5, 1]} />
      <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[2, 6, 3]} scale={3} />
      <Lightformer form="rect" intensity={0.8} color="#1e3a8a" position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
    </Environment>
    <ambientLight intensity={0.4} color="#9fb8cc" />
    <hemisphereLight args={['#6f94b3', '#101820', 0.6]} />
    <directionalLight position={[3, 6, 2]} intensity={2.2} color="#c7dcff" />
    <pointLight position={[-3, 1.2, -2.5]} intensity={3.2} color="#ff6fae" distance={10} decay={2} />
    <pointLight position={[2.5, -1.2, 2.5]} intensity={3} color="#3b9eff" distance={10} decay={2} />
    <Boat />
  </Canvas>,
)
