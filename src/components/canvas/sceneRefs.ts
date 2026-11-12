import * as THREE from 'three'

/**
 * Mutable, frame-rate scene state shared between canvas components and the HUD
 * without going through React state (avoids re-renders at 60 fps).
 */
export const sceneRefs = {
  /** world position of the sonar float (ping origin) */
  nose: new THREE.Vector3(1.1, 0, 0),
  /** world position of the marker rack drop point (stern) */
  stern: new THREE.Vector3(-0.9, 0.1, 0),
  robot: new THREE.Vector3(0, 0, 0),
  victim: new THREE.Vector3(6.5, -2.05, -1.9),
  /** 0..1 — how strongly the victim is currently illuminated by sonar */
  reveal: 0,
  /** last ping emission time (s) */
  lastPing: -10,
  /** chromatic aberration pulse 0..1 */
  caPulse: 0,
  /** current smoothed exploded amount 0..1 */
  exploded: 0,
  /** smoothed camera depth factor 0..1 */
  depth01: 0,
  /** boat heading in degrees (for the HUD compass) */
  heading: 178,
  fps: 60,
  /** stable DOM portal for drei <Html> so it never remounts when R3F reconnects events */
  htmlPortal: { current: null } as { current: HTMLElement | null },
}

/** Boat is modelled in millimetres × MM; 940 mm hull ≈ 2.07 scene units. */
export const MM = 0.0022
export const METERS_PER_UNIT = 0.001 / MM // ≈ 0.4545 m per unit
export const FLOOR_Y = -2.2
export const SONAR_SPEED = 3.4 // scene units / s
export const PING_TTL = 7
