import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Lightbulb, RotateCcw, Sprout, Users } from 'lucide-react'
import { useLogo } from './offline'

/** true when the viewer prefers reduced motion: everything is simply in its final state */
export const ReduceContext = createContext(false)

const EASE = [0.2, 0.8, 0.2, 1] as const
const SITE_ADDRESS = 'e3kim2032-sketch.github.io/delphylax-3d'
const won = (n: number) => n.toLocaleString('en-US')

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

/** One line (or block) of a slide. Lines build in one after another when the slide arrives. */
function Build({ i = 0, children, className = '' }: { i?: number; children: ReactNode; className?: string }) {
  const reduce = useContext(ReduceContext)
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 + i * 0.11, ease: EASE }}>
      {children}
    </motion.div>
  )
}

/** A number that counts up. The final value is what React renders, so it is there with animations off. */
function CountUp({ value, decimals = 0, delay = 0.3, duration = 1.5 }: { value: number; decimals?: number; delay?: number; duration?: number }) {
  const reduce = useContext(ReduceContext)
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    let raf = 0
    const t0 = performance.now() + delay * 1000
    el.textContent = fmt(0)
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / (duration * 1000)))
      el.textContent = fmt(value * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
      else el.textContent = fmt(value)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.textContent = fmt(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce])
  return <span ref={ref}>{fmt(value)}</span>
}

/** A bar that grows from nothing to its share. */
function Grow({ pct, delay, className = '', style }: { pct: number; delay: number; className?: string; style?: React.CSSProperties }) {
  const reduce = useContext(ReduceContext)
  if (reduce) return <div className={className} style={{ ...style, width: `${pct}%` }} />
  return <motion.div className={className} style={style} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay, ease: EASE }} />
}

function Kicker({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="p-kicker">
      <b>{n}</b>
      <i aria-hidden />
      <span>{children}</span>
    </div>
  )
}

