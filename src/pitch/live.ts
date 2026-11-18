/**
 * Frame-rate state shared between the deck (DOM) and the 3D stage, without React
 * re-renders. No three.js import here, so the deck shell stays small.
 */
export const live = {
  /** current slide index, 0-based */
  slide: 0,
  /** current step inside the slide */
  step: 0,
  /** prefers-reduced-motion: no camera moves, no spinning, final states only */
  reduce: false,
  /** performance.now() when the slide or step last changed */
  stepAt: 0,
  /** where the 16:9 slide frame sits inside the viewport, in CSS pixels */
  frame: { x: 0, y: 0, w: 1920, h: 1080 },
}

/** seconds since the current slide/step was entered (very large with reduced motion) */
export const sinceStep = () => (live.reduce ? 1e6 : (performance.now() - live.stepAt) / 1000)

/** slide indexes the 3D stage cares about */
export const SLIDE = { title: 0, what: 3, how: 4, pod: 5, society: 9, thanks: 13 } as const
