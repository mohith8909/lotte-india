"use client";

// Hero stage: 200vh scroll container with a sticky full-viewport stage.
//  • GSAP + ScrollTrigger — scrubbed timeline (explode, dolly, parallax travel, overlay hand-off)
//  • Motion            — 2D entrance reveals, category pills (layoutId), badge springs
//  • R3F (HeroDiorama) — reads the GSAP-driven `driver`; never re-renders on scroll
//
// The stage uses CSS `position: sticky` rather than ScrollTrigger `pin`: same pinned effect,
// no pin-spacer reflow, and it cooperates with Lenis and the WebGL canvas.

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PackArt } from "@/components/brand/PackArt";
import { useCanUseWebGL } from "@/components/three/useCanUseWebGL";
import { categoryFocus, createDriver, type HeroCategory } from "./driver";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// three.js / R3F is code-split and never server-rendered.
const HeroDiorama = dynamic(() => import("./HeroDiorama"), { ssr: false });

const categories: { id: HeroCategory; label: string }[] = [
  { id: "choco-pie", label: "Choco Pie" },
  { id: "confectionery", label: "Confectionery" },
  { id: "pepero", label: "Pepero" },
];

// Callouts sit beside the three exploded layers (shell rises, biscuit drops).
// Phones: chips alternate edges over the centred pie. Wide screens: the pie sits right of
// centre, so the chips stack just beyond its right edge — clear of the headline at all times.
const badges: { label: string; pos: string; side: "left" | "right" }[] = [
  { label: "Rich Choco Coating", pos: "left-4 top-[44%] lg:left-[82%] lg:top-[24%]", side: "right" },
  { label: "Fluffy Marshmallow", pos: "right-4 top-[57%] lg:right-auto lg:left-[84%] lg:top-[44%]", side: "right" },
  { label: "Soft Biscuit", pos: "left-4 top-[70%] lg:left-[82%] lg:top-[64%]", side: "right" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroStage() {
  const container = useRef<HTMLElement>(null);
  const driver = useRef(createDriver());
  const invalidate = useRef<(() => void) | null>(null);
  const reduce = useReducedMotion() ?? false;
  const webgl = useCanUseWebGL();
  const [category, setCategory] = useState<HeroCategory>("choco-pie");
  const [active, setActive] = useState(true);

  // Render the canvas only while the hero is on screen.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(Boolean(e?.isIntersecting)), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Wide screens: frame the pie to the right of the headline. Phones: drop it below the headline.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      driver.current.baseX = mq.matches ? -1.35 : 0;
      driver.current.baseY = mq.matches ? 0 : 0.9;
      // The scroll pan exists to clear room beside the pie on wide screens. On phones the pie is
      // already centred, so panning would push it off to the left.
      driver.current.panScale = mq.matches ? 1 : 0;
      driver.current.fgScale = mq.matches ? 1 : 0.35;
      driver.current.dollyScale = mq.matches ? 1 : 0.15;
      invalidate.current?.();
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ── GSAP: the scrubbed scroll timeline ──
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const d = driver.current;
        // Load-in: the pie drops into place with a springy settle.
        gsap.fromTo(d, { intro: 0 }, { intro: 1, duration: 1.8, ease: "elastic.out(1, 0.55)", delay: 0.25 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9, // gentle catch-up = buttery scrub
          },
        });
        tl.to(d, { explode: 1, duration: 1, ease: "power2.inOut" }, 0)
          .to(d, { spin: Math.PI * 0.75, duration: 1, ease: "power1.inOut" }, 0)
          .to(d, { camZ: 6.9, camY: 0.15, duration: 1, ease: "power1.inOut" }, 0)
          .to(d, { panX: 0.95, duration: 0.6, ease: "power1.inOut" }, 0.05)
          .to(d, { fg: 1, bg: 1, duration: 1 }, 0)
          .to(".gs-headline", { yPercent: -18, autoAlpha: 0, duration: 0.42, ease: "power2.in" }, 0.05)
          .to(".gs-hint", { autoAlpha: 0, duration: 0.12 }, 0)
          .fromTo(
            ".gs-badge",
            { autoAlpha: 0, scale: 0.8, x: (i: number) => (badges[i]?.side === "left" ? 28 : -28) },
            { autoAlpha: 1, scale: 1, x: 0, duration: 0.3, stagger: 0.1, ease: "back.out(1.8)" },
            0.32,
          )
          .to(".gs-outro", { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.72);
      });
      // Reduced motion: a clean static state — layers gently apart, callouts visible, no scrubbing.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(driver.current, { explode: 0.45, panX: 0.35, intro: 1 });
        gsap.set([".gs-badge", ".gs-outro"], { autoAlpha: 1, x: 0, y: 0 });
        invalidate.current?.();
      });
      return () => mm.revert();
    },
    { scope: container },
  );

  // ── Category pills → GSAP camera / focus transition ──
  const focus = (id: HeroCategory) => {
    setCategory(id);
    const t = categoryFocus[id];
    gsap.to(driver.current, {
      focusX: t.x,
      focusY: t.y,
      focusZ: t.z,
      zoom: t.zoom,
      duration: reduce ? 0 : 1.2,
      ease: "power3.inOut",
      overwrite: "auto",
      onUpdate: () => invalidate.current?.(),
      onComplete: () => invalidate.current?.(),
    });
  };

  return (
    <section ref={container} aria-labelledby="proto-hero-title" className="relative h-[200vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Studio backdrop: warm cream → crisp white */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_40%,#FFFDF9_0%,#FFFDF9_35%,#F7F2EA_100%)]" />

        {/* 3D diorama (falls back to static art without WebGL) */}
        <div className="absolute inset-0">
          {webgl ? (
            <HeroDiorama driver={driver} invalidateRef={invalidate} still={reduce} active={active} />
          ) : webgl === false ? (
            <div className="grid h-full place-items-center lg:justify-end lg:pr-[12%]">
              <PackArt shape="pie" accent="noir" label="Lotte Choco Pie" className="w-72 drop-shadow-2xl" />
            </div>
          ) : null}
        </div>

        {/* Overlay UI */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-8 pt-28 sm:px-8 lg:pb-12 lg:pt-32">
          <div className="gs-headline max-w-xl">
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              Lotte India · since 1914
            </motion.p>
            <h1 id="proto-hero-title" className="mt-5 font-sans text-[clamp(2.6rem,6.2vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-proto-cocoa">
              {["A", "Little", "Circle", "of"].map((w, i) => (
                <span key={w} className="-mb-[0.1em] mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.1, ease, delay: 0.1 + i * 0.07 }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
              <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className="inline-block text-proto-red"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, ease, delay: 0.38 }}
                >
                  Joy
                </motion.span>
              </span>
            </h1>
            <motion.p
              className="mt-6 max-w-sm text-lg leading-relaxed text-proto-muted"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.55 }}
            >
              Crafting everyday moments of sweetness across India.
            </motion.p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Category switcher: Motion layoutId pill, GSAP camera transition */}
            <motion.div
              role="radiogroup"
              aria-label="Focus the scene on a category"
              className="pointer-events-auto inline-flex w-fit gap-1 rounded-full border border-proto-cocoa/10 bg-white/70 p-1 shadow-[0_10px_30px_-18px_rgba(59,30,18,0.5)] backdrop-blur-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.75 }}
            >
              {categories.map((c) => {
                const on = c.id === category;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => focus(c.id)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                      e.preventDefault();
                      const i = categories.findIndex((x) => x.id === category);
                      const next = categories[(i + (e.key === "ArrowRight" ? 1 : categories.length - 1)) % categories.length]!;
                      focus(next.id);
                      (e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=radio]")[categories.indexOf(next)])?.focus();
                    }}
                    className={`relative isolate rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5 ${on ? "text-white" : "text-proto-cocoa/75 hover:text-proto-cocoa"}`}
                  >
                    {on && (
                      <motion.span
                        layoutId="proto-category-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-proto-cta shadow-[0_8px_20px_-8px_rgba(237,29,36,0.7)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                );
              })}
            </motion.div>

            <div className="flex items-end justify-between gap-6">
              <p className="gs-hint flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-proto-muted">
                <span className="relative block h-9 w-5 rounded-full border border-proto-cocoa/25" aria-hidden="true">
                  <span className="absolute left-1/2 top-1.5 h-2 w-1 -translate-x-1/2 rounded-full bg-proto-red motion-safe:animate-bounce" />
                </span>
                Scroll to open the pie
              </p>
              <div className="gs-outro invisible translate-y-4 opacity-0">
                <Link
                  href="#studio"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-proto-cocoa px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-proto-cta active:scale-95"
                >
                  Step into the studio ↓
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Exploded-view callouts (GSAP fades them in; Motion gives each a springy hover) */}
        {/* Callouts describe the pie, so they step aside while another category is in focus.
            Motion fades this wrapper; GSAP owns the individual chips — no property is shared. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          animate={{ opacity: category === "choco-pie" ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden={category !== "choco-pie"}
        >
          <ul aria-label="What's inside a Lotte Choco Pie" className="contents">
            {badges.map((b) => (
              <li key={b.label} className={`gs-badge invisible absolute opacity-0 ${b.pos}`}>
                <motion.span
                  className={`pointer-events-auto flex items-center gap-2.5 rounded-full border border-proto-cocoa/10 bg-white/85 px-4 py-2 text-sm font-semibold text-proto-cocoa shadow-[0_12px_30px_-16px_rgba(59,30,18,0.55)] backdrop-blur ${b.side === "left" ? "flex-row-reverse" : ""}`}
                  whileHover={{ scale: 1.06, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <span className="h-2 w-2 rounded-full bg-proto-red shadow-[0_0_0_4px_rgba(237,29,36,0.18)]" aria-hidden="true" />
                  {b.label}
                </motion.span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
