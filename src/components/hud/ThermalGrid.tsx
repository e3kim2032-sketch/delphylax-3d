import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { sceneRefs } from '../canvas/sceneRefs'

/**
 * AMG8833-style 8×8 thermal readout. Cool, noisy background; a warm blob
 * appears at the target's bearing with strength = current sonar/thermal reveal.
 */
export function ThermalGrid({ size = 64 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = size * dpr
    c.height = size * dpr
    ctx.scale(dpr, dpr)
    const cell = size / 8
    const noise = new Float32Array(64).map(() => Math.random())
    const dir = new THREE.Vector3()
    let raf = 0
    let frame = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      frame++
      if (frame % 6 === 0) for (let i = 0; i < 64; i++) noise[i] = noise[i] * 0.7 + Math.random() * 0.3
      // bearing of the victim relative to the boat heading → column; distance → row
      dir.copy(sceneRefs.victim).sub(sceneRefs.nose)
      const bearing = Math.atan2(dir.z, dir.x) // boat faces +x
      const col = THREE.MathUtils.clamp(3.5 + (bearing / 0.8) * 3.5, 0, 7)
      const row = THREE.MathUtils.clamp(2 + Math.min(1, dir.length() / 10) * 5, 0, 7)
      const r = sceneRefs.reveal
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const d = Math.hypot(x - col, y - row)
          const warm = r * Math.exp(-d * d * 0.55)
          const base = 0.08 + noise[y * 8 + x] * 0.14
          const v = Math.min(1, base + warm)
          // sequential heat ramp: deep blue → pink → crimson/white
          const col1 = v < 0.5 ? lerpColor('#0b1a3f', '#5b8fb8', v * 2) : v < 0.8 ? lerpColor('#5b8fb8', '#e8654f', (v - 0.5) / 0.3) : lerpColor('#e8654f', '#ffe4ec', (v - 0.8) / 0.2)
          ctx.fillStyle = col1
          ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1)
        }
      }
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [size])
  return <canvas ref={ref} style={{ width: size, height: size }} className="block rounded-sm" aria-label="8 by 8 thermal camera readout" />
}

const ca = new THREE.Color()
const cb = new THREE.Color()
function lerpColor(a: string, b: string, t: number) {
  ca.set(a)
  cb.set(b)
  ca.lerp(cb, THREE.MathUtils.clamp(t, 0, 1))
  return `#${ca.getHexString()}`
}
