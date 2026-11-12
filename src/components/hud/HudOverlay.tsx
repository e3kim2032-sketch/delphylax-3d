import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Crosshair, Activity, Waves, ChevronUp, Menu, X } from 'lucide-react'
import { DelphylaxMark } from '../ui/DelphylaxLogo'
import { Waveform } from './Waveform'
import { ThermalGrid } from './ThermalGrid'
import { useSiteStore, MAX_MARKERS, type Section } from '../../store/useSiteStore'
import { SECTIONS, MAX_DEPTH_M, IDENTITY } from '../../data/research'
import { scrollToSection } from '../../hooks/useScrollSync'
import { sceneRefs } from '../canvas/sceneRefs'

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

function DepthGauge() {
  const depthM = useSiteStore((s) => s.depthM)
  const pct = Math.min(1, Math.max(0, -depthM / MAX_DEPTH_M))
  const ticks = Array.from({ length: 13 }, (_, i) => i)
  return (
    <div className="glass hud-corner flex flex-col items-center gap-2 rounded-md px-2 py-3" style={{ width: 54 }}>
      <span className="font-mono text-[8px] tracking-[0.08em] text-[#93a3ae]">DEPTH</span>
      <div className="relative h-44 w-3 overflow-hidden rounded-full border border-[rgba(147,163,174,0.3)] bg-[#050a1c]">
        <div
          className="absolute inset-x-0 top-0 rounded-full"
          style={{
            height: `${pct * 100}%`,
            background: 'linear-gradient(180deg, #3b9eff, #ff5fa2 70%, #ff2d55)',
            boxShadow: '0 0 12px rgba(255,95,162,0.7)',
            transition: 'height 0.25s ease-out',
          }}
        />
        {ticks.map((t) => (
          <span key={t} className="absolute left-0 h-px w-full bg-white/10" style={{ top: `${(t / 12) * 100}%` }} />
        ))}
      </div>
      <span className="font-mono text-[11px] font-semibold text-white">
        {depthM <= -0.05 ? depthM.toFixed(1) : '0.0'}
        <span className="text-[8px] text-[#93a3ae]">m</span>
      </span>
    </div>
  )
}

function SensorMonitor() {
  const pingCount = useSiteStore((s) => s.pingCount)
  const lock = useSiteStore((s) => s.lock)
  const markers = useSiteStore((s) => s.markers.length)
  const hdg = useRafText(() => `${Math.round(sceneRefs.heading).toString().padStart(3, '0')}°`, 120)
  const scan = useRafText(() => `${Math.round(Math.min(1, sceneRefs.reveal * 1.3) * 100)}%`, 120)
  return (
    <div className="glass hud-corner rounded-md p-3 font-mono" style={{ width: 248 }}>
      <div className="mb-2 flex items-center justify-between text-[8px] tracking-[0.08em] text-[#93a3ae]">
        <span className="flex items-center gap-1">
          <Activity size={10} /> {IDENTITY.unit} · {IDENTITY.model}
        </span>
        <span className={lock.active ? 'text-[#ff6b57]' : 'text-[#7fb3d5]'}>{lock.active ? '● LOCK' : '○ SCANNING'}</span>
      </div>
      <div className="flex gap-2">
        <div>
          <div className="mb-1 text-[7px] tracking-[0.08em] text-white/45">SONAR</div>
          <Waveform width={156} height={64} />
        </div>
        <div>
          <div className="mb-1 text-[7px] tracking-[0.08em] text-white/45">THERMAL 8×8</div>
          <ThermalGrid size={64} />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[9px] leading-tight">
        <div>
          <div className="text-white/50">HDG</div>
          <div className="text-[13px] text-white">
            <span ref={hdg}>178°</span>
          </div>
        </div>
        <div>
          <div className="text-white/50">SCAN</div>
          <div className="text-[13px] text-white">
            <span ref={scan}>0%</span>
          </div>
        </div>
        <div>
          <div className="text-white/50">MARKERS</div>
          <div className="text-[13px] text-white">
            {MAX_MARKERS - markers}
            <span className="text-[8px] text-[#93a3ae]">/{MAX_MARKERS}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[9px]">
        <span className="text-white/50">THERMAL ■ SONAR ■ GPS ■ VOICE</span>
        <span className="text-[#ff8a73]">{String(pingCount).padStart(4, '0')}</span>
      </div>
    </div>
  )
}

