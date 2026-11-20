// Shared, mutable animation state between GSAP (writer) and React Three Fiber (reader).
// GSAP tweens these numbers; `useFrame` reads them every frame and damps toward them.
// Nothing here is React state, so scrubbing the scroll timeline never re-renders the tree.

export interface HeroDriver {
  /** Camera path position: 0 = assemble, 1 = anatomy, 2 = bite, 3 = numbers (spline control points). */
  path: number;
  /** 0 = assembled pie, 1 = fully exploded layers. */
  explode: number;
  /** Anatomy labels opacity, 0…1. */
  labels: number;
  /** The bite: 0 = whole, 0.6 = marshmallow snaps, 1 = bitten piece gone. */
  bite: number;
  /** The pie sinks away so the numbers can take the stage, 0…1. */
  recede: number;
  /** Crumb particles: 0 = hidden/scattered, 1 = formed into a number. */
  morph: number;
  /** Which number the particles spell: 0 = 1914, 1 = 2006, 2 = 1M+ (continuous). */
  num: number;
  /** Foreground / background scroll travel, 0…1 (different speeds = depth). */
  fg: number;
  bg: number;
  /** Camera focus target (category pills). */
  focusX: number;
  focusY: number;
  focusZ: number;
  /** Extra dolly while a category is focused. */
  zoom: number;
  /** 1 on wide screens (pie framed beside the copy), 0 on phones (pie centred). */
  wide: number;
  /** Foreground travel multiplier (smaller on phones so treats don't cross the pie). */
  fgScale: number;
  /** Extra scroll-driven turn of the pie, in radians. */
  spin: number;
  /** Load-in progress 0 → 1 (pie drops into place). */
  intro: number;
  /** Scroll velocity impulse (−1…1); decays in the render loop. */
  velocity: number;
  /** Device tilt on phones (−1…1), used in place of the pointer. */
  tiltX: number;
  tiltY: number;
}

export const createDriver = (): HeroDriver => ({
  path: 0,
  explode: 0,
  labels: 0,
  bite: 0,
  recede: 0,
  morph: 0,
  num: 0,
  fg: 0,
  bg: 0,
  focusX: 0,
  focusY: 0,
  focusZ: 0,
  zoom: 0,
  wide: 1,
  fgScale: 1,
  spin: 0,
  intro: 0,
  velocity: 0,
  tiltX: 0,
  tiltY: 0,
});

export type HeroCategory = "choco-pie" | "confectionery" | "pepero";

/** Where the camera looks for each category pill (world units). */
export const categoryFocus: Record<HeroCategory, { x: number; y: number; z: number; zoom: number }> = {
  "choco-pie": { x: 0, y: 0, z: 0, zoom: 0 },
  confectionery: { x: 4.8, y: -0.2, z: -0.6, zoom: -1.2 },
  pepero: { x: -6.6, y: 0.15, z: -0.6, zoom: -1.2 },
};

type V3 = [number, number, number];

/**
 * Camera choreography: one control point per chapter, joined by a Catmull-Rom spline so the camera
 * glides (and orbits under the pie for the anatomy chapter) instead of dollying in a straight line.
 * Wide screens keep the pie right of the copy; phones keep it centred under the captions.
 */
export const cameraPath: Record<"wide" | "narrow", { pos: V3[]; look: V3[] }> = {
  wide: {
    pos: [[-1.08, 0.35, 7.2], [1.0, -0.85, 6.5], [-0.9, 1.25, 6.6], [0, 0.45, 8.4]],
    look: [[-1.35, 0, 0], [-1.0, 0.1, 0], [-1.15, 0.05, 0], [0, 0.15, 0]],
  },
  narrow: {
    pos: [[0, 1.25, 7.2], [0.7, -0.35, 6.8], [0.1, 1.0, 6.0], [0, 0.4, 8.4]],
    look: [[0, 0.9, 0], [0, 0.35, 0], [0.1, 0.35, 0], [0, 0.15, 0]],
  },
};

/** Where the bite is taken, as an angle around the pie (radians, 0 = +Z). */
export const BITE_ANGLE = 0;
/** World-space angle the bite turns toward during the bite chapter (front-left: the piece pulls into open space). */
export const BITE_FACING = -1.0;
/** Phones: a more frontal bite so the departing piece stays inside the narrow frame. */
export const BITE_FACING_NARROW = -0.45;

/** The numbers the crumbs form, with the facts they stand for (lotteindia.com milestones / about-us). */
export const heroNumbers = [
  { text: "1914", caption: "Parrys Confectionery is born — the start of our story." },
  { text: "2006", caption: "Lotte Choco Pie launches, creating India's pie category." },
  { text: "1M+", caption: "Retail outlets reached across India today." },
] as const;

export const heroPalette = {
  red: "#ED1D24",
  cocoa: "#3B1E12",
  ivory: "#FFF9F0",
  caramel: "#D98A2B",
  coffee: "#5C3422",
  biscuit: "#B9773A",
} as const;
