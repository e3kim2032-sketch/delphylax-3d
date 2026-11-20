import { useEffect, useState } from 'react'
import { LifeBuoy, RotateCcw, Radio } from 'lucide-react'
import { POD } from '../../data/research'
import { useSiteStore, useLive3d } from '../../store/useSiteStore'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'

/** a still render of the real Pod model (made with tools/render.html), for Read mode */
const POD_SRC = `${import.meta.env.BASE_URL}pod.webp`
const POD_ALT = 'The Delphylax Pod: a chunky coral dolphin-shaped float with a dorsal fin, a tail and raised DELPHYLAX lettering.'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The Delphylax Pod. The words are the team's own; the 3D scene behind the text shows
 * the real Pod model turning slowly, then acts the words out: the Pod drops into the
 * water, glows, and the boat moves away. In Read mode a still render stands in.
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

  // the Pod turns slowly on show first; the drop then plays by itself (never with reduced motion)
  useEffect(() => {
    if (!live3d || section !== 'pod' || prefersReducedMotion()) return
    const id = window.setTimeout(() => {
      if (useSiteStore.getState().podDropAt === null) dropPod()
    }, 4200)
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
    window.setTimeout(dropPod, 2600)
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
        {/* Read mode on phones: the still render sits under the title */}
        {!live3d && <img src={POD_SRC} alt={POD_ALT} width={1200} height={900} className="mt-6 h-auto w-full max-w-xs lg:hidden" draggable={false} />}
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
      {/* Read mode, wide screens: a still render of the Pod where the live one would turn */}
      {!live3d && (
        <img
          src={POD_SRC}
          alt={POD_ALT}
          width={1200}
          height={900}
          className="pointer-events-none absolute right-[8%] top-1/2 hidden h-auto w-[34%] max-w-[560px] -translate-y-1/2 lg:block"
          style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))' }}
          draggable={false}
        />
      )}
    </SectionShell>
  )
}
