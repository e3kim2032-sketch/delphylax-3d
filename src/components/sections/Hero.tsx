import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Radio, Cpu, ArrowDown } from 'lucide-react'
import { IDENTITY, HERO_FACTS, IMPACT } from '../../data/research'
import { SectionShell, Counter } from '../ui/primitives'
import { scrollToSection } from '../../hooks/useScrollSync'
import { useSiteStore, useLive3d } from '../../store/useSiteStore'
import { sceneRefs } from '../canvas/sceneRefs'

/** a still render of the 3D model (made with tools/render.html), shown when the live scene is off */
const BOAT_SRC = `${import.meta.env.BASE_URL}boat.webp`
const BOAT_ALT = 'The Delphylax robot boat: two white pipe hulls with coral nose cones, joined by a deck that carries a coral cabin with a dolphin fin.'

export function Hero() {
  const root = useRef<HTMLDivElement>(null)
  const emitPing = useSiteStore((s) => s.emitPing)
  const toggleExploded = useSiteStore((s) => s.toggleExploded)
  const live3d = useLive3d()

  useEffect(() => {
    // with reduced motion the hero is simply shown: no intro animation to wait for
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-line', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.25 })
      gsap.from('.hero-fade', { opacity: 0, y: 18, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.8 })
    }, root)
    return () => ctx.revert()
  }, [])

  const launch = () => {
    scrollToSection('sandbox')
    if (live3d) setTimeout(() => emitPing(sceneRefs.nose.x, sceneRefs.nose.y, sceneRefs.nose.z), 1400)
  }
  const inspect = () => {
    scrollToSection('engineering')
    if (live3d) setTimeout(() => toggleExploded(true), 900)
  }

  return (
    <SectionShell id="hero" className="!pb-4">
      <div ref={root} className="text-scrim pointer-events-auto w-full max-w-2xl">
        <div className="hero-fade mb-5 flex flex-wrap items-center gap-2">
          {IDENTITY.competitions.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
          <span className="chip" style={{ color: '#ffb4a6', borderColor: 'rgba(232,101,79,0.45)', background: 'rgba(232,101,79,0.1)' }}>
            {IDENTITY.model} · {IDENTITY.unit}
          </span>
        </div>

        <h1 className="font-display text-[11vw] font-700 leading-[0.98] text-[#f3ede1] sm:text-6xl lg:text-[4.3rem]">
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">Guardian of </span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block text-[#ff8a73]">zero-visibility </span>
          </span>
          <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
            <span className="hero-line block">waters.</span>
          </span>
        </h1>

        <p className="hero-fade mt-5 max-w-[62ch] text-base leading-relaxed text-[#d7dde3] sm:text-[1.0625rem]">{IDENTITY.oneLiner}</p>
        <dl className="hero-fade mt-4 max-w-xl space-y-1.5">
          {HERO_FACTS.map((f) => (
            <div key={f.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 pt-0.5 font-mono text-xs text-[#ff8a73] sm:w-28">{f.label}</dt>
              <dd className="text-base leading-relaxed text-[#eef3f6]">{f.text}</dd>
            </div>
          ))}
        </dl>
        <p className="hero-fade mt-3 max-w-xl text-base leading-relaxed text-[#aab8c2]">
          {IDENTITY.greek}. {IDENTITY.inspiration}
        </p>

        <div className="hero-fade mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={launch}>
            <Radio size={16} aria-hidden /> {live3d ? 'Launch Sonar Simulation' : 'See the Field Test'}
          </button>
          <button className="btn-secondary" onClick={inspect}>
            <Cpu size={16} aria-hidden /> Inspect Hardware
          </button>
        </div>

        {/* Read mode has no 3D scene: phones get the still picture of the boat here */}
        {!live3d && <img src={BOAT_SRC} alt={BOAT_ALT} width={1600} height={853} className="hero-fade mt-8 h-auto w-full max-w-md lg:hidden" draggable={false} />}

        <div className="hero-fade mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {IMPACT.map((c) => (
            <Counter key={c.label} prefix={c.prefix} value={c.value} suffix={c.suffix} label={c.label} source={c.source} />
          ))}
        </div>

        <button onClick={() => scrollToSection('crisis')} className="hero-fade mt-5 flex items-center gap-2 rounded-md text-sm text-[#aab8c2] hover:text-white">
          <ArrowDown size={12} className="animate-bounce motion-reduce:animate-none" aria-hidden /> Scroll down.{live3d ? ' Click anywhere in the water to ping.' : ''}
        </button>
      </div>
      {/* Read mode, wide screens: the still picture fills the half where the live boat would float */}
      {!live3d && (
        <img
          src={BOAT_SRC}
          alt={BOAT_ALT}
          width={1600}
          height={853}
          className="pointer-events-none absolute right-[3%] top-1/2 hidden h-auto w-[42%] max-w-[720px] -translate-y-[55%] lg:block"
          style={{ filter: 'drop-shadow(0 34px 44px rgba(0,0,0,0.5))' }}
          draggable={false}
        />
      )}
    </SectionShell>
  )
}
