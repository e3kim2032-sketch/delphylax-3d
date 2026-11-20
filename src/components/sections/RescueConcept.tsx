import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { RESCUE_STEPS, RESCUE_NOTE } from '../../data/research'
import { CardTitle } from '../ui/primitives'

/**
 * "How a rescue would work": a top-down, slightly angled street scene drawn in SVG
 * (no three.js). The scene is authored in its final frame, so with reduced motion,
 * or before any script runs, the finished picture is what shows.
 *
 * The world is 1600 × 900. On wide screens the whole world shows (16:9); on phones the
 * card is 4:5 and the SVG crops to the middle 720 units, where all the action happens.
 */

const W = 1600
const H = 900
const DURATION = 16500 // one run, ms
const HOLD = 1800 // pause on the final frame before looping

/** step boundaries as fractions of one run: arrive, launch, sweep, mark, drop the Pod, rescue */
const B = [0, 0.12, 0.195, 0.54, 0.64, 0.78, 1] as const
const STEPS = B.length - 1

// Delphylax: off the truck, into the water, then three lawnmower passes along the flooded boulevard
const SWEEP = 'M706,470 C742,470 742,526 780,526 L1092,526 a24,24 0 0 0 0,-48 L792,478 a24,24 0 0 1 0,-48 L958,430'
// the rescuers' straight line to the marker
const ROUTE_A = { x: 722, y: 498 }
const ROUTE_B = { x: 946, y: 458 }
const ROUTE = `M${ROUTE_A.x},${ROUTE_A.y} L${ROUTE_B.x},${ROUTE_B.y}`
const ROUTE_ANGLE = (Math.atan2(ROUTE_B.y - ROUTE_A.y, ROUTE_B.x - ROUTE_A.x) * 180) / Math.PI
const TARGET = { x: 992, y: 390 }
const MARKER = { x: 1006, y: 420 }
// where the Pod floats, next to the person, and how far Delphylax backs away from it
const POD_AT = { x: 968, y: 398 }
const BACK_OFF = 112
// where the flood begins (everything to the right is under water)
const SHORE = 'M760,0 C742,90 700,210 716,330 C728,420 708,500 696,600 C686,690 740,790 722,900'

/** the real Pod model seen from above (made with tools/render.html) */
const POD_TOP_SRC = `${import.meta.env.BASE_URL}pod-top.webp`

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3)
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
const stepAt = (t: number) => {
  for (let i = 0; i < STEPS; i++) if (t < B[i + 1]) return i
  return STEPS - 1
}

/* ------------------------------------------------------------------ scene data */
interface Bld {
  x: number
  y: number
  w: number
  h: number
  /** roof height above the ground, in px */
  d: number
  basement?: boolean
}
const BUILDINGS: Bld[] = [
  // top strip
  { x: 18, y: -10, w: 132, h: 68, d: 20 },
  { x: 256, y: -8, w: 186, h: 66, d: 24 },
  { x: 562, y: -10, w: 200, h: 68, d: 22 },
  { x: 786, y: -6, w: 236, h: 64, d: 26 },
  { x: 1140, y: -10, w: 236, h: 68, d: 22 },
  { x: 1474, y: -8, w: 140, h: 66, d: 20 },
  // north of the boulevard
  { x: 18, y: 188, w: 132, h: 170, d: 44 },
  { x: 256, y: 184, w: 88, h: 70, d: 40 },
  { x: 356, y: 194, w: 86, h: 70, d: 52 },
  { x: 256, y: 288, w: 186, h: 80, d: 28 },
  { x: 562, y: 186, w: 118, h: 80, d: 46 },
  { x: 562, y: 288, w: 110, h: 78, d: 26 },
  { x: 760, y: 193, w: 108, h: 78, d: 54 },
  { x: 888, y: 184, w: 135, h: 70, d: 40 },
  { x: 745, y: 298, w: 128, h: 72, d: 22, basement: true },
  { x: 890, y: 284, w: 136, h: 86, d: 22, basement: true },
  { x: 1140, y: 190, w: 108, h: 82, d: 50 },
  { x: 1262, y: 178, w: 114, h: 66, d: 34 },
  { x: 1140, y: 294, w: 236, h: 76, d: 24, basement: true },
  { x: 1474, y: 186, w: 140, h: 176, d: 42 },
  // south of the boulevard
  { x: 18, y: 612, w: 132, h: 150, d: 40 },
  { x: 256, y: 602, w: 186, h: 62, d: 30 },
  { x: 256, y: 702, w: 88, h: 62, d: 24 },
  { x: 356, y: 712, w: 86, h: 54, d: 40 },
  { x: 562, y: 612, w: 96, h: 150, d: 42 },
  { x: 702, y: 602, w: 138, h: 60, d: 28 },
  { x: 858, y: 618, w: 160, h: 56, d: 50 },
  { x: 702, y: 702, w: 148, h: 64, d: 26 },
  { x: 868, y: 712, w: 150, h: 54, d: 24 },
  { x: 1140, y: 608, w: 236, h: 60, d: 36 },
  { x: 1140, y: 706, w: 108, h: 60, d: 26 },
  { x: 1264, y: 712, w: 112, h: 54, d: 44 },
  { x: 1474, y: 612, w: 140, h: 150, d: 40 },
  // bottom strip
  { x: 18, y: 872, w: 132, h: 60, d: 22 },
  { x: 256, y: 876, w: 186, h: 60, d: 26 },
  { x: 562, y: 872, w: 200, h: 60, d: 22 },
  { x: 790, y: 878, w: 230, h: 60, d: 28 },
  { x: 1140, y: 872, w: 236, h: 60, d: 22 },
  { x: 1474, y: 874, w: 140, h: 60, d: 20 },
].sort((a, b) => a.y + a.h - (b.y + b.h))

