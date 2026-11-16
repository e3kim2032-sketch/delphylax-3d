import { useEffect, useRef } from 'react'
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
    let raf = 0
    let frame = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      frame++
      if (frame % 6 === 0) for (let i = 0; i < 64; i++) noise[i] = noise[i] * 0.7 + Math.random() * 0.3
      // bearing of the victim relative to the boat heading → column; distance → row
      const dx = sceneRefs.victim.x - sceneRefs.nose.x
      const dy = sceneRefs.victim.y - sceneRefs.nose.y
      const dz = sceneRefs.victim.z - sceneRefs.nose.z
      const bearing = Math.atan2(dz, dx) // boat faces +x
      const col = clamp(3.5 + (bearing / 0.8) * 3.5, 0, 7)
      const row = clamp(2 + Math.min(1, Math.hypot(dx, dy, dz) / 10) * 5, 0, 7)
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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function lerpColor(a: string, b: string, t: number) {
  const k = clamp(t, 0, 1)
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return `rgb(${Math.round(r1 + (r2 - r1) * k)},${Math.round(g1 + (g2 - g1) * k)},${Math.round(b1 + (b2 - b1) * k)})`
}
