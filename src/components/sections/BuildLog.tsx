import { Hammer, ListTodo } from 'lucide-react'
import { BUILD_STATUS } from '../../data/research'
import { SectionShell, Kicker, Title, Reveal } from '../ui/primitives'

export function BuildLog() {
  return (
    <SectionShell id="buildlog" className="!items-start">
      <div className="pointer-events-auto w-full max-w-5xl">
        <Reveal>
          <Kicker index="04">Build log</Kicker>
          <Title>
            Built one <span className="text-gradient">step at a time.</span>
          </Title>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#d7dde3]">{BUILD_STATUS.summary}</p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="glass hud-corner rounded-lg p-5">
              <div className="mb-3 flex items-center gap-2 font-mono text-xs text-[#aab8c2]">
                <Hammer size={12} /> Done
              </div>
              <ul className="space-y-2">
                {BUILD_STATUS.done.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-[#f3ede1]/85">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7fb3d5]" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass hud-corner rounded-lg p-5">
              <div className="mb-3 flex items-center gap-2 font-mono text-xs text-[#aab8c2]">
                <ListTodo size={12} /> Still to do
              </div>
              <ul className="space-y-2">
                {BUILD_STATUS.todo.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-[#b9c4cc]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full border border-white/40" /> {d}
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
