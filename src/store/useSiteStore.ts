import { create } from 'zustand'
import type { SubsystemId } from '../data/research'

export type Clutter = 'low' | 'extreme'
export type Section = 'hero' | 'problem' | 'how' | 'progress' | 'cost' | 'team'

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
  /** the Try-the-sonar overlay is open: camera dives, page scroll is locked */
  sandboxOpen: boolean
  pings: Ping[]
  pingCount: number
  lock: TargetLock
  markers: Marker[]
  selectedSubsystem: SubsystemId | null
  pointer: { x: number; y: number }
  webglOk: boolean
  victimSeed: number

  setScroll: (p: number, depth: number, section: Section) => void
  toggleExploded: (v?: boolean) => void
  toggleLights: (v?: boolean) => void
  setClutter: (c: Clutter) => void
  toggleSparsity: (v?: boolean) => void
  setSandbox: (v: boolean) => void
  openSandbox: () => void
  closeSandbox: () => void
  emitPing: (x: number, y: number, z: number) => void
  prunePings: (now: number, ttl: number) => void
  setLock: (l: Partial<TargetLock>) => void
  dropMarker: (x: number, y: number, z: number) => void
  reloadMarkers: () => void
  selectSubsystem: (id: SubsystemId | null) => void
  setPointer: (x: number, y: number) => void
  setWebglOk: (v: boolean) => void
  rehideVictim: () => void
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
  sandboxOpen: false,
  pings: [],
  pingCount: 0,
  lock: { active: false, distanceM: 0, confidence: 0, sx: 0.5, sy: 0.5, lockedAt: 0 },
  markers: [],
  selectedSubsystem: null,
  pointer: { x: 0, y: 0 },
  webglOk: true,
  victimSeed: 3,

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
  openSandbox: () => set({ sandboxOpen: true, sandboxActive: true, explodedOn: false }),
  closeSandbox: () => set({ sandboxOpen: false, sandboxActive: false, lock: { active: false, distanceM: 0, confidence: 0, sx: 0.5, sy: 0.5, lockedAt: 0 } }),
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
  selectSubsystem: (selectedSubsystem) => set({ selectedSubsystem }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setWebglOk: (webglOk) => set({ webglOk }),
  rehideVictim: () => set((s) => ({ victimSeed: s.victimSeed + 1, pings: [] })),
}))
