import { useState } from 'react'
import { Check, Minus, X } from 'lucide-react'
import { COMPETITORS, MATRIX_COLUMNS, COST } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'

function Score({ n }: { n: number }) {
  const Icon = n >= 4 ? Check : n >= 3 ? Minus : X
  const color = n >= 4 ? '#7fb3d5' : n >= 3 ? '#ff8a73' : '#ff6b57'
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={12} style={{ color }} />
      <span className="flex gap-0.5" aria-label={`${n} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i <= n ? color : 'rgba(255,255,255,0.12)' }} />
        ))}
      </span>
    </span>
  )
}

export function Matrix() {
  const [hover, setHover] = useState<string | null>(null)
  return (
    <SectionShell id="matrix" align="center" className="!items-end lg:!items-center">
      <div className="pointer-events-auto w-full max-w-6xl lg:pt-20">
        <Reveal>
          <Kicker index="05">Competitive matrix</Kicker>
          <Title className="max-w-3xl">
            About <span className="text-gradient">1/{COST.ratio} the price</span> of a proven rescue robot.
          </Title>
          <p className="mt-3 max-w-2xl text-sm text-[#d7dde3]">
            EMILY, used by navies and lifeguards, sells for about ${COST.emilyUsd.toLocaleString()} ({COST.emilySource}). Delphylax costs {COST.line}.
            EMILY is a finished product that reaches {COST.emilySpeedMph} mph, so this compares price, not ability. It shows that a basic flood scout could be
            cheap enough for towns that can’t afford professional rescue robots.
          </p>
        </Reveal>
        <Reveal delay={1}>
          <div className="glass-strong hud-corner mt-8 overflow-x-auto rounded-lg" style={{ background: 'rgba(19, 27, 33, 0.92)' }}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="font-mono text-xs text-white/65 ">
                  <th className="px-4 py-4 font-medium">Criterion</th>
                  {COMPETITORS.map((c) => (
                    <th key={c.name} className="px-4 py-4 font-medium" style={c.highlight ? { color: '#ffb4a6', background: 'linear-gradient(180deg, rgba(232,101,79,0.12), transparent)' } : undefined}>
                      <div className="font-display text-base font-800 tracking-normal text-white normal-case">{c.name}</div>
                      <div>{c.kind}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_COLUMNS.map((col) => (
                  <tr key={col.key} onMouseEnter={() => setHover(col.key)} onMouseLeave={() => setHover(null)} className="border-t border-white/8 transition-colors" style={{ background: hover === col.key ? 'rgba(127,179,213,0.06)' : undefined }}>
                    <td className="px-4 py-3 font-display text-sm font-700 text-white">{col.label}</td>
                    {COMPETITORS.map((c) => (
                      <td key={c.name} className="px-4 py-3 align-top" style={c.highlight ? { background: 'rgba(232,101,79,0.06)' } : undefined}>
                        <Score n={c.scores[col.key]} />
                        <div className="mt-1 text-xs leading-snug text-[#b9c4cc]">{c[col.key]}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center font-mono text-xs text-white/60 ">
            Scores 1–5 · icons carry the rating alongside color · Delphylax cost is a planning estimate, not receipts
          </p>
        </Reveal>
      </div>
    </SectionShell>
  )
}
