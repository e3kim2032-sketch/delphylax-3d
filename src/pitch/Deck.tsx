import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { live } from './live'
import { SLIDES, ReduceContext } from './slides'

// three.js loads after the first slide is on screen; once it is in, the deck needs no network
const Stage3D = lazy(() => import('./Stage3D'))

interface Pos {
  slide: number
  step: number
  dir: 1 | -1
}

const LAST = SLIDES.length - 1

/** "#5" or "#5.2": slide 5, step 2. Lets a reload (or a shared link) land on the same view. */
function readHash(): Pos {
  const m = /^#(\d+)(?:\.(\d+))?$/.exec(window.location.hash)
  const slide = m ? Math.min(LAST, Math.max(0, Number(m[1]) - 1)) : 0
  const step = m && m[2] ? Math.min(SLIDES[slide].steps, Number(m[2])) : 0
  return { slide, step, dir: 1 }
}

const first = readHash()
live.slide = first.slide
live.step = first.step
live.stepAt = performance.now()

/** If WebGL is missing or the 3D scene fails, the deck carries on over a plain backdrop. */
class StageBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// slide change: the old slide sinks back and away, the new one arrives from the side
const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 110, scale: 1.05 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -80, scale: 0.93, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }),
}

export function Deck() {
  const reduce = !!useReducedMotion()
  const [pos, setPos] = useState<Pos>(first)
  const [webgl, setWebgl] = useState(true)
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    live.slide = pos.slide
    live.step = pos.step
    live.stepAt = performance.now()
  }, [pos.slide, pos.step])
  useLayoutEffect(() => {
    live.reduce = reduce
  }, [reduce])

  // scale the 1920 x 1080 frame to the window
  useLayoutEffect(() => {
    const fit = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const k = Math.min(vw / 1920, vh / 1080)
      const w = 1920 * k
      const h = 1080 * k
      live.frame = { x: (vw - w) / 2, y: (vh - h) / 2, w, h }
      const el = root.current
      if (!el) return
      el.style.setProperty('--k', String(k))
      el.style.setProperty('--fx', `${live.frame.x}px`)
      el.style.setProperty('--fw', `${w}px`)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const next = useCallback(
    () =>
      setPos((p) => {
        if (p.step < SLIDES[p.slide].steps) return { slide: p.slide, step: p.step + 1, dir: 1 }
        if (p.slide < LAST) return { slide: p.slide + 1, step: 0, dir: 1 }
        return p
      }),
    [],
  )
  const back = useCallback(
    () =>
      setPos((p) => {
        if (p.step > 0) return { slide: p.slide, step: p.step - 1, dir: -1 }
        if (p.slide > 0) return { slide: p.slide - 1, step: SLIDES[p.slide - 1].steps, dir: -1 }
        return p
      }),
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      const onControl = !!t && (t.tagName === 'BUTTON' || t.tagName === 'A')
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case ' ':
        case 'Enter':
          // on a focused button or link these keys press it instead
          if (onControl) return
          e.preventDefault()
          if (e.shiftKey) back()
          else next()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          back()
          break
        case 'Home':
          e.preventDefault()
          setPos({ slide: 0, step: 0, dir: -1 })
          break
        case 'End':
          e.preventDefault()
          setPos({ slide: LAST, step: 0, dir: 1 })
          break
        case 'f':
        case 'F':
          if (document.fullscreenElement) void document.exitFullscreen()
          else void document.documentElement.requestFullscreen?.().catch(() => {})
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, back])

  // keep the address in step with the view, and follow hand-typed hashes
  useEffect(() => {
    const hash = `#${pos.slide + 1}${pos.step ? `.${pos.step}` : ''}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [pos.slide, pos.step])
  useEffect(() => {
    const onHash = () => setPos((p) => {
      const h = readHash()
      return h.slide === p.slide && h.step === p.step ? p : { ...h, dir: h.slide >= p.slide ? 1 : -1 }
    })
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const meta = SLIDES[pos.slide]
  const Slide = meta.Comp
  const atStart = pos.slide === 0 && pos.step === 0
  const atEnd = pos.slide === LAST && pos.step === meta.steps
  const progress = (pos.slide + (meta.steps ? pos.step / (meta.steps + 1) : 0)) / LAST

  return (
    <div ref={root} className="pitch-root">
      <div className="pitch-backdrop" aria-hidden />
      {webgl && (
        <div className="pitch-canvas" aria-hidden>
          <StageBoundary onError={() => setWebgl(false)}>
            <Suspense fallback={null}>
              <Stage3D onError={() => setWebgl(false)} />
            </Suspense>
          </StageBoundary>
        </div>
      )}
      <div className="pitch-scrim pitch-scrim-full" data-on={meta.scrim === 'full'} aria-hidden />
      <div className="pitch-scrim pitch-scrim-side" data-on={meta.scrim === 'side'} aria-hidden />

      <main className="pitch-stage">
        <ReduceContext.Provider value={reduce}>
          <AnimatePresence custom={pos.dir} initial={false}>
            <motion.section
              key={pos.slide}
              custom={pos.dir}
              variants={reduce ? undefined : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
              aria-roledescription="slide"
              aria-label={`${pos.slide + 1} of ${SLIDES.length}: ${meta.title}`}
            >
              <Slide step={pos.step} />
            </motion.section>
          </AnimatePresence>
        </ReduceContext.Provider>
      </main>

      <nav className="pitch-controls" aria-label="Slides">
        <button type="button" onClick={back} disabled={atStart} aria-label="Back">
          <ChevronLeft size={18} aria-hidden />
        </button>
        <span className="pitch-count" aria-live="polite">
          {pos.slide + 1} / {SLIDES.length}
        </span>
        <button type="button" onClick={next} disabled={atEnd} aria-label="Next">
          <ChevronRight size={18} aria-hidden />
        </button>
      </nav>
      <div className="pitch-progress" aria-hidden>
        <div style={{ width: `${Math.min(1, progress) * 100}%` }} />
      </div>
    </div>
  )
}
