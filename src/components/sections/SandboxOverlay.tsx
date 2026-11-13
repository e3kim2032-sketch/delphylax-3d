import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Shuffle, Boxes, Filter, MapPin, RotateCcw, X, Crosshair, Activity } from 'lucide-react'
import { useSiteStore, MAX_MARKERS } from '../../store/useSiteStore'
import { SONAR, IDENTITY } from '../../data/research'
import { SimTag } from '../ui/primitives'
import { Waveform } from '../hud/Waveform'
import { ThermalGrid } from '../hud/ThermalGrid'
import { sceneRefs } from '../canvas/sceneRefs'

const BLUE = '#7fb3d5'
const LOCK = '#ff6b57'

function useRafText(fn: () => string, interval = 80) {
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

/** Live sonar waveform + thermal grid. HUD style, teal data accent. */
function SensorMonitor() {
  const lock = useSiteStore((s) => s.lock)
  const pingCount = useSiteStore((s) => s.pingCount)
  const hdg = useRafText(() => `${Math.round(sceneRefs.heading).toString().padStart(3, '0')}°`, 120)
  const scan = useRafText(() => `${Math.round(Math.min(1, sceneRefs.reveal * 1.3) * 100)}%`, 120)
  return (
    <div className="hud-panel p-4 font-mono" style={{ width: 288 }}>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-[#b7c3cc]">
          <Activity size={12} /> {IDENTITY.model} <SimTag />
        </span>
        <span style={{ color: lock.active ? LOCK : BLUE }}>{lock.active ? '● LOCK' : '○ SCAN'}</span>
      </div>
      <div className="flex gap-3">
        <div>
          <div className="mb-1 text-xs text-[#b7c3cc]">SONAR</div>
          <Waveform width={176} height={64} />
        </div>
        <div>
          <div className="mb-1 text-xs text-[#b7c3cc]">THERMAL</div>
          <ThermalGrid size={64} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#b7c3cc]">
        <div>
          HDG
          <div className="text-base" style={{ color: BLUE }}>
            <span ref={hdg}>178°</span>
          </div>
        </div>
        <div>
          SCAN
          <div className="text-base" style={{ color: BLUE }}>
            <span ref={scan}>0%</span>
          </div>
        </div>
        <div>
          SWEEPS
          <div className="text-base" style={{ color: BLUE }}>
            {String(pingCount).padStart(4, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}

function RevealMeter() {
  const bar = useRef<HTMLDivElement>(null)
  const txt = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let id = 0
    const loop = () => {
      id = requestAnimationFrame(loop)
      const r = Math.min(1, sceneRefs.reveal * 1.3)
      if (bar.current) bar.current.style.width = `${r * 100}%`
      if (txt.current) txt.current.textContent = `${(r * 100).toFixed(0)}%`
    }
    loop()
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div>
      <div className="flex justify-between text-xs text-[#b7c3cc]">
        <span>Sonar echo return</span>
        <span ref={txt} className="font-mono" style={{ color: BLUE }}>
          0%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div ref={bar} className="h-full rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg,#3b9eff,#ff5fa2,#ff2d55)', transition: 'width 0.1s linear' }} />
      </div>
    </div>
  )
}

function TargetStatus() {
  const lock = useSiteStore((s) => s.lock)
  const sparsity = useSiteStore((s) => s.sparsity)
  const markers = useSiteStore((s) => s.markers)
  return (
    <div className="hud-panel space-y-3 p-4" style={{ borderColor: lock.active ? 'rgba(255,107,87,0.7)' : undefined, boxShadow: lock.active ? 'var(--glow-red)' : undefined }}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-[#b7c3cc]">
          Target status <SimTag />
        </span>
        <span className={`font-mono ${lock.active ? 'blink' : ''}`} style={{ color: lock.active ? LOCK : BLUE }}>
          {lock.active ? '● LOCKED' : '○ SEARCHING'}
        </span>
      </div>
      <RevealMeter />
      <div className="grid grid-cols-2 gap-3 text-xs text-[#b7c3cc]">
        <div>
          RANGE
          <div className="font-mono text-2xl" style={{ color: BLUE }}>
            {lock.distanceM ? lock.distanceM.toFixed(1) : '--.-'}
            <span className="text-sm text-[#b7c3cc]"> m</span>
          </div>
        </div>
        <div>
          CONFIDENCE
          <div className="font-mono text-2xl" style={{ color: BLUE }}>
            {(lock.confidence * 100).toFixed(0)}
            <span className="text-sm text-[#b7c3cc]"> %</span>
          </div>
        </div>
        <div>
          LOCK AT
          <div className="font-mono text-base text-[#eef3f6]">{(SONAR.lockThreshold * 100).toFixed(0)}%</div>
        </div>
        <div>
          MARKERS DROPPED
          <div className="font-mono text-base text-[#eef3f6]">
            {markers.length}/{MAX_MARKERS}
          </div>
        </div>
      </div>
      <p className="border-t border-white/10 pt-2 text-xs leading-relaxed text-[#b7c3cc]">
        {sparsity ? `Filter keeps the ${SONAR.sparsityK} strongest returns per sweep; sediment echoes are dropped.` : 'Filter off: every echo is kept and confidence collapses below the lock threshold.'}{' '}
        {SONAR.roles}
      </p>
    </div>
  )
}

function Reticle() {
  const lock = useSiteStore((s) => s.lock)
  return (
    <AnimatePresence>
      {lock.active && (
        <motion.div
          key="reticle"
          initial={{ opacity: 0, scale: 2.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.6 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="pointer-events-none absolute"
          style={{ left: `${lock.sx * 100}%`, top: `${lock.sy * 100}%`, transform: 'translate(-50%,-50%)' }}
        >
          <div className="relative h-28 w-28">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="absolute h-5 w-5"
                style={{
                  borderColor: LOCK,
                  borderStyle: 'solid',
                  top: i < 2 ? 0 : 'auto',
                  bottom: i >= 2 ? 0 : 'auto',
                  left: i % 2 === 0 ? 0 : 'auto',
                  right: i % 2 === 1 ? 0 : 'auto',
                  borderTopWidth: i < 2 ? 2 : 0,
                  borderBottomWidth: i >= 2 ? 2 : 0,
                  borderLeftWidth: i % 2 === 0 ? 2 : 0,
                  borderRightWidth: i % 2 === 1 ? 2 : 0,
                }}
              />
            ))}
            <Crosshair className="blink absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={18} style={{ color: BLUE }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * "Try the sonar": a full-screen mode over the 3D scene. The page is hidden and
 * scroll is locked while it is open; the camera dives to the sandbox waypoint.
 */
export function SandboxOverlay() {
  const close = useSiteStore((s) => s.closeSandbox)
  const clutter = useSiteStore((s) => s.clutter)
  const setClutter = useSiteStore((s) => s.setClutter)
  const sparsity = useSiteStore((s) => s.sparsity)
  const toggleSparsity = useSiteStore((s) => s.toggleSparsity)
  const emitPing = useSiteStore((s) => s.emitPing)
  const rehide = useSiteStore((s) => s.rehideVictim)
  const lock = useSiteStore((s) => s.lock)
  const markers = useSiteStore((s) => s.markers)
  const dropMarker = useSiteStore((s) => s.dropMarker)
  const reloadMarkers = useSiteStore((s) => s.reloadMarkers)
  const left = MAX_MARKERS - markers.length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-40">
      <Reticle />

      {/* top bar */}
      <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between border-b border-[#28343c] bg-[#0f1519] px-5 py-3 sm:px-10 md:border-transparent md:bg-transparent">
        <div className="flex items-center gap-3">
          <span className="font-display text-base font-700 text-[#eef3f6]">Try the sonar</span>
          <SimTag />
        </div>
        <button onClick={close} className="btn-secondary !px-4 !py-2 !text-sm" aria-label="Close the sonar sandbox">
          <X size={16} /> Close
        </button>
      </div>

      {/* controls, bottom-left */}
      <div className="pointer-events-auto absolute inset-x-4 bottom-4 sm:inset-x-auto sm:left-10 sm:w-[360px]">
        <div className="card space-y-4 p-5">
          <p className="text-sm leading-relaxed text-[#b7c3cc]">Click anywhere in the water to sweep the sonar. Raise the clutter or switch the filter off and watch the target vanish.</p>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">
              <Boxes size={13} /> Clutter
            </div>
            <div className="flex gap-2">
              <button className="toggle flex-1 justify-center" data-active={clutter === 'low'} onClick={() => setClutter('low')}>
                Low
              </button>
              <button className="toggle flex-1 justify-center" data-active={clutter === 'extreme'} onClick={() => setClutter('extreme')}>
                Flood debris
              </button>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#b7c3cc]">
              <Filter size={13} /> Echo filter
            </div>
            <div className="flex gap-2">
              <button className="toggle flex-1 justify-center" data-active={sparsity} onClick={() => toggleSparsity(true)}>
                On
              </button>
              <button className="toggle flex-1 justify-center" data-active={!sparsity} onClick={() => toggleSparsity(false)}>
                Off
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1 justify-center !px-3 !py-2.5 !text-sm" onClick={() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)}>
              <Radio size={15} /> Sweep
            </button>
            <button className="btn-secondary !px-3 !py-2.5" onClick={rehide} aria-label="Hide the target somewhere new">
              <Shuffle size={15} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary flex-1 justify-center !px-3 !py-2.5 !text-sm"
              disabled={!lock.active || left === 0}
              onClick={() => dropMarker(sceneRefs.stern.x, sceneRefs.stern.y, sceneRefs.stern.z)}
            >
              <MapPin size={15} /> Drop marker · {left} left
            </button>
            <button className="btn-secondary !px-3 !py-2.5" onClick={reloadMarkers} aria-label="Reload markers">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* readouts, right */}
      <div className="pointer-events-auto absolute right-4 top-20 hidden w-[288px] flex-col gap-3 md:flex lg:right-10">
        <div className="hidden lg:block">
          <SensorMonitor />
        </div>
        <TargetStatus />
      </div>
    </motion.div>
  )
}
