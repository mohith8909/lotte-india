"use client";

// Intro (about 1.5 s, on every full page load): the logo-red ring draws itself around the
// Lotte mark while a counter runs to 100, then a cream curtain splits open onto the page.
//
// Whether it plays is decided before first paint by the inline script in the root layout
// (html[data-intro="play" | "skip"]), so reduced-motion users never see a flash.
// Click or press any key to skip. When it finishes it dispatches INTRO_DONE_EVENT (the homepage hero
// waits for it before dropping the pie in).

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { LotteMark } from "@/components/brand/LotteMark";
import { INTRO_DONE_EVENT } from "@/lib/intro";
import { startSmoothScroll, stopSmoothScroll } from "@/lib/smoothScroll";

const curtain = [0.76, 0, 0.24, 1] as const;

export function IntroLoader() {
  const [stage, setStage] = useState<"run" | "exit" | "done">("run");
  const count = useMotionValue(0);
  const label = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const ring = useTransform(count, [0, 100], [0, 1]);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") {
      setStage("done");
      return;
    }
    stopSmoothScroll();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      count.set(100);
      setStage("exit");
    };

    // Count to 90 on a timer, then to 100 once fonts and the page have loaded (capped at 2.6 s).
    const run = animate(count, 90, { duration: 1.1, ease: [0.65, 0, 0.35, 1] });
    const loaded = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true })),
      new Promise((r) => setTimeout(r, 1150)),
    ]);
    const cap = setTimeout(finish, 2600);
    void loaded.then(() => {
      if (finished) return;
      void animate(count, 100, { duration: 0.35, ease: "easeOut" }).then(finish);
    });

    const skip = () => finish();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      run.stop();
      clearTimeout(cap);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [count]);

  // Finish on a timer matched to the curtain (0.25 s delay + 0.9 s), not on an animation callback, so the
  // page is always unlocked on time — even if animation frames are paused (e.g. a background tab).
  useEffect(() => {
    if (stage !== "exit") return;
    const t = setTimeout(() => {
      document.documentElement.dataset.intro = "done";
      startSmoothScroll();
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      setStage("done");
    }, 1200);
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === "done") return null;
  const exiting = stage === "exit";

  return (
    <div aria-hidden="true" className="intro-loader fixed inset-0 z-[120] overflow-hidden">
      {/* Two curtain halves that split apart on exit */}
      {(["top", "bottom"] as const).map((half) => (
        <motion.div
          key={half}
          className={`absolute inset-x-0 h-1/2 bg-cream ${half === "top" ? "top-0" : "bottom-0"}`}
          initial={false}
          animate={{ y: exiting ? (half === "top" ? "-100%" : "100%") : "0%" }}
          transition={{ duration: 0.9, ease: curtain, delay: exiting ? 0.25 : 0 }}
        />
      ))}

      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={false}
        animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.08 : 1 }}
        transition={{ duration: 0.45, ease: curtain }}
      >
        <div className="relative grid h-36 w-36 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(22,22,22,0.08)" strokeWidth="1.5" />
            <motion.circle cx="50" cy="50" r="46" fill="none" stroke="#E73437" strokeWidth="2" strokeLinecap="round" style={{ pathLength: ring }} />
          </svg>
          <LotteMark markOnly className="[&_img]:h-16 [&_img]:w-16" />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-x-5 bottom-6 flex items-end justify-between sm:inset-x-10 sm:bottom-10"
        initial={false}
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? 20 : 0 }}
        transition={{ duration: 0.4, ease: curtain }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-soft">Lotte India · since 1914</p>
        <motion.p className="font-sans text-[clamp(3rem,12vw,8rem)] font-light leading-none tracking-[-0.04em] text-noir tabular-nums">
          {label}
        </motion.p>
      </motion.div>
    </div>
  );
}
