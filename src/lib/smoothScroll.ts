import type Lenis from "lenis";

// Module-level handle so modals can pause smooth scrolling without prop drilling.
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

/** Pause wheel smoothing while a modal/drawer is open (body scroll is locked). */
export const stopSmoothScroll = () => instance?.stop();
export const startSmoothScroll = () => instance?.start();

/** Glide to a page offset with Lenis when it's running, else native smooth scroll. */
export const scrollToY = (y: number, opts: { duration?: number; immediate?: boolean } = {}) => {
  if (instance) {
    instance.scrollTo(y, { duration: opts.duration ?? 1, immediate: opts.immediate, force: true });
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate ? "auto" : "smooth" });
  }
};
