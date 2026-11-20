import { create } from 'zustand'
import type { PartId } from '../data/research'

export type Clutter = 'low' | 'extreme'
export type Section = 'hero' | 'crisis' | 'engineering' | 'pod' | 'sandbox' | 'matrix' | 'business'

export interface Ping {
  id: number
  x: number
  y: number
  z: number
  /** performance.now()/1000 at emission */
  t: number
}

export interface TargetLock {
  active: boolean
  distanceM: number
  confidence: number
  sx: number
  sy: number
  lockedAt: number
}

export interface Marker {
  id: number
  x: number
  y: number
  z: number
  t: number
}

interface SiteState {
  scrollProgress: number
  depthM: number
  section: Section
  explodedOn: boolean
  lights: boolean
  clutter: Clutter
  sparsity: boolean
  sandboxActive: boolean
  pings: Ping[]
  pingCount: number
  lock: TargetLock
  markers: Marker[]
  /** the legend part highlighted on the 3D model */
  selectedPart: PartId | null
  pointer: { x: number; y: number }
  webglOk: boolean
  /** fast text-first page: the 3D canvas and post-processing are off */
  readMode: boolean
  victimSeed: number
  /** performance.now() when the Pod was dropped, or null while it rides on the deck */
  podDropAt: number | null

  setScroll: (p: number, depth: number, section: Section) => void
  toggleExploded: (v?: boolean) => void
  toggleLights: (v?: boolean) => void
  setClutter: (c: Clutter) => void
  toggleSparsity: (v?: boolean) => void
  setSandbox: (v: boolean) => void
  emitPing: (x: number, y: number, z: number) => void
  prunePings: (now: number, ttl: number) => void
  setLock: (l: Partial<TargetLock>) => void
  dropMarker: (x: number, y: number, z: number) => void
  reloadMarkers: () => void
  selectPart: (id: PartId | null) => void
  setPointer: (x: number, y: number) => void
  setWebglOk: (v: boolean) => void
  setReadMode: (v: boolean) => void
  rehideVictim: () => void
  dropPod: () => void
  resetPod: () => void
}

const READ_KEY = 'dlx-read-mode'

/**
 * Read mode starts on when the visitor chose it before, prefers reduced motion,
 * or is on a low-power device. A saved choice always wins.
 */
function initialReadMode(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const saved = window.localStorage.getItem(READ_KEY)
    if (saved === '1') return true
    if (saved === '0') return false
  } catch {
    /* storage blocked: fall through to detection */
  }
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  } catch {
    /* no matchMedia */
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true
  return false
}

let pingId = 0
let markerId = 0
export const MAX_MARKERS = 4

export const useSiteStore = create<SiteState>((set, get) => ({
  scrollProgress: 0,
  depthM: 0,
  section: 'hero',
  explodedOn: false,
  lights: true,
  clutter: 'low',
  sparsity: true,
  sandboxActive: false,
  pings: [],
  pingCount: 0,
  lock: { active: false, distanceM: 0, confidence: 0, sx: 0.5, sy: 0.5, lockedAt: 0 },
  markers: [],
  selectedPart: null,
  pointer: { x: 0, y: 0 },
  webglOk: true,
  readMode: initialReadMode(),
  victimSeed: 3,
  podDropAt: null,

  setScroll: (scrollProgress, depthM, section) => {
    const s = get()
    if (s.scrollProgress === scrollProgress && s.section === section) return
    set({ scrollProgress, depthM, section })
  },
  toggleExploded: (v) => set((s) => ({ explodedOn: v ?? !s.explodedOn })),
  toggleLights: (v) => set((s) => ({ lights: v ?? !s.lights })),
  setClutter: (clutter) => set({ clutter }),
  toggleSparsity: (v) => set((s) => ({ sparsity: v ?? !s.sparsity })),
  setSandbox: (sandboxActive) => set({ sandboxActive }),
  emitPing: (x, y, z) =>
    set((s) => ({
      pings: [...s.pings.slice(-5), { id: ++pingId, x, y, z, t: performance.now() / 1000 }],
      pingCount: s.pingCount + 1,
    })),
  prunePings: (now, ttl) =>
    set((s) => {
      const alive = s.pings.filter((p) => now - p.t < ttl)
      return alive.length === s.pings.length ? {} : { pings: alive }
    }),
  setLock: (l) => set((s) => ({ lock: { ...s.lock, ...l } })),
  dropMarker: (x, y, z) =>
    set((s) =>
      s.markers.length >= MAX_MARKERS ? {} : { markers: [...s.markers, { id: ++markerId, x, y, z, t: performance.now() / 1000 }] },
    ),
  reloadMarkers: () => set({ markers: [] }),
  selectPart: (selectedPart) => set({ selectedPart }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setWebglOk: (webglOk) => set({ webglOk }),
  setReadMode: (readMode) => {
    try {
      window.localStorage.setItem(READ_KEY, readMode ? '1' : '0')
    } catch {
      /* storage blocked: the choice just lasts for this visit */
    }
    set(readMode ? { readMode, explodedOn: false, selectedPart: null, podDropAt: null } : { readMode })
  },
  rehideVictim: () => set((s) => ({ victimSeed: s.victimSeed + 1, pings: [] })),
  dropPod: () => set({ podDropAt: performance.now() }),
  resetPod: () => set((s) => (s.podDropAt === null ? {} : { podDropAt: null })),
}))

/** True when the live 3D scene is on screen (WebGL works and Read mode is off). */
export const useLive3d = () => useSiteStore((s) => s.webglOk && !s.readMode)
