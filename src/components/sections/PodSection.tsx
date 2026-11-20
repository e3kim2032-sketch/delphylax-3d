import { useEffect, useState } from 'react'
import { LifeBuoy, RotateCcw, Radio } from 'lucide-react'
import { POD } from '../../data/research'
import { useSiteStore, useLive3d } from '../../store/useSiteStore'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The Delphylax Pod. The words are the team's own (from the funding pitch); the
 * 3D boat behind the text acts them out: the Pod drops, glows, and the boat backs away.
 */
export function PodSection() {
  const live3d = useLive3d()
  const webglOk = useSiteStore((s) => s.webglOk)
  const setReadMode = useSiteStore((s) => s.setReadMode)
  const section = useSiteStore((s) => s.section)
  const podDropAt = useSiteStore((s) => s.podDropAt)
  const dropPod = useSiteStore((s) => s.dropPod)
  const resetPod = useSiteStore((s) => s.resetPod)
  const dropped = podDropAt !== null

  // the drop plays by itself a moment after you arrive (never with reduced motion)
  useEffect(() => {
    if (!live3d || section !== 'pod' || prefersReducedMotion()) return
    const id = window.setTimeout(() => {
      if (useSiteStore.getState().podDropAt === null) dropPod()
    }, 1300)
    return () => window.clearTimeout(id)
  }, [live3d, section, dropPod])

  // each line lights up as the boat acts it out
  const [lit, setLit] = useState(0)
  useEffect(() => {
    if (podDropAt === null) {
      setLit(0)
      return
    }
    if (prefersReducedMotion()) {
      setLit(3)
      return
    }
    setLit(1)
    const a = window.setTimeout(() => setLit(2), 950)
    const b = window.setTimeout(() => setLit(3), 2100)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [podDropAt])

  const replay = () => {
    resetPod()
    window.setTimeout(dropPod, 750)
  }

  return (
    <SectionShell id="pod" className="!min-h-[76vh]">
      <div className="pointer-events-auto w-full max-w-xl">
        <Reveal className="text-scrim">
          <Kicker index="04">{POD.quoteBy}</Kicker>
          <Title>
            The <span className="text-gradient">Delphylax Pod.</span>
          </Title>
        </Reveal>
        <Reveal delay={1}>
          <blockquote className="card mt-7 border-l-4 !border-l-[#e8654f] card-pad">
            <p className="font-display text-xl font-600 leading-snug text-[#f3ede1]">“{POD.quote}”</p>
          </blockquote>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-6 text-lg font-semibold text-white">{POD.intro}</p>
          <ol className="mt-3 space-y-1.5">
            {POD.lines.map((line, i) => {
              const on = dropped && (lit === i + 1 || lit === 3)
              return (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-[10px] border px-3 py-2 transition-colors duration-300"
                  style={{ borderColor: on ? '#e8654f' : 'transparent', background: on ? 'rgba(232,101,79,0.14)' : 'transparent' }}
                >
                  <span className="mt-[0.6rem] h-2 w-2 shrink-0 rounded-full bg-[#ff8a73]" aria-hidden />
                  <span className="text-base leading-relaxed" style={{ color: on ? '#fff' : '#dbe2e8' }}>
                    {line}
                  </span>
                </li>
              )
            })}
          </ol>
        </Reveal>
        <Reveal delay={3}>
          {live3d ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {dropped ? (
                <button type="button" className="btn-secondary" onClick={replay}>
                  <RotateCcw size={16} aria-hidden /> Drop it again
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={dropPod}>
                  <LifeBuoy size={16} aria-hidden /> Drop the Pod
                </button>
              )}
            </div>
          ) : (
            webglOk && (
              <button type="button" className="btn-secondary btn-sm mt-6" onClick={() => setReadMode(false)}>
                <Radio size={15} aria-hidden /> Turn on 3D to watch the drop
              </button>
            )
          )}
        </Reveal>
      </div>
    </SectionShell>
  )
}
