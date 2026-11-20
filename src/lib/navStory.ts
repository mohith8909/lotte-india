// Tiny external store: the homepage scroll story tells the menu bar how far through it the reader is,
// so the bar's progress line follows the story (and shows the chapter name) instead of page scroll.

type Listener = () => void;

export interface NavStoryState {
  /** 0…1 through the story, or null when no story is on screen (the bar then shows page progress). */
  progress: number | null;
  /** Current chapter, e.g. "02 · Anatomy"; null hides the label. */
  label: string | null;
}

let state: NavStoryState = { progress: null, label: null };
const progressListeners = new Set<Listener>();
const labelListeners = new Set<Listener>();

export const navStory = {
  get: () => state,
  setProgress(progress: number | null) {
    if (progress === state.progress) return;
    state = { ...state, progress };
    progressListeners.forEach((l) => l());
  },
  setLabel(label: string | null) {
    if (label === state.label) return;
    state = { ...state, label };
    labelListeners.forEach((l) => l());
  },
  /** Fires on every progress change (scroll-rate) — read with `get()`, don't re-render on it. */
  onProgress(l: Listener) {
    progressListeners.add(l);
    return () => void progressListeners.delete(l);
  },
  /** Fires only when the chapter label changes — safe for useSyncExternalStore. */
  onLabel(l: Listener) {
    labelListeners.add(l);
    return () => void labelListeners.delete(l);
  },
};
