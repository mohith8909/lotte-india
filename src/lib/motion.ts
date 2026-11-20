// Shared motion tokens so every animation on the site shares one rhythm.

/** Long, soft deceleration ("expo out") — entrances and reveals. */
export const easeOut = [0.16, 1, 0.3, 1] as const;
/** Symmetric ease for state changes that both enter and leave. */
export const easeInOut = [0.65, 0, 0.35, 1] as const;

export const duration = {
  /** Hover, press and toggle feedback. */
  micro: 0.2,
  /** Panels, drawers, filters. */
  base: 0.5,
  /** Scroll reveals and headings. */
  reveal: 0.9,
  /** Hero and page-level entrances. */
  hero: 1.2,
} as const;

export const spring = {
  /** Snappy UI (pills, toggles). */
  ui: { type: "spring", stiffness: 420, damping: 34, mass: 0.8 },
  /** Soft follow (magnetic buttons, cursors). */
  follow: { type: "spring", stiffness: 180, damping: 18, mass: 0.6 },
  /** Drawers and sheets. */
  sheet: { type: "spring", stiffness: 260, damping: 32 },
} as const;

/** Stagger between list items, per Material/HIG guidance (30–60 ms). */
export const stagger = 0.06;