/** sidewalk blocks: [x, y, w, h] */
const BLOCKS: [number, number, number, number][] = []
for (const [x0, x1] of [
  [-20, 170],
  [240, 455],
  [545, 1035],
  [1125, 1390],
  [1460, 1620],
])
  for (const [y0, y1] of [
    [-20, 70],
    [140, 383],
    [557, 770],
    [840, 920],
  ])
    BLOCKS.push([x0, y0, x1 - x0, y1 - y0])

const ROOFS = ['#2c3944', '#34424e', '#283440', '#3a4853']
const CAR_COLORS = ['#c9d2d9', '#e8654f', '#5b8fb8', '#f3ede1', '#8894a0']

const TREES: [number, number][] = [
  [270, 373], [420, 373], [604, 373], [652, 373], [282, 568], [404, 568], [596, 568],
  [1182, 373], [1296, 373], [762, 568], [934, 568], [1204, 568], [1332, 568],
  [96, 520], [1560, 420], [1486, 568], [700, 124], [1250, 152],
]
const CARS: { x: number; y: number; rot?: number; c: number }[] = [
  { x: 320, y: 397, c: 0 }, { x: 118, y: 546, c: 2 }, { x: 500, y: 250, rot: 90, c: 3 }, { x: 205, y: 640, rot: 90, c: 4 },
  { x: 812, y: 397, c: 3 }, { x: 1012, y: 546, c: 1 }, { x: 878, y: 546, c: 4 }, { x: 1236, y: 397, c: 0 }, { x: 1310, y: 546, c: 2 },
  { x: 1080, y: 640, rot: 90, c: 0 }, { x: 900, y: 105, c: 2 }, { x: 1262, y: 105, c: 1 }, { x: 884, y: 805, c: 3 }, { x: 1300, y: 805, c: 4 },
  { x: 1425, y: 300, rot: 90, c: 1 },
]
const isFlooded = (x: number) => x > 712

