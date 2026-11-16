import { lazy, Suspense, useEffect, useState } from 'react'
import { useScrollSync } from './hooks/useScrollSync'
import { useSiteStore, useLive3d } from './store/useSiteStore'
import { HudOverlay } from './components/hud/HudOverlay'
import { Hero } from './components/sections/Hero'
import { Crisis } from './components/sections/Crisis'
import { Engineering } from './components/sections/Engineering'
import { Sandbox } from './components/sections/Sandbox'
import { Matrix } from './components/sections/Matrix'
import { Business } from './components/sections/Business'

// three.js, the scene and post-processing live in their own chunks and load after the text
const Scene = lazy(() => import('./components/canvas/Scene').then((m) => ({ default: m.Scene })))

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Static backdrop: what Read mode shows, and what sits behind the page while the 3D scene loads. */
function Backdrop() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden
      style={{
        background:
          'radial-gradient(ellipse at 25% 12%, rgba(22,58,82,0.9) 0%, transparent 55%), radial-gradient(ellipse at 88% 92%, rgba(232,101,79,0.12) 0%, transparent 50%), #0f1519',
      }}
    />
  )
}

export default function App() {
  useScrollSync()
  const live3d = useLive3d()
  const section = useSiteStore((s) => s.section)
  const setSandbox = useSiteStore((s) => s.setSandbox)
  const toggleExploded = useSiteStore((s) => s.toggleExploded)
  // the scene mounts only after the text has painted, so words always come first
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    if (!supportsWebGL()) useSiteStore.getState().setWebglOk(false)
  }, [])

  useEffect(() => {
    if (!live3d || sceneReady) return
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setSceneReady(true), { timeout: 1500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setSceneReady(true), 300)
    return () => window.clearTimeout(id)
  }, [live3d, sceneReady])

  useEffect(() => {
    document.documentElement.dataset.mode = live3d ? '3d' : 'read'
  }, [live3d])

  useEffect(() => {
    setSandbox(section === 'sandbox')
    document.documentElement.dataset.section = section
    if (section !== 'engineering') toggleExploded(false)
  }, [section, setSandbox, toggleExploded])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#e8654f] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0f1519]"
      >
        Skip to content
      </a>
      <Backdrop />
      {live3d && sceneReady && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
      <HudOverlay />
      <main id="main" className="relative z-10">
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
