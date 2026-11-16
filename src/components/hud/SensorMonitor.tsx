import { useEffect, useRef } from 'react'
import { Activity } from 'lucide-react'
import { Waveform } from './Waveform'
import { ThermalGrid } from './ThermalGrid'
import { SimTag } from '../ui/primitives'
import { useSiteStore, MAX_MARKERS } from '../../store/useSiteStore'
import { IDENTITY } from '../../data/research'
import { sceneRefs } from '../canvas/sceneRefs'

/** Writes a fast-changing value straight into a span, without re-rendering React. */
export function useRafText(fn: () => string, interval = 80) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let id = 0
    let last = 0
    const loop = (t: number) => {
      id = requestAnimationFrame(loop)
      if (t - last < interval) return
      last = t
      if (ref.current) ref.current.textContent = fn()
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [fn, interval])
  return ref
}

/** Simulated sonar trace and 8×8 heat grid. Used in the hero corner and inside the Field Test panel. */
export function SensorMonitor({ className = '' }: { className?: string }) {
  const pingCount = useSiteStore((s) => s.pingCount)
  const lock = useSiteStore((s) => s.lock)
  const markers = useSiteStore((s) => s.markers.length)
  const hdg = useRafText(() => `${Math.round(sceneRefs.heading).toString().padStart(3, '0')}°`, 120)
  const scan = useRafText(() => `${Math.round(Math.min(1, sceneRefs.reveal * 1.3) * 100)}%`, 120)
  return (
    <div className={`card card-pad font-mono ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-[#aab8c2]">
        <span className="flex items-center gap-1.5">
          <Activity size={12} aria-hidden /> {IDENTITY.model} <SimTag />
        </span>
        <span className={lock.active ? 'text-[#ff6b57]' : 'text-[#7fb3d5]'}>{lock.active ? '● LOCK' : '○ SCANNING'}</span>
      </div>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs text-[#aab8c2]">SONAR</div>
          <Waveform width={168} height={64} />
        </div>
        <div>
          <div className="mb-1 text-xs text-[#aab8c2]">THERMAL</div>
          <ThermalGrid size={64} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#aab8c2]">
        <div>
          HDG
          <div className="text-sm text-white">
            <span ref={hdg}>178°</span>
          </div>
        </div>
        <div>
          SCAN
          <div className="text-sm text-white">
            <span ref={scan}>0%</span>
          </div>
        </div>
        <div>
          SWEEPS
          <div className="text-sm text-white">{String(pingCount).padStart(4, '0')}</div>
        </div>
      </div>
      <div className="mt-3 border-t border-white/10 pt-2 text-xs text-[#aab8c2]">
        Markers left {MAX_MARKERS - markers}/{MAX_MARKERS} · GPS planned
      </div>
    </div>
  )
}
