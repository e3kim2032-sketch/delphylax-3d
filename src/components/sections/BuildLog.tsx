import { useState } from 'react'
import { Camera, Hammer } from 'lucide-react'
import { BUILD_LOG, BUILD_STATUS } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'

const BASE = import.meta.env.BASE_URL

/**
 * One photo slot. Tries `public/build/<id>.jpg`; if the file is missing the
 * slot stays a labelled placeholder, so the grid can go live before the photos do.
 */
function PhotoSlot({ id, date, caption, index }: { id: string; date: string; caption: string; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const [missing, setMissing] = useState(false)
  const src = `${BASE}build/${id}.jpg`
  return (
    <figure className="glass hud-corner group overflow-hidden rounded-lg">
      <div className="relative aspect-[4/3] w-full bg-[#131c22]">
        {!missing && (
          <img
            src={src}
            alt={caption}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setMissing(true)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: loaded ? 1 : 0 }}
          />
        )}
        {(missing || !loaded) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 text-center">
            <Camera size={22} className="text-white/55" />
            <span className="font-mono text-xs text-white/72">Photo {String(index + 1).padStart(2, '0')}</span>
            <span className="px-4 font-mono text-xs text-white/60">public/build/{id}.jpg</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-[#0f1519]/85 px-2 py-0.5 font-mono text-xs text-[#ffb4a6]">{date}</span>
      </div>
      <figcaption className="px-3 py-2.5 text-xs leading-snug text-[#f3ede1]/85">{caption}</figcaption>
    </figure>
  )
}

export function BuildLog() {
  return (
    <SectionShell id="buildlog" className="!items-start">
      <div className="pointer-events-auto w-full max-w-7xl">
        <Reveal>
          <Kicker index="04">Build log</Kicker>
          <Title>
            Built one <span className="text-gradient">step at a time.</span>
          </Title>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#d7dde3]">{BUILD_STATUS.summary}</p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {BUILD_LOG.map((p, i) => (
              <PhotoSlot key={p.id} id={p.id} date={p.date} caption={p.caption} index={i} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={2}>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="glass hud-corner rounded-lg p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs text-[#aab8c2]">
                <Hammer size={12} /> Done
              </div>
              <ul className="space-y-1.5">
                {BUILD_STATUS.done.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-xs text-[#f3ede1]/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7fb3d5]" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass hud-corner rounded-lg p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs text-[#aab8c2]">
                <Camera size={12} /> Still to do
              </div>
              <ul className="space-y-1.5">
                {BUILD_STATUS.todo.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-xs text-[#b9c4cc]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-white/40" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
