import { lazy, Suspense, useEffect } from 'react'
import { useScrollSync, setScrollLocked } from './hooks/useScrollSync'
import { useSiteStore } from './store/useSiteStore'
import { HudOverlay } from './components/hud/HudOverlay'
import { Hero } from './components/sections/Hero'
import { Problem } from './components/sections/Problem'
import { HowItWorks } from './components/sections/HowItWorks'
import { Progress } from './components/sections/Progress'
import { CostImpact } from './components/sections/CostImpact'
import { Team } from './components/sections/Team'
import { SandboxOverlay } from './components/sections/SandboxOverlay'
import { DelphylaxMark } from './components/ui/DelphylaxLogo'

const Scene = lazy(() => import('./components/canvas/Scene').then((m) => ({ default: m.Scene })))

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f1519]">
      <div className="relative">
        <span className="sonar-ring absolute inset-0 rounded-full border border-[#4dd4c6]" />
        <span className="sonar-ring absolute inset-0 rounded-full border border-[#4dd4c6]" style={{ animationDelay: '0.8s' }} />
        <DelphylaxMark size={72} animated={false} />
      </div>
      <div className="mt-6 text-sm text-[#b7c3cc]">Loading the boat…</div>
    </div>
  )
}

export default function App() {
  useScrollSync()
  const webglOk = useSiteStore((s) => s.webglOk)
  const section = useSiteStore((s) => s.section)
  const sandboxOpen = useSiteStore((s) => s.sandboxOpen)
  const toggleExploded = useSiteStore((s) => s.toggleExploded)

  useEffect(() => {
    if (!supportsWebGL()) useSiteStore.getState().setWebglOk(false)
  }, [])

  // the exploded model is the labelled diagram in "How it works"
  useEffect(() => {
    document.documentElement.dataset.section = sandboxOpen ? 'sandbox' : section
    toggleExploded(section === 'how' && !sandboxOpen)
  }, [section, sandboxOpen, toggleExploded])

  useEffect(() => {
    setScrollLocked(sandboxOpen)
    if (!sandboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useSiteStore.getState().closeSandbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sandboxOpen])

  return (
    <>
      {webglOk ? (
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      ) : (
        <div className="fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, #163a52 0%, #0f1519 60%)' }} />
      )}
      <HudOverlay />
      {sandboxOpen && <SandboxOverlay />}
      <main className={`relative z-10 transition-opacity duration-300 ${sandboxOpen ? 'pointer-events-none invisible opacity-0' : ''}`}>
        <Hero />
        <Problem />
        <HowItWorks />
        <Progress />
        <CostImpact />
        <Team />
      </main>
    </>
  )
}
