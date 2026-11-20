"use client";

// Hero stage: a scroll story in four chapters on a sticky full-viewport stage.
//   1. Assemble  2. Anatomy  3. The bite  4. Since 1914 (crumbs form the numbers) → chocolate wave hand-off
//  • GSAP + ScrollTrigger — one scrubbed timeline drives the `driver` and the DOM captions
//  • Motion            — entrance reveals, category pills (layoutId), progress rail
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
import { INTRO_DONE_EVENT, introPlaying } from "@/lib/intro";
import { navStory } from "@/lib/navStory";
import { scrollToY } from "@/lib/smoothScroll";
import { categoryFocus, createDriver, heroNumbers, type HeroCategory } from "./driver";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// three.js / R3F is code-split and never server-rendered.
const HeroDiorama = dynamic(() => import("./HeroDiorama"), { ssr: false });

const categories: { id: HeroCategory; label: string }[] = [
  { id: "choco-pie", label: "Choco Pie" },
  { id: "confectionery", label: "Confectionery" },
  { id: "pepero", label: "Pepero" },
];

/** Labels for the exploded layers, top to bottom (positioned from the 3D scene every frame). */
const anatomy = ["Rich choco coating", "Fluffy marshmallow", "Soft biscuit"];

// Timeline units. Total scroll story = TOTAL units over the section's scroll distance.
// The studio section below overlaps the hero's last 100vh (it slides up over the pinned stage), so the
// final ~1.1 units are that hand-off: 620vh section → 520vh of scroll, the last 100vh = 1.13 units.
const TOTAL = 5.9;
/** Resting frames the scroll gently settles on: assemble, anatomy, mid-bite, 1914, 2006, 1M+. */
const STOPS = [0, 1.4, 2.4, 3.5, 4.05, 4.6];
const chapters = [
  { label: "Assemble", from: 0, stop: 0 },
  { label: "Anatomy", from: 0.85, stop: 1.4 },
  { label: "The bite", from: 1.95, stop: 2.4 },
  { label: "Since 1914", from: 2.9, stop: 3.5 },
];

