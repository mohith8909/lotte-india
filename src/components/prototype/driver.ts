// Shared, mutable animation state between GSAP (writer) and React Three Fiber (reader).
// GSAP tweens these numbers; `useFrame` reads them every frame and damps toward them.
// Nothing here is React state, so scrubbing the scroll timeline never re-renders the tree.

export interface HeroDriver {
  /** 0 = assembled pie, 1 = fully exploded layers (scroll-scrubbed). */
  explode: number;
  /** Camera distance and height (scroll-scrubbed). */
  camZ: number;
  camY: number;
  /** Foreground / background scroll travel, 0…1 (different speeds = depth). */
  fg: number;
  bg: number;
  /** Camera focus target (category pills). */
  focusX: number;
  focusY: number;
  focusZ: number;
  /** Extra dolly while a category is focused. */
  zoom: number;
  /** Responsive horizontal offset so the pie sits beside the headline on wide screens. */
  baseX: number;
  /** Scroll-driven pan: as the headline leaves, the pie drifts toward centre to make room for callouts. */
  panX: number;
  /** Responsive vertical offset: on phones the camera aims above the pie so it sits below the headline. */
  baseY: number;
  /** How much of the scroll pan applies at this screen size (1 desktop, 0 phones — the pie is already centred). */
  panScale: number;
  /** Foreground travel multiplier (smaller on phones so treats don't cross the pie). */
  fgScale: number;
  /** Share of the scroll dolly applied (phones dolly less so the exploded stack fits). */
  dollyScale: number;
  /** Extra scroll-driven turn of the pie, in radians. */
  spin: number;
  /** Load-in progress 0 → 1 (pie drops into place). */
  intro: number;
}

export const createDriver = (): HeroDriver => ({
  explode: 0,
  camZ: 7.2,
  camY: 0.35,
  fg: 0,
  bg: 0,
  focusX: 0,
  focusY: 0,
  focusZ: 0,
  zoom: 0,
  baseX: 0,
  panX: 0,
  baseY: 0,
  panScale: 1,
  fgScale: 1,
  dollyScale: 1,
  spin: 0,
  intro: 0,
});

export type HeroCategory = "choco-pie" | "confectionery" | "pepero";

/** Where the camera looks for each category pill (world units). */
export const categoryFocus: Record<HeroCategory, { x: number; y: number; z: number; zoom: number }> = {
  "choco-pie": { x: 0, y: 0, z: 0, zoom: 0 },
  confectionery: { x: 4.8, y: -0.2, z: -0.6, zoom: -1.2 },
  pepero: { x: -6.6, y: 0.15, z: -0.6, zoom: -1.2 },
};

export const heroPalette = {
  red: "#ED1D24",
  cocoa: "#3B1E12",
  ivory: "#FFF9F0",
  caramel: "#D98A2B",
  coffee: "#5C3422",
  biscuit: "#B9773A",
} as const;