/* ------------------------------------------------------------------ scene pieces */
function Building({ b }: { b: Bld }) {
  const { x, y, w, h, d } = b
  const roofY = y - d
  const wallY = y + h - d
  const seed = Math.abs(Math.round(x * 7 + y * 13))
  const cols = Math.max(2, Math.floor((w - 14) / 17))
  const gap = (w - 14) / cols
  const rows = d >= 40 ? 2 : 1
  const winH = b.basement ? 6 : Math.min(9, d / rows - 8)
  const flooded = isFlooded(x)
  return (
    <g>
      <rect x={x + 9} y={y + 11} width={w} height={h} rx="3" fill="#05090c" opacity="0.32" />
      {/* south wall */}
      <rect x={x} y={wallY} width={w} height={d} fill="#17212a" />
      <rect x={x} y={wallY} width={w} height="3" fill="#05090c" opacity="0.35" />
      {Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const lit = (seed + c * 3 + r * 5) % 4 === 0
        return (
          <rect
            key={i}
            x={x + 7 + c * gap + gap / 2 - 4}
            y={wallY + 5 + r * (d / rows)}
            width="8"
            height={winH}
            rx="1"
            fill={lit ? '#ffd9a0' : '#0c141a'}
            opacity={lit ? 0.85 : 1}
          />
        )
      })}
      {/* semi-basement windows: low, wide, right at street level */}
      {b.basement &&
        Array.from({ length: cols }).map((_, c) => (
          <rect key={c} x={x + 7 + c * gap + gap / 2 - 6} y={y + h - 9} width="12" height="6" rx="1" fill={(seed + c) % 3 === 0 ? '#ffd9a0' : '#0c141a'} opacity="0.9" />
        ))}
      {/* roof */}
      <rect x={x} y={roofY} width={w} height={h} rx="3" fill={ROOFS[seed % ROOFS.length]} />
      <rect x={x + 5} y={roofY + 5} width={w - 10} height={h - 10} rx="2" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" />
      {/* rooftop units */}
      <rect x={x + w * 0.16 + 3} y={roofY + h * 0.2 + 3} width="18" height="13" rx="1.5" fill="#05090c" opacity="0.35" />
      <rect x={x + w * 0.16} y={roofY + h * 0.2} width="18" height="13" rx="1.5" fill="#4a5a66" />
      <rect x={x + w * 0.16 + 3} y={roofY + h * 0.2 + 3} width="12" height="7" rx="1" fill="#5d6e7a" />
      {w > 105 && (
        <>
          <rect x={x + w * 0.6 + 3} y={roofY + h * 0.5 + 3} width="24" height="17" rx="2" fill="#05090c" opacity="0.35" />
          <rect x={x + w * 0.6} y={roofY + h * 0.5} width="24" height="17" rx="2" fill="#43525d" />
        </>
      )}
      {seed % 3 === 0 && (
        <>
          <circle cx={x + w * 0.8 + 2} cy={roofY + h * 0.26 + 2} r="7" fill="#05090c" opacity="0.35" />
          <circle cx={x + w * 0.8} cy={roofY + h * 0.26} r="7" fill="#51626e" />
          <circle cx={x + w * 0.8} cy={roofY + h * 0.26} r="3.5" fill="#3a4853" />
        </>
      )}
      {/* flood line against the wall */}
      {flooded && (
        <>
          <rect x={x - 1} y={y + h - 6} width={w + 2} height="8" fill="#2f7099" opacity="0.6" />
          <rect x={x - 1} y={y + h - 6} width={w + 2} height="1.5" fill="#c8ecff" opacity="0.55" />
        </>
      )}
    </g>
  )
}

function Tree({ x, y }: { x: number; y: number }) {
  const wet = isFlooded(x)
  return (
    <g transform={`translate(${x} ${y})`}>
      {wet ? <ellipse cx="2" cy="7" rx="21" ry="10" fill="none" stroke="#c8ecff" strokeOpacity="0.3" strokeWidth="1.5" /> : <ellipse cx="5" cy="7" rx="15" ry="9" fill="#05090c" opacity="0.3" />}
      <circle r="14" fill="#1c4a3b" />
      <circle cx="-3" cy="-3" r="9.5" fill="#2a6a54" />
      <circle cx="-5" cy="-5" r="4.5" fill="#3f8a6f" opacity="0.85" />
    </g>
  )
}

function Car({ x, y, rot = 0, c }: { x: number; y: number; rot?: number; c: number }) {
  const wet = isFlooded(x)
  const color = CAR_COLORS[c]
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {wet ? <ellipse rx="25" ry="15" fill="none" stroke="#c8ecff" strokeOpacity="0.28" strokeWidth="1.5" /> : <rect x="-14" y="-5" width="32" height="16" rx="5" fill="#05090c" opacity="0.3" />}
      {/* body: mostly under water when flooded */}
      <rect x="-16" y="-8" width="32" height="16" rx="5" fill={color} opacity={wet ? 0.32 : 1} />
      {!wet && <rect x="-9" y="-6.5" width="17" height="13" rx="3" fill="#0f1a22" />}
      <rect x="-5.5" y="-5.5" width="10" height="11" rx="2.5" fill={color} opacity={wet ? 0.95 : 1} />
    </g>
  )
}