const ease = [0.16, 1, 0.3, 1] as const;
const captionIn = { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" };
const captionOut = { autoAlpha: 0, y: -24, duration: 0.22, ease: "power2.in" };

export function HeroStage() {
  const container = useRef<HTMLElement>(null);
  const driver = useRef(createDriver());
  const invalidate = useRef<(() => void) | null>(null);
  const labelEls = useRef<(HTMLElement | null)[]>([]);
  const reduce = useReducedMotion() ?? false;
  const webgl = useCanUseWebGL();
  const [category, setCategory] = useState<HeroCategory>("choco-pie");
  const [chapter, setChapter] = useState(0);
  const chapterRef = useRef(0);
  const [active, setActive] = useState(true);

  // Render the canvas only while the hero is on screen.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(Boolean(e?.isIntersecting)), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Wide screens frame the pie beside the copy; phones centre it under the captions.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      driver.current.wide = mq.matches ? 1 : 0;
      driver.current.fgScale = mq.matches ? 1 : 0.35;
      invalidate.current?.();
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Phones: tilting the device steers the parallax (where the browser allows it without a prompt).
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: coarse)").matches) return;
    const clamp = gsap.utils.clamp(-1, 1);
    const onTilt = (e: DeviceOrientationEvent) => {
      driver.current.tiltX = clamp((e.gamma ?? 0) / 25);
      driver.current.tiltY = clamp(((e.beta ?? 45) - 45) / 25);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [reduce]);

  // ── GSAP: the scrubbed scroll story ──
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const d = driver.current;
        // Load-in: the pie drops into place with a springy settle.
        // On a first visit it waits for the intro curtain to open, so the drop is actually seen.
        const dropIn = () => gsap.fromTo(d, { intro: 0 }, { intro: 1, duration: 1.8, ease: "elastic.out(1, 0.55)", delay: 0.25 });
        const waitingForIntro = introPlaying();
        if (waitingForIntro) window.addEventListener(INTRO_DONE_EVENT, dropIn, { once: true });
        else dropIn();

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9, // gentle catch-up = buttery scrub
            // Past the story, the menu bar goes back to page progress (and normal hide-on-scroll).
            onLeave: () => {
              navStory.setProgress(null);
              navStory.setLabel(null);
            },
            onUpdate: (self) => {
              // Scroll speed → a physical lean on the pie (decays in the render loop).
              d.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500);
              navStory.setProgress(self.progress); // the menu bar's progress line follows the story
              const t = self.progress * TOTAL;
              const c = chapters.reduce((acc, ch, i) => (t >= ch.from ? i : acc), 0);
              if (c !== chapterRef.current) {
                chapterRef.current = c;
                setChapter(c);
              }
              // Set every update (the store ignores repeats) so it returns after scrolling back up.
              navStory.setLabel(`${String(c + 1).padStart(2, "0")} · ${chapters[c]!.label}`);
            },
          },
        });

        // Chapter 1 → 2: assemble, then open the pie while the camera orbits under it.
        tl.to(d, { spin: Math.PI * 0.75, duration: 1.2, ease: "power1.inOut" }, 0)
          .to(d, { fg: 1, bg: 1, duration: 2.4 }, 0)
          .to(".gs-hint", { autoAlpha: 0, duration: 0.15 }, 0)
          .to(".gs-ch1", { yPercent: -18, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 0.3)
          .to(d, { path: 1, duration: 0.95, ease: "power1.inOut" }, 0.3)
          .to(d, { explode: 1, duration: 0.85, ease: "power2.inOut" }, 0.35)
          .to(d, { labels: 1, duration: 0.4 }, 0.85)
          .fromTo(".gs-ch2", { autoAlpha: 0, y: 30 }, captionIn, 0.85)
          // Chapter 3: close the layers, swing to the bite, pull the piece away.
          .to(d, { labels: 0, duration: 0.25 }, 1.6)
          .to(".gs-ch2", captionOut, 1.6)
          .to(d, { path: 2, duration: 0.6, ease: "power1.inOut" }, 1.55)
          .to(d, { explode: 0.08, duration: 0.45, ease: "power2.inOut" }, 1.6)
          .fromTo(".gs-ch3", { autoAlpha: 0, y: 30 }, captionIn, 1.95)
          .to(d, { bite: 1, duration: 0.75 }, 2.05)
          .to(".gs-ch3", captionOut, 2.75)
          // Chapter 4: the pie sinks, crumbs fly together into 1914 → 2006 → 1M+.
          .to(d, { path: 3, duration: 0.6, ease: "power1.inOut" }, 2.75)
          .to(d, { recede: 1, duration: 0.6, ease: "power2.in" }, 2.8)
          .to(d, { fg: 2.2, duration: 0.6, ease: "power1.in" }, 2.75) // foreground treats leave the frame
          .to(d, { morph: 1, duration: 0.55, ease: "power1.out" }, 2.9)
          .fromTo(".gs-ch4", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 3.1)
          .fromTo(".gs-num-0", { autoAlpha: 0, y: 16 }, captionIn, 3.25)
          .to(".gs-num-0", captionOut, 3.65)
          .to(d, { num: 1, duration: 0.3 }, 3.65)
          .fromTo(".gs-num-1", { autoAlpha: 0, y: 16 }, captionIn, 3.8)
          .to(".gs-num-1", captionOut, 4.2)
          .to(d, { num: 2, duration: 0.3 }, 4.2)
          .fromTo(".gs-num-2", { autoAlpha: 0, y: 16 }, captionIn, 4.35)
          // Hand-off: the studio section slides up over the pinned stage, led by its chocolate wave edge.
          .to(".gs-rail", { autoAlpha: 0, duration: 0.15 }, 4.65)
          .to({}, { duration: 0.01 }, TOTAL - 0.01); // timeline length = TOTAL, so scroll maps 1:1

        // Gentle snapping: when scrolling stops near a resting frame, settle onto it — but only
        // forwards in the direction of travel (or when already very close), so it never fights you.
        const st = tl.scrollTrigger!;
        const stops = STOPS.map((s) => s / TOTAL);
        const onScrollEnd = () => {
          if (!st.isActive) return;
          const p = st.progress;
          if (p > stops[stops.length - 1]! + 0.02) return; // leaving the hero: let it go
          const i = stops.reduce((best, s, j) => (Math.abs(s - p) < Math.abs(stops[best]! - p) ? j : best), 0);
          const target = stops[i]!;
          const gap = Math.min(
            i > 0 ? target - stops[i - 1]! : Infinity,
            i < stops.length - 1 ? stops[i + 1]! - target : Infinity,
          );
          const delta = target - p;
          const dist = Math.abs(delta);
          const withTravel = Math.sign(delta) === st.direction;
          if (dist < 0.002 || dist > gap * 0.4 || (!withTravel && dist > gap * 0.12)) return;
          scrollToY(st.start + (st.end - st.start) * target, { duration: 0.9 });
        };
        ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
        return () => {
          window.removeEventListener(INTRO_DONE_EVENT, dropIn);
          ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
          navStory.setProgress(null);
          navStory.setLabel(null);
        };
      });

      // Reduced motion: a calm, static anatomy view with labels; the numbers appear as plain text below.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(driver.current, { explode: 0.55, labels: 1, path: 1, intro: 1 });
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
  const focusRef = useRef(focus);
  focusRef.current = focus;

  // The story is about the pie: leaving chapter 1 brings the camera back from another category.
  useEffect(() => {
    if (chapter > 0 && category !== "choco-pie") focusRef.current("choco-pie");
  }, [chapter, category]);

  const jumpTo = (i: number) => {
    const el = container.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    scrollToY(top + (distance * chapters[i]!.stop) / TOTAL, { duration: 1.4 });
  };

  return (
    <section ref={container} aria-labelledby="proto-hero-title" className="relative h-[620vh] motion-reduce:h-auto">
      <div className="sticky top-0 h-[100svh] overflow-hidden motion-reduce:relative">
        {/* Studio backdrop: warm cream → crisp white */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_40%,#FFFDF9_0%,#FFFDF9_35%,#F7F2EA_100%)]" />

        {/* 3D diorama (falls back to static art without WebGL) */}
        <div className="absolute inset-0">
          {webgl ? (
            <HeroDiorama driver={driver} invalidateRef={invalidate} labelsRef={labelEls} still={reduce} active={active} />
          ) : webgl === false ? (
            <div className="grid h-full place-items-center lg:justify-end lg:pr-[12%]">
              <PackArt shape="pie" accent="noir" label="Lotte Choco Pie" idSuffix="hero" className="w-72 drop-shadow-2xl" />
            </div>
          ) : null}
        </div>

        {/* Chapter 2 labels: dot + leader line + chip, positioned from the 3D layers every frame.
            They describe the pie, so they step aside while another category is in focus. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          animate={{ opacity: category === "choco-pie" ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden="true"
        >
          {anatomy.map((label, i) => (
            <div
              key={label}
              ref={(el) => {
                labelEls.current[i] = el;
              }}
              className="invisible absolute inset-0"
            >
              <span className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-proto-red shadow-[0_0_0_5px_rgba(237,29,36,0.18)]" />
              <span className="absolute left-0 top-0 h-px origin-left bg-proto-cocoa/45" />
              <span className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-proto-cocoa/10 bg-white/85 px-3 py-1.5 text-xs font-semibold text-proto-cocoa shadow-[0_12px_30px_-16px_rgba(59,30,18,0.55)] backdrop-blur sm:px-4 sm:py-2 sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Chapter 1: headline, category pills, scroll hint ── */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-8 pt-28 sm:px-8 lg:pb-12 lg:pt-32">
          <div className="gs-ch1 max-w-xl">
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              Lotte India · since 1914
            </motion.p>
            <h1 id="proto-hero-title" aria-label="A Little Circle of Joy" className="mt-5 font-sans text-[clamp(2.6rem,6.2vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-proto-cocoa">
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

          <div className="gs-ch1 flex flex-col gap-5">
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
              <p className="gs-hint flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-proto-muted motion-reduce:hidden">
                <span className="relative block h-9 w-5 rounded-full border border-proto-cocoa/25" aria-hidden="true">
                  <span className="absolute left-1/2 top-1.5 h-2 w-1 -translate-x-1/2 rounded-full bg-proto-red motion-safe:animate-bounce" />
                </span>
                Scroll to open the pie
              </p>
              <Link
                href="#studio"
                className="pointer-events-auto rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-proto-muted underline-offset-4 transition hover:text-proto-cocoa hover:underline motion-reduce:hidden"
              >
                Skip the story ↓
              </Link>
            </div>
          </div>
        </div>

        {/* ── Chapter 2: anatomy ── */}
        <div className="gs-ch2 pointer-events-none invisible absolute inset-x-5 top-24 z-10 max-w-md opacity-0 sm:inset-x-8 lg:bottom-16 lg:left-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:right-auto lg:top-auto motion-reduce:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta">Chapter 02 · Anatomy</p>
          <h2 className="mt-3 font-sans text-[clamp(1.9rem,4vw,3.4rem)] font-extrabold leading-[1] tracking-[-0.03em] text-proto-cocoa">
            Three layers of <span className="text-proto-red">joy</span>.
          </h2>
          <p className="mt-4 hidden max-w-sm text-proto-muted sm:block">
            Fluffy marshmallow sandwiched between soft biscuits and drenched in rich choco.
          </p>
          <ul className="sr-only">
            {anatomy.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        {/* ── Chapter 3: the bite ── */}
        <div className="gs-ch3 pointer-events-none invisible absolute inset-x-5 top-24 z-10 max-w-md opacity-0 sm:inset-x-8 lg:left-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:right-auto lg:top-1/2 lg:-translate-y-1/2 motion-reduce:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta">Chapter 03 · The bite</p>
          <h2 className="mt-3 font-sans text-[clamp(1.9rem,4vw,3.4rem)] font-extrabold leading-[1] tracking-[-0.03em] text-proto-cocoa">
            Soft, sweet and <span className="text-proto-red">made to share</span>.
          </h2>
          <p className="mt-4 hidden max-w-sm text-proto-muted sm:block">That marshmallow stretch is what made it India&apos;s No.1 Choco Pie.</p>
        </div>

        {/* ── Chapter 4: since 1914 (the numbers themselves are drawn by the particles) ── */}
        <div className="gs-ch4 pointer-events-none invisible absolute inset-x-5 top-24 z-10 text-center opacity-0 lg:top-28 motion-reduce:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta">Chapter 04 · Since 1914</p>
          <h2 className="sr-only">Lotte India in numbers</h2>
        </div>
        {heroNumbers.map((n, i) => (
          <div
            key={n.text}
            className={`gs-num-${i} pointer-events-none invisible absolute inset-x-5 top-[62%] z-10 mx-auto max-w-md text-center opacity-0 sm:top-[66%] motion-reduce:hidden`}
          >
            {/* Without WebGL there are no particles, so the number is shown as text. */}
            <p className={webgl === false ? "text-7xl font-extrabold tracking-[-0.04em] text-proto-cocoa" : "sr-only"}>{n.text}</p>
            <p className="text-lg font-semibold text-proto-cocoa sm:text-xl">{n.caption}</p>
          </div>
        ))}

        {/* Progress rail: where you are in the story; each dot jumps to its chapter. */}
        <nav aria-label="Story chapters" className="gs-rail absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-1 sm:flex motion-reduce:!hidden">
          {chapters.map((c, i) => {
            const on = chapter === i;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Chapter ${i + 1}: ${c.label}`}
                aria-current={on ? "step" : undefined}
                className="group flex min-h-[28px] items-center justify-end gap-3 px-2"
              >
                <span
                  className={`hidden text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity sm:block ${on ? "text-proto-cocoa" : "text-proto-muted"} opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`}
                >
                  {c.label}
                </span>
                <motion.span
                  className={`block w-1.5 rounded-full ${on ? "bg-proto-red" : "bg-proto-cocoa/25 group-hover:bg-proto-cocoa/50"}`}
                  animate={{ height: on ? 28 : 6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Reduced motion: the numbers chapter as plain, static content. */}
      <div className="hidden bg-proto-cream px-5 pb-20 pt-4 motion-reduce:block sm:px-8">
        <h2 className="mx-auto max-w-7xl text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta">Lotte India in numbers</h2>
        <ul className="mx-auto mt-6 grid max-w-7xl gap-6 sm:grid-cols-3">
          {heroNumbers.map((n) => (
            <li key={n.text} className="rounded-3xl bg-white p-6 ring-1 ring-proto-cocoa/10">
              <p className="text-5xl font-extrabold tracking-[-0.04em] text-proto-cocoa">{n.text}</p>
              <p className="mt-2 text-proto-muted">{n.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
