import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSiteStore, type Section } from '../store/useSiteStore'
import { SECTIONS } from '../data/research'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

/** Freeze page scroll while the sonar overlay is open. */
export function setScrollLocked(locked: boolean) {
  if (!lenisInstance) return
  if (locked) lenisInstance.stop()
  else lenisInstance.start()
}

export function scrollToSection(id: Section, offset = 0) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenisInstance) lenisInstance.scrollTo(el, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Lenis inertial scrolling, synced to the GSAP ticker (which R3F shares the
 * browser RAF with), feeding ScrollTrigger and the site store.
 */
export function useScrollSync() {
  const setScroll = useSiteStore((s) => s.setScroll)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({
      lerp: reduce ? 1 : 0.085,
      wheelMultiplier: 1,
      smoothWheel: !reduce,
    })
    lenisInstance = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const ids = SECTIONS.map((s) => s.id)
    const compute = () => {
      const els = ids.map((id) => document.getElementById(id))
      const y = lenis.scroll
      const vh = window.innerHeight
      const tops = els.map((el) => (el ? el.offsetTop : 0))
      // continuous section progress: i + frac
      let i = 0
      for (let k = 0; k < tops.length; k++) if (y + vh * 0.45 >= tops[k]) i = k
      const next = Math.min(i + 1, tops.length - 1)
      const span = Math.max(1, tops[next] - tops[i])
      const frac = i === next ? 1 : Math.min(1, Math.max(0, (y - tops[i]) / span))
      const sp = i + frac
      const progress = sp / (ids.length - 1)
      const depth = SECTIONS[i].depth + (SECTIONS[next].depth - SECTIONS[i].depth) * frac
      setScroll(progress, depth, ids[i])
    }
    lenis.on('scroll', compute)
    compute()
    const onResize = () => {
      compute()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [setScroll])
}
