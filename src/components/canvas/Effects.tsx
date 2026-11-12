import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { sceneRefs } from './sceneRefs'

export function Effects() {
  const ca = useRef<{ offset: THREE.Vector2 }>(null)
  const offset = useRef(new THREE.Vector2(0.0006, 0.0004))
  useFrame((_, dt) => {
    // chromatic aberration pulse on each sonar ping
    sceneRefs.caPulse = Math.max(0, sceneRefs.caPulse - dt * 1.6)
    const p = sceneRefs.caPulse
    const amt = 0.0004 + p * p * 0.005
    offset.current.set(amt, amt * 0.7)
    if (ca.current) ca.current.offset.copy(offset.current)
  })
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.95} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur radius={0.65} />
      <ChromaticAberration
        ref={ca as never}
        blendFunction={BlendFunction.NORMAL}
        offset={offset.current}
        radialModulation
        modulationOffset={0.3}
      />
      <Vignette eskil={false} offset={0.22} darkness={0.85} />
    </EffectComposer>
  )
}