function Telemetry() {
  const section = useSiteStore((s) => s.section)
  const lights = useSiteStore((s) => s.lights)
  const clutter = useSiteStore((s) => s.clutter)
  const sparsity = useSiteStore((s) => s.sparsity)
  const ref = useRafText(() => {
    const n = sceneRefs.nose
    return `X ${n.x.toFixed(2)}  Y ${n.y.toFixed(2)}  Z ${n.z.toFixed(2)}`
  }, 120)
  const fpsRef = useRafText(() => `${Math.round(sceneRefs.fps)} FPS`, 500)
  const sec = SECTIONS.find((s) => s.id === section)
  return (
    <div className="glass flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full px-4 py-2 font-mono text-[9px] tracking-[0.15em] text-[#93a3ae]">
      <span className="text-white/80">
        SEC {sec?.index} · {sec?.label.toUpperCase()}
      </span>
      <span>
        LIGHTS <span className={lights ? 'text-[#f3ede1]' : 'text-white/40'}>{lights ? 'ON' : 'OFF'}</span>
      </span>
      <span className="hidden sm:inline">
        CLUTTER <span className={clutter === 'extreme' ? 'text-[#ff6b57]' : 'text-[#7fb3d5]'}>{clutter.toUpperCase()}</span>
      </span>
      <span className="hidden sm:inline">
        FILTER <span className={sparsity ? 'text-[#7fb3d5]' : 'text-[#ff6b57]'}>{sparsity ? 'ON' : 'OFF'}</span>
      </span>
      <span className="hidden md:inline" ref={ref} />
      <span ref={fpsRef} className="text-white/60" />
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
                className="absolute h-5 w-5 border-[#ff2d55]"
                style={{
                  top: i < 2 ? 0 : 'auto',
                  bottom: i >= 2 ? 0 : 'auto',
                  left: i % 2 === 0 ? 0 : 'auto',
                  right: i % 2 === 1 ? 0 : 'auto',
                  borderTopWidth: i < 2 ? 2 : 0,
                  borderBottomWidth: i >= 2 ? 2 : 0,
                  borderLeftWidth: i % 2 === 0 ? 2 : 0,
                  borderRightWidth: i % 2 === 1 ? 2 : 0,
                  boxShadow: '0 0 12px rgba(255,107,87,0.6)',
                }}
              />
            ))}
            <Crosshair className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ff2d55] blink" size={18} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function HudOverlay() {
  const section = useSiteStore((s) => s.section)
  const emitPing = useSiteStore((s) => s.emitPing)
  const [menu, setMenu] = useState(false)
  const [railsOpen, setRailsOpen] = useState(true)

  const jump = (id: Section) => {
    setMenu(false)
    scrollToSection(id)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 scanline">
      <Reticle />

      <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => jump('hero')} className="group flex items-center gap-3" aria-label="Delphylax home">
          <DelphylaxMark size={38} />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-[15px] font-800 tracking-[-0.02em] text-white">DELPHYLAX</span>
            <span className="font-mono text-[8px] tracking-[0.08em] text-[#93a3ae]">DOLPHIN GUARDIAN · FLOOD RESCUE</span>
          </div>
        </button>

        <nav className="glass hidden items-center gap-1 rounded-full p-1 lg:flex" aria-label="Section waypoints">
          {SECTIONS.map((s) => {
            const active = s.id === section
            return (
              <button
                key={s.id}
                onClick={() => jump(s.id as Section)}
                className="relative flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] transition-colors"
                style={{ color: active ? '#fff' : 'rgba(203,213,225,0.7)' }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(90deg, rgba(232,101,79,0.28), rgba(232,101,79,0.28))' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative">{s.index}</span>
                <span className="relative">{s.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)}
            className="btn-primary !px-4 !py-2 !text-[10px]"
            aria-label="Emit sonar ping"
          >
            <Radio size={14} className="blink" />
            <span className="hidden sm:inline">Emit Sonar Ping</span>
            <span className="sm:hidden">Ping</span>
          </button>
          <button onClick={() => setMenu((m) => !m)} className="glass rounded-full p-2 text-white lg:hidden" aria-label="Toggle navigation">
            {menu ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong pointer-events-auto absolute right-4 top-16 flex flex-col rounded-xl p-2 lg:hidden"
          >
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => jump(s.id as Section)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-left font-mono text-[10px] tracking-[0.08em] text-white/80 hover:bg-white/5"
              >
                <span className="text-[#ff8a73]">{s.index}</span>
                {s.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto absolute left-4 top-1/2 hidden -translate-y-1/2 md:block">
        <DepthGauge />
      </div>
      <div className="pointer-events-auto absolute right-4 top-24 hidden lg:block">
        <AnimatePresence initial={false}>
          {railsOpen && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <SensorMonitor />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setRailsOpen((v) => !v)}
          className="glass mt-2 ml-auto flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[8px] tracking-[0.08em] text-[#93a3ae]"
        >
          <Waves size={10} /> {railsOpen ? 'HIDE' : 'MONITOR'}
          <ChevronUp size={10} className={railsOpen ? '' : 'rotate-180'} />
        </button>
      </div>

      <div className="pointer-events-auto absolute inset-x-0 bottom-3 flex justify-center px-4">
        <Telemetry />
      </div>
    </div>
  )
}
