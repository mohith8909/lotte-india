// Shared by the root layout's inline script, IntroLoader and anything that should wait for the intro.

export const INTRO_DONE_EVENT = "lotte:intro-done";

/**
 * Runs inline in <head> before first paint: the intro plays on every full page load (in-app navigation
 * never replays it) and never with reduced motion. Sets html[data-intro] to "play" or "skip".
 */
export const introDecisionScript = `try{document.documentElement.dataset.intro=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"skip":"play"}catch(e){document.documentElement.dataset.intro="skip"}`;

/** True while the intro is (about to be) on screen. */
export const introPlaying = () => typeof document !== "undefined" && document.documentElement.dataset.intro === "play";
