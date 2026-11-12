import { useEffect, useRef } from 'react'
import { useSiteStore } from '../../store/useSiteStore'
import { sceneRefs, METERS_PER_UNIT, SONAR_SPEED } from '../canvas/sceneRefs'

/**
 * Oscilloscope-style acoustic trace. Baseline hydrophone noise, a sharp
 * transmit spike on every ping, and a delayed echo whose delay scales with
 * the real scene distance to the target. Echo turns red on a target lock.
 */
export function Waveform({ width = 220, height = 54 }: { width?: number; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = width * dpr
    c.height = height * dpr
    ctx.scale(dpr, dpr)
    let raf = 0
    const samples = new Float32Array(width)
    let phase = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const st = useSiteStore.getState()
      const now = performance.now() / 1000
      phase += 0.6
      // shift left
      samples.copyWithin(0, 1)
      let v = (Math.random() - 0.5) * 0.12 + Math.sin(phase * 0.9) * 0.04
      // transmit spike
      const since = now - sceneRefs.lastPing
      if (since >= 0 && since < 0.08) v += Math.sin(since * 400) * 0.95
      // echo
      const dist = sceneRefs.nose.distanceTo(sceneRefs.victim)
      const echoDelay = dist / SONAR_SPEED
      const echoAge = since - echoDelay
      if (echoAge > 0 && echoAge < 0.1) v += Math.sin(echoAge * 300) * 0.55 * Math.max(0.15, sceneRefs.reveal)
      samples[width - 1] = Math.max(-1, Math.min(1, v))

      ctx.clearRect(0, 0, width, height)
      // grid
      ctx.strokeStyle = 'rgba(127,179,213,0.12)'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 22) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      const grad = ctx.createLinearGradient(0, 0, width, 0)
      grad.addColorStop(0, '#5b8fb8')
      grad.addColorStop(1, st.lock.active ? '#ff2d55' : '#e8654f')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.shadowColor = st.lock.active ? 'rgba(255,107,87,0.8)' : 'rgba(232,101,79,0.6)'
      ctx.shadowBlur = 6
      ctx.beginPath()
      for (let x = 0; x < width; x++) {
        const y = height / 2 - samples[x] * (height / 2 - 3)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0
      void METERS_PER_UNIT
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [width, height])
  return <canvas ref={ref} style={{ width, height }} className="block" />
}
