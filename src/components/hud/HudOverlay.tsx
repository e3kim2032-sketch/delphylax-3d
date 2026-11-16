import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Crosshair, Menu, X, BookOpen } from 'lucide-react'
import { DelphylaxMark } from '../ui/DelphylaxLogo'
import { SensorMonitor } from './SensorMonitor'
import { useSiteStore, useLive3d, type Section } from '../../store/useSiteStore'
import { SECTIONS, MAX_DEPTH_M } from '../../data/research'
import { scrollToSection } from '../../hooks/useScrollSync'
import { sceneRefs } from '../canvas/sceneRefs'

function DepthGauge() {
  const depthM = useSiteStore((s) => s.depthM)
  const pct = Math.min(1, Math.max(0, -depthM / MAX_DEPTH_M))
  const ticks = Array.from({ length: 13 }, (_, i) => i)
  return (
    <div className="card flex flex-col items-center gap-2 px-2 py-3" style={{ width: 54 }}>
      <span className="font-mono text-xs text-[#aab8c2]">DEPTH</span>
      <div className="relative h-40 w-3 overflow-hidden rounded-full border border-[rgba(147,163,174,0.3)] bg-[#050a1c]">
        <div
          className="absolute inset-x-0 top-0 rounded-full"
          style={{ height: `${pct * 100}%`, background: 'linear-gradient(180deg, #3b9eff, #ff5fa2 70%, #ff2d55)', transition: 'height 0.25s ease-out' }}
        />
        {ticks.map((t) => (
          <span key={t} className="absolute left-0 h-px w-full bg-white/10" style={{ top: `${(t / 12) * 100}%` }} />
        ))}
      </div>
      <span className="font-mono text-xs font-semibold text-white">
        {depthM <= -0.05 ? depthM.toFixed(1) : '0.0'}
        <span className="text-[#aab8c2]"> m</span>
      </span>
    </div>
  )
}

/** Lock reticle over the target. Field Test only, and only in the open middle of the screen. */
function Reticle() {
  const lock = useSiteStore((s) => s.lock)
  const clear = lock.sx > 0.32 && lock.sx < 0.72 && lock.sy > 0.14 && lock.sy < 0.9
  return (
    <AnimatePresence>
      {lock.active && clear && (
        <motion.div
          key="reticle"
          initial={{ opacity: 0, scale: 1.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute hidden lg:block"
          style={{ left: `${lock.sx * 100}%`, top: `${lock.sy * 100}%`, transform: 'translate(-50%,-50%)' }}
        >
          <div className="relative h-24 w-24">
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
                }}
              />
            ))}
            <Crosshair className="blink absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ff2d55]" size={18} aria-hidden />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Fixed chrome. The header is a solid bar, so page content never shows through it.
 * The only other fixed pieces are instruments that live in the page gutters:
 * the depth gauge (hero and Field Test, wide screens) and the sensor monitor
 * (hero only, extra-wide screens). Neither ever sits over a card.
 */
export function HudOverlay() {
  const section = useSiteStore((s) => s.section)
  const emitPing = useSiteStore((s) => s.emitPing)
  const live3d = useLive3d()
  const webglOk = useSiteStore((s) => s.webglOk)
  const readMode = useSiteStore((s) => s.readMode)
  const setReadMode = useSiteStore((s) => s.setReadMode)
  const readOn = readMode || !webglOk
  const [menu, setMenu] = useState(false)
  const inHero = section === 'hero'
  const inSandbox = section === 'sandbox'

  const jump = (id: Section) => {
    setMenu(false)
    scrollToSection(id)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#0f1519]/90 backdrop-blur-md">
        <div className="flex h-[60px] items-center justify-between gap-3 px-4 sm:px-6">
          <button type="button" onClick={() => jump('hero')} className="flex items-center gap-3 rounded-md" aria-label="Delphylax home">
            <DelphylaxMark size={36} />
            <span className="hidden whitespace-nowrap font-display text-base font-700 tracking-[-0.02em] text-white sm:inline lg:hidden xl:inline">DELPHYLAX</span>
          </button>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Sections">
            {SECTIONS.map((s) => {
              const active = s.id === section
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => jump(s.id as Section)}
                  aria-current={active ? 'true' : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${active ? 'text-white' : 'text-[#b9c4cc] hover:text-white'}`}
                >
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-[rgba(232,101,79,0.24)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  <span className="relative">{s.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReadMode(!readMode)}
              disabled={!webglOk}
              aria-pressed={readOn}
              aria-label="Read mode"
              title={webglOk ? 'Read mode turns the 3D scene off for a fast, text-first page' : 'This device cannot run the 3D scene, so Read mode stays on'}
              className="btn-secondary btn-sm"
              data-active={readOn}
            >
              <BookOpen size={15} aria-hidden />
              <span className="hidden sm:inline">Read mode</span>
              <span className="sm:hidden">Read</span>
              <span className="font-mono text-xs text-[#aab8c2]">{readOn ? 'on' : 'off'}</span>
            </button>
            {live3d && (
              <button type="button" onClick={() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z)} className="btn-primary btn-sm" aria-label="Emit sonar ping">
                <Radio size={15} aria-hidden />
                <span>Ping</span>
              </button>
            )}
            <button type="button" onClick={() => setMenu((m) => !m)} className="btn-secondary btn-sm !px-2.5 lg:hidden" aria-label="Toggle navigation" aria-expanded={menu}>
              {menu ? <X size={17} aria-hidden /> : <Menu size={17} aria-hidden />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menu && (
            <motion.nav
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="card absolute right-4 top-[66px] flex min-w-52 flex-col p-2 lg:hidden"
              aria-label="Sections"
            >
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" onClick={() => jump(s.id as Section)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base text-white hover:bg-white/5">
                  <span className="font-mono text-xs text-[#ff8a73]">{s.index}</span>
                  {s.label}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {live3d && (
        <div className="pointer-events-none fixed inset-0 z-20">
          {inSandbox && <Reticle />}
          <AnimatePresence>
            {(inHero || inSandbox) && (
              <motion.div key="gauge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute left-3 top-1/2 hidden -translate-y-1/2 lg:block">
                <DepthGauge />
              </motion.div>
            )}
            {inHero && (
              <motion.div key="monitor" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.3 }} className="absolute right-4 top-[84px] hidden w-[292px] xl:block">
                <SensorMonitor />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
