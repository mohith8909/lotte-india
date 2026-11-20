import type Lenis from "lenis";

// Module-level handle so modals can pause smooth scrolling without prop drilling.
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

/** Pause wheel smoothing while a modal/drawer is open (body scroll is locked). */
export const stopSmoothScroll = () => instance?.stop();
export const startSmoothScroll = () => instance?.start();
