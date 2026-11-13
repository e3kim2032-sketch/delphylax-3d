import { lazy, Suspense, useEffect } from 'react'
import { useScrollSync } from './hooks/useScrollSync'
import { useSiteStore } from './store/useSiteStore'
import { HudOverlay } from './components/hud/HudOverlay'
import { Hero } from './components/sections/Hero'
import { Crisis } from './components/sections/Crisis'
import { Engineering } from './components/sections/Engineering'
import { Sandbox } from './components/sections/Sandbox'
import { Matrix } from './components/sections/Matrix'
import { Business } from './components/sections/Business'
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
        <span className="sonar-ring absolute inset-0 rounded-full border border-[#5b8fb8]" />
        <span className="sonar-ring absolute inset-0 rounded-full border border-[#e8654f]" style={{ animationDelay: '0.8s' }} />
        <DelphylaxMark size={72} animated={false} />
      </div>
      <div className="mt-6 font-mono text-xs tracking-[0.35em] text-[#aab8c2]">INITIALISING ACOUSTIC ARRAY</div>
    </div>
  )
}

export default function App() {
  useScrollSync()
  const webglOk = useSiteStore((s) => s.webglOk)
  const section = useSiteStore((s) => s.section)
  const setSandbox = useSiteStore((s) => s.setSandbox)
  const toggleExploded = useSiteStore((s) => s.toggleExploded)

  useEffect(() => {
    if (!supportsWebGL()) useSiteStore.getState().setWebglOk(false)
  }, [])

  useEffect(() => {
    setSandbox(section === 'sandbox')
    document.documentElement.dataset.section = section
    if (section !== 'engineering') toggleExploded(false)
  }, [section, setSandbox, toggleExploded])

  return (
    <>
      {webglOk ? (
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      ) : (
        <div className="fixed inset-0 z-0 grid-bg" style={{ background: 'radial-gradient(ellipse at 30% 20%, #163a52 0%, #0f1519 60%)' }} />
      )}
      <HudOverlay />
      <main className="relative z-10">
        <Hero />
        <Crisis />
        <Engineering />
        <Sandbox />
        <Matrix />
        <Business />
      </main>
    </>
  )
}
