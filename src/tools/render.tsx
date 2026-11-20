import { useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { BoatParts, PinsContext } from '../components/canvas/DelphylaxModel'
import { Pod, usePodGeometry, POD_ORIENT, POD_CORAL } from '../components/canvas/Pod'
import { MM } from '../components/canvas/sceneRefs'

/**
 * Development tool, not part of the built site: stills of the 3D models on a
 * transparent background, with the same lights as the live scene. Open it in
 * `npm run dev` and screenshot it to refresh the images in public/:
 *
 *   /tools/render.html            the boat with the Pod on deck   -> boat.webp
 *   /tools/render.html?shot=pod   the Pod alone, three-quarter    -> pod.webp
 *   /tools/render.html?shot=top   the Pod alone, from above       -> pod-top.webp
 */
const POD_MODEL = '/models/delphylax_pod.glb'
const shot = new URLSearchParams(window.location.search).get('shot') ?? 'boat'
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
      <Pod boat={boat} control={podOnDeck} url={POD_MODEL} />
    </>
  )
}

/** The Pod by itself: nose toward +X (to the right when seen from above). */
function PodAlone({ yaw }: { yaw: number }) {
  const geo = usePodGeometry(POD_MODEL)
  if (!geo) return null
  return (
    <group rotation={[0, -Math.PI / 2 + yaw, 0]}>
      <mesh geometry={geo} rotation={POD_ORIENT} scale={MM}>
        <meshPhysicalMaterial color={POD_CORAL} roughness={0.42} clearcoat={0.55} clearcoatRoughness={0.3} envMapIntensity={0.9} />
      </mesh>
    </group>
  )
}

const CAMERAS: Record<string, { fov: number; position: [number, number, number]; look: [number, number, number] }> = {
  boat: { fov: 18, position: [2.9, 1.55, 4.7], look: [0.05, 0.16, 0] },
  pod: { fov: 20, position: [1.25, 0.75, 2.2], look: [0, 0, 0] },
  top: { fov: 14, position: [0, 4.2, 0.001], look: [0, 0, 0] },
}
const cam = CAMERAS[shot] ?? CAMERAS.boat

createRoot(document.getElementById('root')!).render(
  <Canvas
    dpr={1}
    gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
    camera={{ fov: cam.fov, near: 0.1, far: 100, position: cam.position }}
    onCreated={({ gl, camera }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping
      gl.toneMappingExposure = 1.1
      gl.setClearColor(0x000000, 0)
      camera.lookAt(...cam.look)
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
    {shot === 'pod' ? <PodAlone yaw={0.55} /> : shot === 'top' ? <PodAlone yaw={0} /> : <Boat />}
  </Canvas>,
)