function Head({ n, group, children, size }: { n: string; group: string; children: ReactNode; size?: number }) {
  return (
    <>
      <Build i={0}>
        <Kicker n={n}>{group}</Kicker>
      </Build>
      <Build i={1}>
        <h2 className="p-title" style={size ? { fontSize: size } : undefined}>
          {children}
        </h2>
      </Build>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* 1  Title                                                             */
/* ------------------------------------------------------------------ */
function TitleSlide() {
  const logo = useLogo()
  return (
    <div className="pitch-slide justify-center">
      <div className="w-[900px]">
        <Build i={0} className="flex items-center gap-[26px]">
          <img src={logo} alt="Delphylax logo" draggable={false} style={{ height: 96, width: 'auto' }} />
          <span className="font-display text-[56px] font-700 leading-none text-[#f3ede1]">Dolphin Guardian</span>
        </Build>
        <Build i={1} className="mt-[40px]">
          <span className="p-chip">Funding Proposal</span>
        </Build>
        <Build i={2}>
          <h1 className="font-display mt-[18px] text-[184px] font-700 leading-[1.02] text-[#f3ede1]">Delphylax</h1>
        </Build>
        <Build i={3}>
          <div className="font-mono text-[46px] tracking-[0.1em] text-[#ff8a73]">-Floodscout-</div>
        </Build>
        <Build i={4} className="mt-[56px]">
          <div className="text-[34px] text-[#dbe2e8]">by: Eddie, Minnie &amp; Luna</div>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2  Inspiration                                                       */
/* ------------------------------------------------------------------ */
const FLOODS = [
  { when: 'August 26, 2026', name: 'Nepal Flood', what: 'Flash floods in the Bhote Koshi river valley' },
  { when: '2022', name: 'Gangnam Flood', what: 'Seoul streets and semi-basement homes underwater' },
  { when: '2023', name: 'Osong Underpass Flood', what: 'Cars trapped when a tunnel filled with water' },
]

function InspirationSlide() {
  return (
    <div className="pitch-slide">
      <Head n="02" group="Background">
        Inspiration
      </Head>
      <div className="mt-[48px] grid flex-1 grid-cols-3 gap-[32px]">
        {FLOODS.map((f, i) => (
          <Build key={f.name} i={2 + i} className="p-card flex flex-col !p-[44px]">
            <div className="p-num text-[34px] !text-[#ff8a73]">{f.when}</div>
            <div className="font-display mt-[22px] text-[60px] font-700 leading-[1.06] text-[#f3ede1]">{f.name}</div>
            <p className="p-body mt-auto pt-[24px] !text-[36px]">{f.what}</p>
          </Build>
        ))}
      </div>
      <Build i={5} className="p-card mt-[32px] flex items-center gap-[36px] !py-[40px]">
        <span className="p-label shrink-0 !text-[#ff8a73]">Where it started</span>
        <span className="h-[52px] w-[2px] shrink-0 bg-[#2a3740]" aria-hidden />
        <p className="p-body">
          Individuals &amp; Societies class, <span className="font-600 text-white">Disaster Risk Reduction</span>{' '}
          <span className="text-[#aab8c2]">(7th and 8th grade)</span>
        </p>
      </Build>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 3  Initial research                                                  */
/* ------------------------------------------------------------------ */
function ResearchSlide() {
  return (
    <div className="pitch-slide">
      <Head n="03" group="Background">
        Initial research: <em>what we have already done</em>
      </Head>
      <div className="mt-[48px] grid flex-1 grid-cols-[1.25fr_1fr] gap-[32px]">
        <Build i={2} className="p-card !p-[44px]">
          <div className="flex items-baseline gap-[22px]">
            <span className="p-num text-[64px] !text-[#ff8a73]">01</span>
            <span className="font-display text-[54px] font-700 text-[#f3ede1]">Interviews</span>
          </div>
          <div className="mt-[34px] space-y-[34px]">
            <div className="border-l-[4px] border-[#e8654f] pl-[28px]">
              <div className="text-[40px] font-600 text-white">Fire Department</div>
              <div className="p-body mt-[4px]">Incheon Headquarters + Jemulpo Fire Station</div>
            </div>
            <div className="border-l-[4px] border-[#e8654f] pl-[28px]">
              <div className="text-[40px] font-600 text-white">Incheon Research Institute</div>
              <div className="p-body mt-[4px]">Ms. Jieun Ryu, researcher for the Climate Change Index</div>
            </div>
          </div>
        </Build>
        <Build i={3} className="p-card flex flex-col !p-[44px]">
          <div className="flex items-baseline gap-[22px]">
            <span className="p-num text-[64px] !text-[#ff8a73]">02</span>
            <span className="font-display text-[54px] font-700 leading-[1.1] text-[#f3ede1]">Flood Vulnerability Index data</span>
          </div>
          <div className="mt-auto pt-[28px]">
            <span className="p-chip !px-[30px] !py-[14px] !text-[36px]">VESTAP</span>
          </div>
        </Build>
      </div>
      <div className="mt-[36px] flex items-center gap-[28px]">
        <Build i={4}>
          <span className="p-label !text-[26px]">Then</span>
        </Build>
        <Build i={5} className="p-card !px-[40px] !py-[28px]">
          <span className="font-display text-[44px] font-700 text-[#f3ede1]">Problem identification</span>
        </Build>
        <Build i={6}>
          <ArrowRight size={52} className="text-[#ff8a73]" aria-hidden />
        </Build>
        <Build i={7} className="p-card !border-[#e8654f] !px-[40px] !py-[28px]">
          <span className="font-display text-[44px] font-700 text-[#f3ede1]">Program development</span>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 4  What is Delphylax                                                 */
/* ------------------------------------------------------------------ */
function WhatSlide() {
  return (
    <div className="pitch-slide">
      <div className="w-[930px]">
        <Head n="04" group="The robot">
          What is <em>Delphylax</em>?
        </Head>
        <Build i={2} className="mt-[44px] flex items-end gap-[30px]">
          {[
            ['δελφίς', 'Dolphin'],
            ['φύλαξ', 'Guardian'],
          ].map(([greek, english], i) => (
            <div key={greek} className="flex items-end gap-[30px]">
              {i === 1 && <span className="pb-[52px] text-[60px] font-600 leading-none text-[#ff8a73]">+</span>}
              <div>
                <div className="text-[78px] font-600 leading-[1.1] text-[#f3ede1]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }} lang="el">
                  {greek}
                </div>
                <div className="p-label mt-[6px] !text-[26px] !text-[#ff8a73]">{english}</div>
              </div>
            </div>
          ))}
        </Build>
        <Build i={3}>
          <p className="p-body mt-[38px] !text-[31px]">
            Inspired by the Amazon river dolphin, which finds its way through muddy water it cannot see through, Delphylax uses sonar to find things under flood
            water.
          </p>
        </Build>
        <Build i={4} className="p-card mt-[36px] !border-[#e8654f]">
          <div className="p-label !text-[#ff8a73]">In one line</div>
          <p className="mt-[14px] text-[34px] font-500 leading-[1.4] text-white">
            A 94 cm robot catamaran that searches flooded streets, finds people with sonar and a heat sensor, and marks the spot so rescuers know exactly where to go.
          </p>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 5  How it works (one part per click)                                 */
/* ------------------------------------------------------------------ */
const PARTS = [
  {
    name: 'Sonar',
    text: 'An underwater sonar sensor (DFRobot SEN0599) at the front measures distances under muddy water and sends them straight to the robot’s brain, like a dolphin’s echolocation. A fish-finder sonar is carried as a backup.',
  },
  { name: 'LiDAR', text: 'A 360-degree laser scanner (RPLIDAR C1) on top maps obstacles above the water.' },
  { name: 'Heat sensor + lights', text: 'An 8×8 thermal sensor (AMG8833) spots warm bodies at the surface. Two LED searchlights light the way.' },
  { name: 'Brain + safety sensors', text: 'An ESP32 runs everything. Compass, tilt and leak sensors stop the motors if the boat tips or water gets in.' },
  { name: 'Two brushless thrusters', text: 'Running one faster than the other steers the boat.' },
  { name: 'Catamaran hulls', text: 'Two 76 cm sealed PVC pipes with printed nose cones. Floats about 15 kg.' },
]

function HowSlide({ step }: SlideProps) {
  const reduce = useContext(ReduceContext)
  return (
    <div className="pitch-slide">
      <div className="w-[780px]">
        <Head n="05" group="The robot" size={68}>
          How it works
        </Head>
        <div className="mt-[30px] flex flex-col gap-[12px]">
          {PARTS.map((p, i) => {
            const on = step === i + 1
            const dim = step > 0 && !on
            return (
              <Build key={p.name} i={2 + i * 0.6}>
                <div
                  className="p-card lit-line !px-[26px] !py-[13px]"
                  style={{ borderColor: on ? '#e8654f' : undefined, background: on ? 'rgba(46, 31, 30, 0.95)' : 'rgba(20, 28, 34, 0.9)' }}
                  aria-current={on ? 'step' : undefined}
                >
                  <div className="flex items-center gap-[22px]">
                    <span
                      className="p-num flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[22px]"
                      style={on ? { background: '#e8654f', color: '#0f1519' } : { border: `1.5px solid ${dim ? '#5d4a48' : '#ff8a73'}`, color: dim ? '#8a6f6a' : '#ff8a73' }}
                    >
                      {i + 1}
                    </span>
                    <span className="lit-line font-display text-[31px] font-700" style={{ color: dim ? '#74828c' : '#f3ede1' }}>
                      {p.name}
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.38, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-[8px] pl-[64px] pt-[10px] text-[28px] leading-[1.42] text-[#eef3f6]">{p.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Build>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 6  What firefighters told us + the Pod                               */
/* ------------------------------------------------------------------ */
const POD_LINES = [
  'A dolphin-shaped float the robot drops next to a person.',
  'It glows when it touches water so rescuers can see it from far away.',
  'The robot then backs away, so a panicking person grabs the Pod and not the boat.',
]

function PodSlide({ step }: SlideProps) {
  const reduce = useContext(ReduceContext)
  // during the drop, each line lights up as the model acts it out
  const [lit, setLit] = useState(0)
  useEffect(() => {
    if (step < 1) {
      setLit(0)
      return
    }
    if (reduce) {
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
  }, [step, reduce])

  return (
    <div className="pitch-slide">
      <div className="w-[900px]">
        <Head n="06" group="The robot" size={70}>
          What firefighters told us
        </Head>
        <Build i={2} className="p-card mt-[34px] !border-l-[6px] !border-l-[#e8654f]">
          <p className="font-display text-[37px] font-600 leading-[1.32] text-[#f3ede1]">
            “A person who is drowning panics and pushes down with far more strength than normal. Your robot needs a float.”
          </p>
        </Build>
        <Build i={3}>
          <p className="mt-[36px] text-[40px] font-600 text-white">
            So we designed the <span className="text-[#ff8a73]">Delphylax Pod</span>
          </p>
        </Build>
        <div className="mt-[20px] space-y-[12px]">
          {POD_LINES.map((line, i) => {
            const on = lit === i + 1 || (lit === 3 && step >= 1)
            return (
              <Build key={line} i={4 + i}>
                <div
                  className="lit-line flex items-start gap-[20px] rounded-[16px] border-[1.5px] px-[22px] py-[12px]"
                  style={{ borderColor: on ? '#e8654f' : 'transparent', background: on ? 'rgba(232,101,79,0.14)' : 'transparent' }}
                >
                  <span className="mt-[15px] h-[12px] w-[12px] shrink-0 rounded-full bg-[#ff8a73]" aria-hidden />
                  <p className="text-[31px] leading-[1.4]" style={{ color: on ? '#fff' : '#dbe2e8' }}>
                    {line}
                  </p>
                </div>
              </Build>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 7  Link to Chadwick                                                  */
/* ------------------------------------------------------------------ */
function ChadwickSlide() {
  return (
    <div className="pitch-slide">
      <Head n="07" group="Why Chadwick">
        Link to <em>Chadwick</em>
      </Head>
      <div className="mt-[56px] grid flex-1 grid-cols-2 gap-[36px]">
        <Build i={2} className="p-card flex flex-col justify-center">
          <Users size={64} className="text-[#ff8a73]" aria-hidden />
          <p className="mt-[30px] text-[44px] font-500 leading-[1.32] text-white">
            Many Chadwick students live in the <span className="text-[#ff8a73]">Gangnam</span> and <span className="text-[#ff8a73]">Incheon</span> areas, both
            vulnerable to floods.
          </p>
        </Build>
        <Build i={3} className="p-card flex flex-col justify-center">
          <div className="p-num whitespace-nowrap text-[124px] leading-none">
            <CountUp value={4.5} decimals={1} delay={0.7} />
            <span className="mx-[6px] text-[#aab8c2]">–</span>
            <CountUp value={5.2} decimals={1} delay={0.9} />
            <span className="text-[#ff8a73]">×</span>
          </div>
          <p className="p-body mt-[30px] !text-[36px]">
            Research shows coastal areas including Incheon are about 4.5 to 5.2 times more vulnerable to floods.
          </p>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 8  Chadwick's Mission Statement                                      */
/* ------------------------------------------------------------------ */
const LINKS = [
  { icon: Lightbulb, text: 'Critical thinking' },
  { icon: Users, text: 'Involves Chadwick' },
  { icon: RotateCcw, text: 'Gives us room to fail and try again' },
  { icon: Sprout, text: 'Long-term sustainability of the project' },
]

function MissionSlide() {
  return (
    <div className="pitch-slide">
      <Head n="08" group="Why Chadwick" size={70}>
        Chadwick’s Mission Statement
      </Head>
      <Build i={2} className="p-card mt-[40px] !border-l-[6px] !border-l-[#e8654f] !py-[40px]">
        <p className="font-display text-[50px] font-600 leading-[1.28] text-[#f3ede1]">
          “Chadwick develops global citizens with keen minds, exemplary character, self knowledge, and ability to lead.”
        </p>
      </Build>
      <Build i={3} className="mt-[44px]">
        <span className="p-label !text-[26px] !text-[#ff8a73]">Our link</span>
      </Build>
      <div className="mt-[20px] grid flex-1 grid-cols-4 gap-[26px]">
        {LINKS.map(({ icon: Icon, text }, i) => (
          <Build key={text} i={4 + i} className="p-card flex flex-col justify-between">
            <Icon size={50} className="text-[#ff8a73]" aria-hidden />
            <p className="mt-[22px] text-[33px] font-600 leading-[1.25] text-white">{text}</p>
          </Build>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 9  Involve Chadwick in the process: the design cycle                 */
/* ------------------------------------------------------------------ */
const CYCLE = ['Research', 'Design', 'Build', 'Test', 'Improve']
const R = 300
const polar = (deg: number, r = R): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180
  return [Math.cos(a) * r, Math.sin(a) * r]
}

function CycleSlide() {
  const reduce = useContext(ReduceContext)
  const logo = useLogo()
  return (
    <div className="pitch-slide">
      <div className="flex flex-1 items-center gap-[40px]">
        <div className="w-[760px] shrink-0">
          <Head n="09" group="Why Chadwick">
            Involve Chadwick <em>in the process</em>
          </Head>
          <Build i={2}>
            <p className="p-body mt-[36px] !text-[40px]">Our design cycle</p>
          </Build>
        </div>
        <Build i={2} className="flex flex-1 justify-end">
          <svg viewBox="-470 -420 940 840" width={900} height={804} role="img" aria-label="Design cycle: research, design, build, test, improve, then research again">
            <defs>
              <marker id="cycle-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M1 1 L9 5 L1 9" fill="none" stroke="#ff8a73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            <circle r={R} fill="none" stroke="#2a3740" strokeWidth="3" />
            {/* five arcs, each drawn toward the next step */}
            {CYCLE.map((c, i) => {
              const [x1, y1] = polar(i * 72 + 24)
              const [x2, y2] = polar(i * 72 + 48)
              return (
                <path
                  key={c}
                  className="cycle-arc"
                  pathLength={1}
                  d={`M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                  fill="none"
                  stroke="#ff8a73"
                  strokeWidth="6"
                  strokeLinecap="round"
                  markerEnd="url(#cycle-arrow)"
                  style={{ animationDelay: `${0.7 + i * 0.22}s` }}
                />
              )
            })}
            {/* a light that keeps going round */}
            {!reduce && (
              <g className="cycle-orbit">
                <circle cx={0} cy={-R} r={26} fill="#ff8a73" opacity={0.25} />
                <circle cx={0} cy={-R} r={11} fill="#ffb4a6" />
              </g>
            )}
            {CYCLE.map((c, i) => {
              const [x, y] = polar(i * 72)
              return (
                <g key={c} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                  <rect className="cycle-node" x={-128} y={-44} width={256} height={88} rx={22} fill="rgba(20,28,34,0.92)" stroke="#3a4852" strokeWidth="3" style={{ animationDelay: `${i * 2 - 0.65}s` }} />
                  <text x={-92} y={11} fontFamily="'JetBrains Mono', monospace" fontSize="26" fill="#ff8a73">
                    {i + 1}
                  </text>
                  <text x={-62} y={12} fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize="34" fill="#f3ede1">
                    {c}
                  </text>
                </g>
              )
            })}
            <image href={logo} x={-92} y={-90} width={184} height={178} />
          </svg>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 10  Link to our society                                              */
/* ------------------------------------------------------------------ */
function SocietySlide() {
  return (
    <div className="pitch-slide justify-center">
      <div className="w-[900px]">
        <Head n="10" group="Why Chadwick">
          Link to <em>our society</em>
        </Head>
        <Build i={2}>
          <p className="mt-[40px] text-[42px] font-600 leading-[1.3] text-white">Floods are the most common type of disaster in South Korea.</p>
        </Build>
        <Build i={3}>
          <p className="p-body mt-[28px]">
            After talking with several fire stations, we found that Delphylax would help rescuers find missing people and save golden time, so tragedies like the
            Osong and Gangnam floods are less likely to happen again.
          </p>
        </Build>
        <Build i={4} className="mt-[48px]">
          <a className="p-btn" href="../" target="_blank" rel="noopener noreferrer">
            Visit the main website <ArrowRight size={30} aria-hidden />
          </a>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 11  Materials & Cost                                                 */
/* ------------------------------------------------------------------ */
const COSTS: [string, number][] = [
  ['Power', 179000],
  ['Sensors', 157000],
  ['3D prints', 73610],
  ['Body', 55000],
  ['Markers', 22500],
  ['Hardware', 22400],
  ['Wiring', 11000],
  ['Sound + light', 10000],
  ['Safety', 5000],
]
const ROBOT_TOTAL = 535510
const COST_MAX = COSTS[0][1]

function CostSlide() {
  return (
    <div className="pitch-slide">
      <Head n="11" group="The ask">
        Materials &amp; Cost
      </Head>
      <div className="mt-[40px] grid flex-1 grid-cols-[690px_1fr] gap-[40px]">
        <div className="flex flex-col gap-[26px]">
          <Build i={2} className="p-card !border-[#e8654f]">
            <div className="p-label !text-[#ff8a73]">Total for one robot</div>
            <div className="p-num mt-[10px] whitespace-nowrap text-[104px] leading-[1.1]">
              <CountUp value={ROBOT_TOTAL} delay={0.5} />
              <span className="ml-[16px] text-[44px] text-[#ff8a73]">won</span>
            </div>
            <div className="p-body !text-[32px]">about $380</div>
          </Build>
          <Build i={3}>
            <p className="p-small px-[6px]">One complete robot from our parts list and real print-shop prices (estimates until every receipt is in).</p>
          </Build>
          <Build i={4} className="p-card mt-auto">
            <p className="p-body !text-[30px]">
              A proven rescue robot, EMILY, costs about <span className="p-num">$10,000</span> <span className="text-[#aab8c2]">(Military.com, 2016)</span>
            </p>
          </Build>
        </div>
        <Build i={3} className="p-card flex flex-col justify-between !py-[30px]">
          {COSTS.map(([name, value], i) => (
            <div key={name} className="grid grid-cols-[230px_1fr_150px] items-center gap-[22px]">
              <span className="text-[29px] text-[#eef3f6]">{name}</span>
              <div className="h-[26px] overflow-hidden rounded-full bg-white/[0.07]">
                <Grow pct={(value / COST_MAX) * 100} delay={0.75 + i * 0.09} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#e8654f,#ff8a73)' }} />
              </div>
              <span className="p-num text-right text-[29px]">{won(value)}</span>
            </div>
          ))}
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 12  "Wiggle room"?                                                   */
/* ------------------------------------------------------------------ */
function WiggleSlide() {
  return (
    <div className="pitch-slide">
      <Head n="12" group="The ask">
        “Wiggle room”<em>?</em>
      </Head>
      <Build i={2}>
        <p className="p-body mt-[40px] max-w-[1500px] !text-[38px]">
          When building robots, one small mistake can lead to a big failure. We might have to rebuild a whole section, and the parts are delicate and costly, so our
          request includes wiggle room.
        </p>
      </Build>
      <Build i={3} className="mt-[48px]">
        <span className="p-label !text-[26px] !text-[#ff8a73]">It has already been needed</span>
      </Build>
      <div className="mt-[20px] grid flex-1 grid-cols-2 gap-[32px]">
        <Build i={4} className="p-card flex flex-col justify-center">
          <div className="p-num text-[84px] leading-none">
            <CountUp value={16610} delay={0.9} />
            <span className="ml-[14px] text-[38px] text-[#ff8a73]">won</span>
          </div>
          <p className="p-body mt-[22px] !text-[36px]">Our first saddles had to be reprinted.</p>
        </Build>
        <Build i={5} className="p-card flex flex-col justify-center">
          <div className="font-display text-[66px] font-700 leading-none text-[#ff8a73]">Delphylax Pod</div>
          <p className="p-body mt-[26px] !text-[36px]">The firefighters’ feedback added the Delphylax Pod.</p>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 13  Total funding request                                            */
/* ------------------------------------------------------------------ */
const REQUEST = 1200000
const SPLIT = [
  { name: 'Delphylax materials', value: 535510, color: '#e8654f' },
  { name: 'Floodscout prototyping', value: 356000, color: '#ff8a73' },
  { name: 'Wiggle room + research', value: 308490, color: '#7fb3d5' },
]

function TotalSlide() {
  return (
    <div className="pitch-slide">
      <Head n="13" group="The ask" size={64}>
        Total funding request
      </Head>
      <Build i={2}>
        <div className="p-num mt-[14px] whitespace-nowrap text-[226px] leading-[1.08]">
          <CountUp value={REQUEST} delay={0.45} duration={1.9} />
          <span className="ml-[30px] text-[104px] text-[#ff8a73]">WON</span>
        </div>
      </Build>
      <Build i={3}>
        <p className="p-body max-w-[1560px]">
          Covering Delphylax’s materials, the Floodscout prototypes that led to it, wiggle room, and research (transport, expert contacts, and more).
        </p>
      </Build>
      <Build i={4} className="mt-auto">
        <div className="flex h-[58px] gap-[6px]">
          {SPLIT.map((s, i) => (
            <div key={s.name} style={{ width: `${(s.value / REQUEST) * 100}%` }}>
              <Grow pct={100} delay={1.1 + i * 0.4} className={`h-full ${i === 0 ? 'rounded-l-[16px]' : ''} ${i === SPLIT.length - 1 ? 'rounded-r-[16px]' : ''}`} style={{ background: s.color }} />
            </div>
          ))}
        </div>
        <div className="mt-[22px] flex gap-[6px]">
          {SPLIT.map((s) => (
            <div key={s.name} style={{ width: `${(s.value / REQUEST) * 100}%` }}>
              <div className="flex items-center gap-[12px]">
                <span className="h-[16px] w-[16px] shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                <span className="text-[28px] leading-[1.2] text-[#eef3f6]">{s.name}</span>
              </div>
              <div className="p-num mt-[6px] text-[42px]">{won(s.value)}</div>
            </div>
          ))}
        </div>
        <p className="p-small mt-[18px] w-fit font-mono">
          {SPLIT.map((s) => won(s.value)).join(' + ')} = {won(REQUEST)} won
        </p>
      </Build>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 14  Thank you                                                        */
/* ------------------------------------------------------------------ */
function ThanksSlide() {
  const logo = useLogo()
  return (
    <div className="pitch-slide justify-center">
      <div className="w-[900px]">
        <Build i={0}>
          <img src={logo} alt="Delphylax logo" draggable={false} style={{ height: 110, width: 'auto' }} />
        </Build>
        <Build i={1}>
          <h2 className="font-display mt-[30px] text-[176px] font-700 leading-[1.02] text-[#f3ede1]">
            Thank <span className="text-[#ff8a73]">YOU</span>
          </h2>
        </Build>
        <Build i={2}>
          <div className="mt-[30px] text-[38px] text-[#dbe2e8]">by: Eddie, Minnie &amp; Luna</div>
        </Build>
        <Build i={3} className="mt-[52px]">
          <a className="font-mono text-[30px] text-[#ff8a73] underline decoration-[#ff8a73]/40 underline-offset-[8px] hover:decoration-[#ff8a73]" href="../" target="_blank" rel="noopener noreferrer">
            {SITE_ADDRESS}
          </a>
        </Build>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Deck order                                                           */
/* ------------------------------------------------------------------ */
export interface SlideProps {
  /** which click-through step of the slide is showing */
  step: number
}
export interface SlideMeta {
  title: string
  /** extra clicks inside the slide before it moves on */
  steps: number
  /** how the 3D scene sits behind the slide: 'side' keeps the model clear on the right, 'full' quiets it */
  scrim: 'side' | 'full'
  Comp: ComponentType<SlideProps>
}

export const SLIDES: SlideMeta[] = [
  { title: 'Delphylax funding proposal', steps: 0, scrim: 'side', Comp: TitleSlide },
  { title: 'Inspiration', steps: 0, scrim: 'full', Comp: InspirationSlide },
  { title: 'Initial research', steps: 0, scrim: 'full', Comp: ResearchSlide },
  { title: 'What is Delphylax', steps: 0, scrim: 'side', Comp: WhatSlide },
  { title: 'How it works', steps: PARTS.length, scrim: 'side', Comp: HowSlide },
  { title: 'What firefighters told us', steps: 1, scrim: 'side', Comp: PodSlide },
  { title: 'Link to Chadwick', steps: 0, scrim: 'full', Comp: ChadwickSlide },
  { title: 'Chadwick’s Mission Statement', steps: 0, scrim: 'full', Comp: MissionSlide },
  { title: 'Involve Chadwick in the process', steps: 0, scrim: 'full', Comp: CycleSlide },
  { title: 'Link to our society', steps: 0, scrim: 'side', Comp: SocietySlide },
  { title: 'Materials and cost', steps: 0, scrim: 'full', Comp: CostSlide },
  { title: 'Wiggle room', steps: 0, scrim: 'full', Comp: WiggleSlide },
  { title: 'Total funding request', steps: 0, scrim: 'full', Comp: TotalSlide },
  { title: 'Thank you', steps: 0, scrim: 'side', Comp: ThanksSlide },
]