/* ------------------------------------------------------------------ component */
export function RescueConcept() {
  const wrap = useRef<HTMLDivElement>(null)
  const sweep = useRef<SVGPathElement>(null)
  const route = useRef<SVGPathElement>(null)
  const trail = useRef<SVGPathElement>(null)
  const swath = useRef<SVGPathElement>(null)
  const routeLine = useRef<SVGGElement>(null)
  const truck = useRef<SVGGElement>(null)
  const lightA = useRef<SVGRectElement>(null)
  const lightB = useRef<SVGRectElement>(null)
  const lightGlow = useRef<SVGCircleElement>(null)
  const boat = useRef<SVGGElement>(null)
  const wake = useRef<SVGGElement>(null)
  const pings = useRef<(SVGCircleElement | null)[]>([])
  const heat = useRef<SVGGElement>(null)
  const heatRing = useRef<SVGCircleElement>(null)
  const marker = useRef<SVGGElement>(null)
  const markerRings = useRef<(SVGCircleElement | null)[]>([])
  const pod = useRef<SVGGElement>(null)
  const podGlow = useRef<SVGCircleElement>(null)
  const podRing = useRef<SVGCircleElement>(null)
  const crew = useRef<SVGGElement>(null)
  const crewWake = useRef<SVGGElement>(null)
  const ripple = useRef<SVGPatternElement>(null)
  const fills = useRef<(HTMLSpanElement | null)[]>([])

  const [step, setStep] = useState(RESCUE_STEPS.length - 1)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)
  const [reduce, setReduce] = useState(false)
  const tRef = useRef(1) // start on the final frame
  const autoStarted = useRef(false)

  /** Draw the scene at run fraction t (0..1). t = 1 is the final frame. */
  const draw = useCallback((t: number, now: number) => {
    const sw = sweep.current
    const rt = route.current
    if (!sw || !rt) return
    const sweepLen = sw.getTotalLength()
    const routeLen = rt.getTotalLength()

    // 1. the truck drives in and parks at the water's edge; the light bar keeps flashing
    const kTruck = easeOut(clamp01(t / B[1]))
    truck.current?.setAttribute('transform', `translate(${-180 + 816 * kTruck} 470)`)
    const flash = Math.floor(now / 190) % 2 === 0
    lightA.current?.setAttribute('fill', flash ? '#ff3b30' : '#5c1a16')
    lightB.current?.setAttribute('fill', flash ? '#1a2f5c' : '#3b9eff')
    if (lightGlow.current) {
      lightGlow.current.setAttribute('fill', flash ? '#ff3b30' : '#3b9eff')
      lightGlow.current.setAttribute('opacity', kTruck > 0.2 ? '0.28' : '0.16')
    }

    // 2 + 3. Delphylax slides off the truck and sweeps the boulevard
    const kBoat = easeInOut(clamp01((t - B[1]) / (B[3] - B[1])))
    const swept = kBoat * sweepLen
    // 5b. once the Pod is in the water, Delphylax reverses back along its own track
    const kBack = easeInOut(clamp01((t - (B[4] + 0.05)) / (B[5] - B[4] - 0.056)))
    const d = swept - BACK_OFF * kBack
    const a = sw.getPointAtLength(d)
    const ahead = sw.getPointAtLength(Math.min(sweepLen, d + 3))
    const behind = sw.getPointAtLength(Math.max(0, d - 3))
    const heading = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
    const moving = t > B[1] && t < B[3]
    if (boat.current) {
      boat.current.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${heading.toFixed(1)})`)
      boat.current.setAttribute('opacity', String(clamp01((t - B[1]) / 0.015)))
    }
    wake.current?.setAttribute('opacity', moving ? String(0.25 + 0.55 * Math.sin(Math.PI * clamp01((t - B[1]) / (B[3] - B[1])))) : '0')
    for (const p of [trail.current, swath.current]) {
      if (!p) continue
      p.setAttribute('stroke-dasharray', `${sweepLen}`)
      p.setAttribute('stroke-dashoffset', String(sweepLen - swept))
    }

    // sonar pings while it sweeps
    const sweeping = t > B[2] && t < B[3] + 0.02
    pings.current.forEach((ring, i) => {
      if (!ring) return
      const phase = (now / 1300 + i / 3) % 1
      ring.setAttribute('cx', a.x.toFixed(1))
      ring.setAttribute('cy', a.y.toFixed(1))
      ring.setAttribute('r', String(10 + phase * 62))
      ring.setAttribute('opacity', sweeping ? String((1 - phase) * 0.75) : '0')
    })

    // 4. a heat signature by the semi-basement window, then the glowing marker
    heat.current?.setAttribute('opacity', String(clamp01((t - (B[3] - 0.04)) / 0.05)))
    if (heatRing.current) {
      const ph = (now / 900) % 1
      heatRing.current.setAttribute('r', String(12 + ph * 22))
      heatRing.current.setAttribute('opacity', String((1 - ph) * 0.8))
    }
    const kMark = clamp01((t - (B[3] + 0.05)) / 0.03)
    if (marker.current) {
      marker.current.setAttribute('opacity', String(kMark))
      marker.current.setAttribute('transform', `translate(${MARKER.x} ${MARKER.y}) scale(${(0.3 + 0.7 * easeOut(kMark)).toFixed(3)})`)
    }
    markerRings.current.forEach((ring, i) => {
      if (!ring) return
      const ph = (now / 1100 + i / 2) % 1
      ring.setAttribute('r', String(8 + ph * 30))
      ring.setAttribute('opacity', String((1 - ph) * 0.7))
    })

    // 5. the Pod leaves the boat, lands beside the person and lights up
    const kDrop = clamp01((t - (B[4] + 0.008)) / 0.032)
    const kGlow = clamp01((t - (B[4] + 0.04)) / 0.03)
    if (pod.current) {
      const from = sw.getPointAtLength(sweepLen)
      const e = easeOut(kDrop)
      const px = from.x + (POD_AT.x - from.x) * e
      const py = from.y + (POD_AT.y - from.y) * e - Math.sin(Math.PI * kDrop) * 10
      pod.current.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(-24)`)
      pod.current.setAttribute('opacity', String(clamp01(kDrop * 5)))
    }
    podGlow.current?.setAttribute('opacity', String(kGlow))
    if (podRing.current) {
      const ph = (now / 1000) % 1
      podRing.current.setAttribute('r', String(12 + ph * 26))
      podRing.current.setAttribute('opacity', String((1 - ph) * 0.8 * kGlow))
    }

    // 6. the rescuers take the straight line to the marker
    const kGo = easeInOut(clamp01((t - B[5]) / (0.96 - B[5])))
    const c = rt.getPointAtLength(kGo * routeLen)
    if (crew.current) {
      crew.current.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${ROUTE_ANGLE.toFixed(1)})`)
      crew.current.setAttribute('opacity', String(clamp01((t - B[5]) / 0.015)))
    }
    crewWake.current?.setAttribute('opacity', kGo > 0.02 && kGo < 0.98 ? '0.7' : '0')
    routeLine.current?.setAttribute('opacity', String(clamp01((t - B[5] + 0.01) / 0.03)))

    // water texture drifts slowly
    ripple.current?.setAttribute('patternTransform', `translate(${((now / 70) % 96).toFixed(1)} ${((now / 160) % 48).toFixed(1)})`)

    // progress bar
    fills.current.forEach((el, i) => {
      if (el) el.style.width = `${clamp01((t - B[i]) / (B[i + 1] - B[i])) * 100}%`
    })
    setStep((prev) => {
      const s = stepAt(t)
      return prev === s ? prev : s
    })
  }, [])

  // dev only: lets tests draw any moment of the run by hand
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as { __rescueDraw?: (t: number) => void }
    w.__rescueDraw = (t: number) => draw(t, performance.now())
    return () => {
      delete w.__rescueDraw
    }
  }, [draw])

  // first paint: the final frame. Note whether the visitor prefers reduced motion.
  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    draw(1, 0)
  }, [draw])

  // only run while the scene is on screen
  useEffect(() => {
    const el = wrap.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // start once, the first time it scrolls into view (never with reduced motion)
  useEffect(() => {
    if (!inView || autoStarted.current || reduce) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    autoStarted.current = true
    tRef.current = 0
    setPlaying(true)
  }, [inView, reduce])

  // the loop: runs only when playing and visible
  useEffect(() => {
    if (!playing || !inView) return
    let raf = 0
    let last = performance.now()
    let held = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(64, now - last)
      last = now
      if (tRef.current >= 1) {
        held += dt
        if (held > HOLD) {
          held = 0
          tRef.current = 0
        }
      } else {
        tRef.current = Math.min(1, tRef.current + dt / DURATION)
      }
      draw(tRef.current, now)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView, draw])

  const replay = () => {
    tRef.current = 0
    draw(0, performance.now())
    setPlaying(true)
  }
  const seek = (i: number) => {
    // with reduced motion a step shows as a still picture of its end; otherwise play from its start
    tRef.current = reduce ? B[i + 1] : B[i] + 0.001
    draw(tRef.current, performance.now())
    if (!reduce) setPlaying(true)
  }

  return (
    <div ref={wrap} className="card card-pad">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>How a rescue would work</CardTitle>
          <span className="chip">Concept animation</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the animation' : 'Play the animation'}>
            {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />} {playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={replay} aria-label="Replay the animation from the start">
            <RotateCcw size={15} aria-hidden /> Replay
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border border-white/10 bg-[#141c22] sm:aspect-video">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Concept animation, seen from above. A red 119 rescue truck parks at the edge of a flooded street grid. Delphylax launches, sweeps the flooded boulevard back and forth with sonar, finds a heat signature beside a semi-basement window and drops a glowing marker. It then drops the Delphylax Pod, a glowing float, beside the person and backs away. A rescue boat goes straight to the marker."
        >
          <defs>
            <linearGradient id="rc-water" gradientUnits="userSpaceOnUse" x1="690" y1="0" x2="1600" y2="0">
              <stop offset="0" stopColor="#3b83ad" stopOpacity="0.62" />
              <stop offset="0.14" stopColor="#24618c" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#123b62" stopOpacity="0.9" />
              <stop offset="1" stopColor="#0a2644" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="rc-deep" cx="1080" cy="880" r="240" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#040d1a" stopOpacity="0.85" />
              <stop offset="1" stopColor="#040d1a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rc-heat">
              <stop offset="0" stopColor="#ffb347" stopOpacity="0.95" />
              <stop offset="0.35" stopColor="#ff5fa2" stopOpacity="0.7" />
              <stop offset="1" stopColor="#ff5fa2" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rc-marker">
              <stop offset="0" stopColor="#ff2d55" stopOpacity="0.95" />
              <stop offset="1" stopColor="#ff2d55" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rc-pod">
              <stop offset="0" stopColor="#fff1e8" stopOpacity="0.95" />
              <stop offset="0.4" stopColor="#ff9d85" stopOpacity="0.6" />
              <stop offset="1" stopColor="#ff8a73" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rc-vignette" cx="0.5" cy="0.5" r="0.75">
              <stop offset="0.6" stopColor="#0f1519" stopOpacity="0" />
              <stop offset="1" stopColor="#0f1519" stopOpacity="0.55" />
            </radialGradient>
            <pattern ref={ripple} id="rc-ripple" width="96" height="48" patternUnits="userSpaceOnUse">
              <path d="M6,14 q10,-6 20,0 t20,0" fill="none" stroke="#c8ecff" strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M52,36 q9,-5 18,0 t18,0" fill="none" stroke="#c8ecff" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round" />
            </pattern>
            <pattern id="rc-hazard" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="12" fill="#f5c542" />
              <rect x="6" width="6" height="12" fill="#1a1f24" />
            </pattern>
            <clipPath id="rc-flood">
              <path d={`${SHORE} L${W},${H} L${W},0 Z`} />
            </clipPath>
          </defs>

          {/* asphalt */}
          <rect width={W} height={H} fill="#1a242d" />
          {/* lane markings */}
          <g stroke="#d7dde3" strokeOpacity="0.35" strokeWidth="2.5" strokeDasharray="16 14">
            <line x1="0" y1="426" x2={W} y2="426" />
            <line x1="0" y1="514" x2={W} y2="514" />
            <line x1="0" y1="105" x2={W} y2="105" />
            <line x1="0" y1="805" x2={W} y2="805" />
            <line x1="205" y1="0" x2="205" y2={H} />
            <line x1="500" y1="0" x2="500" y2="380" />
            <line x1="500" y1="560" x2="500" y2={H} />
            <line x1="1080" y1="0" x2="1080" y2="840" />
            <line x1="1425" y1="0" x2="1425" y2={H} />
          </g>
          <g stroke="#e3b64a" strokeOpacity="0.55" strokeWidth="2.5">
            <line x1="0" y1="467.5" x2={W} y2="467.5" />
            <line x1="0" y1="472.5" x2={W} y2="472.5" />
          </g>
          {/* crosswalks at the dry junction */}
          <g fill="#e6ebef" opacity="0.7">
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={`a${i}`} x="553" y={391 + i * 16.5} width="28" height="8" rx="1" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <rect key={`b${i}`} x={461 + i * 17} y="354" width="9" height="24" rx="1" />
            ))}
          </g>
          <rect x="586" y="388" width="4" height="78" fill="#e6ebef" opacity="0.6" />

          {/* sidewalks and lots */}
          {BLOCKS.map(([x, y, w, h]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width={w} height={h} rx="10" fill="#2c3944" />
              <rect x={x + 9} y={y + 9} width={w - 18} height={h - 18} rx="6" fill="#232e38" />
            </g>
          ))}
          {/* small parks */}
          <rect x="690" y="150" width="56" height="44" rx="8" fill="#1f4a3c" opacity="0.8" />

          {/* flood water */}
          <g clipPath="url(#rc-flood)">
            <rect width={W} height={H} fill="url(#rc-water)" />
            <rect width={W} height={H} fill="url(#rc-deep)" />
            <rect width={W} height={H} fill="url(#rc-ripple)" />
          </g>
          <path d={SHORE} fill="none" stroke="#c8ecff" strokeOpacity="0.14" strokeWidth="16" />
          <path d={SHORE} fill="none" stroke="#c8ecff" strokeOpacity="0.5" strokeWidth="2.5" strokeDasharray="22 10 8 10" />

          {/* things caught in the flood, for scale */}
          {CARS.map((c) => (
            <Car key={`${c.x}-${c.y}`} {...c} />
          ))}

          {/* where Delphylax has searched */}
          <path ref={swath} d={SWEEP} fill="none" stroke="#7fd0ff" strokeOpacity="0.09" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
          <path ref={trail} d={SWEEP} fill="none" stroke="#9fdcff" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* geometry only */}
          <path ref={sweep} d={SWEEP} fill="none" stroke="none" />
          <path ref={route} d={ROUTE} fill="none" stroke="none" />

          {/* the rescuers' highlighted path */}
          <g ref={routeLine}>
            <path d={ROUTE} fill="none" stroke="#ff8a73" strokeOpacity="0.25" strokeWidth="14" strokeLinecap="round" />
            <path d={ROUTE} fill="none" stroke="#ffb4a6" strokeWidth="3.5" strokeDasharray="12 9" strokeLinecap="round" />
          </g>

          {/* buildings, back to front */}
          {BUILDINGS.map((b) => (
            <Building key={`${b.x}-${b.y}`} b={b} />
          ))}
          {TREES.map(([x, y]) => (
            <Tree key={`${x}-${y}`} x={x} y={y} />
          ))}

          {/* underpass at the corner: the road drops under a bridge into deep water */}
          <g>
            <rect x="1027" y="842" width="8" height="58" fill="#5a6873" />
            <rect x="1125" y="842" width="8" height="58" fill="#5a6873" />
            <rect x="1035" y="858" width="90" height="42" fill="#03080f" />
            <rect x="1035" y="858" width="90" height="42" fill="url(#rc-ripple)" opacity="0.5" />
            <rect x="1024" y="840" width="112" height="20" rx="3" fill="#6a7985" />
            <rect x="1030" y="845" width="100" height="9" rx="1.5" fill="url(#rc-hazard)" />
          </g>

          {/* heat signature beside the semi-basement window */}
          <g ref={heat}>
            <circle cx={TARGET.x} cy={TARGET.y} r="44" fill="url(#rc-heat)" />
            <circle ref={heatRing} cx={TARGET.x} cy={TARGET.y} r="20" fill="none" stroke="#ff8fbd" strokeWidth="2" />
            <circle cx={TARGET.x} cy={TARGET.y} r="5.5" fill="#fff0f6" />
          </g>

          {/* the glowing marker */}
          <g ref={marker} transform={`translate(${MARKER.x} ${MARKER.y})`}>
            <circle r="30" fill="url(#rc-marker)" />
            {[0, 1].map((i) => (
              <circle
                key={i}
                ref={(el) => {
                  markerRings.current[i] = el
                }}
                r="18"
                fill="none"
                stroke="#ff6f8f"
                strokeWidth="2"
              />
            ))}
            <circle r="6.5" fill="#ff2d55" stroke="#fff" strokeWidth="2" />
          </g>

          {/* the Delphylax Pod, seen from above: a render of the real model, with its glow */}
          <g ref={pod} transform={`translate(${POD_AT.x} ${POD_AT.y}) rotate(-24)`}>
            <circle ref={podGlow} r="34" fill="url(#rc-pod)" />
            <circle ref={podRing} r="16" fill="none" stroke="#ffc9b8" strokeWidth="2" />
            <image href={POD_TOP_SRC} x="-19" y="-9" width="38" height="18" preserveAspectRatio="xMidYMid meet" />
          </g>

          {/* sonar pings */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              ref={(el) => {
                pings.current[i] = el
              }}
              cx="958"
              cy="430"
              r="20"
              fill="none"
              stroke="#6cc3ff"
              strokeWidth="2.5"
              opacity="0"
            />
          ))}

          {/* rescuers in an inflatable boat */}
          <g ref={crew} transform={`translate(${ROUTE_B.x} ${ROUTE_B.y}) rotate(${ROUTE_ANGLE.toFixed(1)})`}>
            <g transform="scale(1.25)">
            <g ref={crewWake} opacity="0">
              <path d="M-20,-7 L-52,-15 M-20,7 L-52,15" stroke="#e8f6ff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
            </g>
            <ellipse cx="2" cy="5" rx="24" ry="11" fill="#05090c" opacity="0.3" />
            <rect x="-21" y="-11" width="42" height="22" rx="10" fill="#ff8a1f" />
            <rect x="-15" y="-6.5" width="30" height="13" rx="6" fill="#3a2410" />
            <rect x="-26" y="-3.5" width="7" height="7" rx="1.5" fill="#2a3138" />
            <circle cx="-5" cy="0" r="4" fill="#ffd25e" />
            <circle cx="7" cy="0" r="4" fill="#ffd25e" />
            </g>
          </g>

          {/* Delphylax: two hulls, deck, coral cabin, grab lines and a small wake */}
          <g ref={boat} transform="translate(958 430)">
            <g transform="scale(1.35)">
            <g ref={wake} opacity="0">
              <path d="M-27,-10 L-66,-21 M-27,10 L-66,21" stroke="#e8f6ff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
              <path d="M-30,0 L-58,0" stroke="#e8f6ff" strokeOpacity="0.35" strokeWidth="5" strokeLinecap="round" />
            </g>
            <ellipse cx="2" cy="5" rx="30" ry="15" fill="#05090c" opacity="0.28" />
            <rect x="-27" y="-14" width="46" height="8" rx="4" fill="#eef0ee" />
            <rect x="-27" y="6" width="46" height="8" rx="4" fill="#eef0ee" />
            <path d="M19,-14 L31,-10 L19,-6 Z M19,6 L31,10 L19,14 Z" fill="#ff7f66" />
            <path d="M-24,-15 q7,-4 14,0 q7,-4 14,0 q7,-4 14,0 M-24,15 q7,4 14,0 q7,4 14,0 q7,4 14,0" fill="none" stroke="#ff8a1f" strokeWidth="1.3" />
            <rect x="-17" y="-9" width="31" height="18" rx="2" fill="#1b1f24" />
            <rect x="-11" y="-6.5" width="21" height="13" rx="6" fill="#ff7f66" />
            <rect x="-5" y="-1.4" width="11" height="2.8" rx="1.4" fill="#d9543f" />
            <rect x="-23" y="-4" width="6" height="8" rx="1" fill="#6b7780" />
            <circle cx="26" cy="0" r="3.2" fill="#15181b" stroke="#7fb3d5" strokeWidth="1.2" />
            </g>
          </g>

          {/* 119 rescue truck: cab, ladder, flashing light bar */}
          <g ref={truck} transform="translate(636 470)">
            <g transform="scale(1.22)">
            <circle ref={lightGlow} cx="34" cy="0" r="34" fill="#ff3b30" opacity="0.28" />
            <rect x="-51" y="-14" width="110" height="38" rx="6" fill="#05090c" opacity="0.32" />
            <rect x="-55" y="-19" width="82" height="38" rx="5" fill="#d43b2d" />
            <rect x="-55" y="-19" width="82" height="5" rx="2" fill="#f3ede1" />
            <rect x="-55" y="14" width="82" height="5" rx="2" fill="#f3ede1" />
            <g stroke="#cfd6dc" strokeWidth="2.4" strokeLinecap="round">
              <line x1="-18" y1="-8" x2="22" y2="-8" />
              <line x1="-18" y1="8" x2="22" y2="8" />
              {[-14, -6, 2, 10, 18].map((x) => (
                <line key={x} x1={x} y1="-8" x2={x} y2="8" strokeWidth="1.8" />
              ))}
            </g>
            <text x="-37" y="6" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="700" fill="#fff">
              119
            </text>
            <rect x="29" y="-18" width="27" height="36" rx="6" fill="#e8523f" />
            <rect x="45" y="-14" width="8" height="28" rx="3" fill="#0f1a22" />
            <rect x="31" y="-13" width="8" height="26" rx="2" fill="#1a2026" />
            <rect ref={lightA} x="32" y="-12" width="6" height="11" rx="1.5" fill="#ff3b30" />
            <rect ref={lightB} x="32" y="1" width="6" height="11" rx="1.5" fill="#3b9eff" />
            </g>
          </g>

          <rect width={W} height={H} fill="url(#rc-vignette)" pointerEvents="none" />

          {/* still picture (reduced motion): number the six steps on the scene */}
          {reduce && (
            <g fontFamily="Inter, system-ui, sans-serif" fontSize="20" fontWeight="700" textAnchor="middle">
              {(
                [
                  [636, 410],
                  [748, 556],
                  [1126, 560],
                  [1052, 396],
                  [938, 362],
                  [948, 506],
                ] as const
              ).map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <circle r="18" fill="#0f1519" stroke="#ff8a73" strokeWidth="2.5" />
                  <text y="7" fill="#fff">
                    {i + 1}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* the steps, synced to the scene; each one is a button that jumps there */}
      <div>
        <ol className="space-y-1">
          {RESCUE_STEPS.map((s, i) => {
            const on = i === step
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => seek(i)}
                  aria-current={on ? 'step' : undefined}
                  className={`group block w-full rounded-[10px] px-3 py-2 text-left transition-colors ${on ? 'bg-[rgba(232,101,79,0.12)]' : 'hover:bg-white/[0.04]'}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs transition-colors"
                      style={on ? { background: '#e8654f', color: '#0f1519' } : { border: '1px solid #55646e', color: '#c3ced6' }}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className={`text-base font-semibold leading-tight transition-colors ${on ? 'text-white' : 'text-[#c3ced6] group-hover:text-white'}`}>
                      <span className="sr-only">Step {i + 1}: </span>
                      {s.title}
                    </span>
                  </span>
                  <span className="ml-9 mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      ref={(el) => {
                        fills.current[i] = el
                      }}
                      className="block h-full rounded-full bg-[#e8654f]"
                      style={{ width: '100%' }}
                    />
                  </span>
                  {on && <span className="ml-9 mt-2 block text-base leading-relaxed text-[#eef3f6]">{s.body}</span>}
                </button>
              </li>
            )
          })}
        </ol>
        <p className="sr-only" aria-live="polite">
          Step {step + 1}: {RESCUE_STEPS[step].title}. {RESCUE_STEPS[step].body}
        </p>
        <p className="mt-3 px-3 text-sm leading-relaxed text-[#aab8c2]">{RESCUE_NOTE}</p>
      </div>
      </div>
    </div>
  )
}
