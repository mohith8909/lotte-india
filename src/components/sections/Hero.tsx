"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { PackArt } from "@/components/brand/PackArt";
import { LazyHeroScene } from "@/components/three/Lazy3D";
import { Magnetic } from "@/components/ui/Magnetic";
import { MaskWords } from "@/components/ui/Reveal";
import { VelocityMarquee } from "@/components/ui/VelocityMarquee";
import { cn } from "@/lib/cn";
import { duration, easeOut, spring } from "@/lib/motion";

const marquee = ["Choco Pie", "Coffy Bite", "Pepero", "Lotte Eclairs", "Caramilk", "Lacto King", "Fruto Pie", "Coconut Punch", "Fruitz", "Chewits"];

/** Sum two motion values (scroll offset + pointer offset) into one transform channel. */
function useSum(a: MotionValue<number>, b: MotionValue<number>) {
  return useTransform(() => a.get() + b.get());
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reduce = useReducedMotion() ?? false;
  // WCAG 2.2.2: auto-moving content (3D scene, floats, marquee, word swap) gets a pause control.
  const [paused, setPaused] = useState(false);
  const still = paused || reduce;

  // ── Scroll choreography: each layer travels at its own speed for depth. ──
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const artY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const badgeScrollY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const badgeScrollRotate = useTransform(scrollYProgress, [0, 1], [-3, 8]);
  const treatScrollY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);

  // ── Pointer depth: normalised −0.5…0.5, sprung so it never jitters. ──
  const nx = useSpring(0, spring.follow);
  const ny = useSpring(0, spring.follow);
  const glowX = useMotionValue(-600);
  const glowY = useMotionValue(-600);
  const tiltX = useTransform(ny, (v) => -v * 7);
  const tiltY = useTransform(nx, (v) => v * 9);
  const badgePX = useTransform(nx, (v) => v * -36);
  const badgePY = useTransform(ny, (v) => v * -24);
  const chipPX = useTransform(nx, (v) => v * 22);
  const treatPX = useTransform(nx, (v) => v * 48);
  const treatPY = useTransform(ny, (v) => v * 36);
  const ambientX = useTransform(nx, (v) => v * -40);
  const ambientY = useTransform(ny, (v) => v * -30);
  const badgeY = useSum(badgeScrollY, badgePY);
  const treatY = useSum(treatScrollY, treatPY);
  const treat2X = useTransform(treatPX, (v) => -v * 0.6);
  const treat2Y = useTransform(treatY, (v) => v * 0.5);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (still || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    nx.set((e.clientX - r.left) / r.width - 0.5);
    ny.set((e.clientY - r.top) / r.height - 0.5);
    glowX.set(e.clientX - r.left - 260);
    glowY.set(e.clientY - r.top - 260);
  };
  const onPointerLeave = () => {
    nx.set(0);
    ny.set(0);
    glowX.set(-600);
    glowY.set(-600);
  };

  // Reduced motion: every scroll/pointer channel collapses to 0 (markup stays identical for hydration).
  const z = (v: MotionValue<number> | number) => (reduce ? 0 : v);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative overflow-hidden mesh-cream"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Cursor spotlight — a blurred disc moved with transforms (GPU), not a repainted gradient. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(231,52,55,0.12),transparent_65%)]"
        style={{ x: glowX, y: glowY }}
      />

      <div className="container relative grid items-center gap-12 pb-20 pt-8 md:pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-28">
        {/* ── Copy ── */}
        <motion.div className="lg:col-span-6" style={{ y: z(copyY), opacity: reduce ? 1 : copyOpacity }}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: duration.reveal, ease: easeOut }}
          >
            Indian confectionery craft · since 1914
          </motion.p>
          <h1 id="hero-title" className="mt-6 text-display-xl font-light text-balance">
            <MaskWords
              immediate
              delay={0.15}
              words={["A", "century", "of", { text: "sweet", em: true, className: "font-normal italic text-lotte" }, "craft."]}
            />
          </h1>
          <motion.p
            className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft text-pretty"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: duration.reveal, ease: easeOut, delay: 0.65 }}
          >
            From the Parrys kitchens of 1914 to Lotte Choco Pie — the pie that created a category in India — we make the
            small indulgences a nation shares every day.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } } }}
          >
            {[
              { href: "/brands", label: "Explore Our Brands", cls: "btn-primary", arrow: true },
              { href: "/story", label: "Our Heritage", cls: "btn-ghost", arrow: false },
            ].map((b) => (
              <motion.div
                key={b.href}
                variants={{
                  hidden: { opacity: 0, y: 18, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.reveal, ease: easeOut } },
                }}
              >
                <Magnetic>
                  <Link href={b.href} className={cn(b.cls, "group w-full sm:w-auto")}>
                    {b.label}
                    {b.arrow && (
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </Magnetic>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Showcase ── */}
        <div className="relative [perspective:1200px] lg:col-span-6 lg:col-start-7">
          {/* Ambient bloom behind the crimson card: breathes slowly, drifts against the pointer. */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0" style={{ x: z(ambientX), y: z(ambientY) }}>
            <div
              className={cn(
                "absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(231,52,55,0.35),rgba(231,52,55,0.08)_55%,transparent)] blur-2xl",
                "animate-breathe motion-reduce:animate-none",
                paused && "[animation-play-state:paused]",
              )}
            />
          </motion.div>

          <motion.div style={{ y: z(cardY) }} className="relative">
            <motion.div
              className="mesh-signature grain relative ml-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[2.5rem] shadow-glow will-change-transform sm:aspect-[5/5] lg:aspect-[4/5]"
              style={{ rotateX: z(tiltX), rotateY: z(tiltY) }}
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: duration.hero, ease: easeOut, delay: 0.1 }}
            >
              {/* Oversized brand silhouette as a watermark */}
              <div
                className={cn(
                  "absolute -right-24 -top-24 z-0 h-[26rem] w-[26rem] animate-[spin_120s_linear_infinite] text-white/15 motion-reduce:animate-none",
                  paused && "[animation-play-state:paused]",
                )}
                aria-hidden="true"
              >
                <BrandGlyph filled={false} className="h-full w-full" />
              </div>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={paused ? "Play hero animation" : "Pause hero animation"}
                className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-noir shadow-card backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95 motion-reduce:hidden"
              >
                {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
              </button>
              {/* TODO: Replace with official Lotte India photography (hero: Choco Pie lifestyle shot) */}
              <motion.div style={{ y: z(artY) }} className="absolute inset-0 z-10">
                {/* Interactive 3D Choco Pie (move the pointer, scroll to spin); SVG art if WebGL is unavailable */}
                <LazyHeroScene
                  scrollProgress={scrollYProgress}
                  paused={still}
                  fallback={
                    <div className="grid h-full place-items-center">
                      <PackArt shape="pie" accent="noir" label="Lotte Choco Pie" className="w-[78%] drop-shadow-2xl" />
                    </div>
                  }
                />
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#a8161c]/95 via-[#c41e24]/40 to-transparent p-7 pt-24 text-white">
                <p className="eyebrow !text-white">The flagship</p>
                <p className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
                  Lotte <em className="italic">Choco Pie</em>
                </p>
                <p className="mt-2 max-w-xs text-sm text-white">Fluffy marshmallow, soft biscuit, rich choco.</p>
              </div>
              <span className="absolute left-7 top-7 z-20 font-serif text-[5.5rem] font-light leading-none text-white/20 sm:text-[7rem]">
                1914
              </span>
            </motion.div>
          </motion.div>

          {/* Floating treats: the deepest parallax layer, bobbing gently when idle. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-[38%] z-30 hidden w-20 sm:block lg:-right-10"
            style={{ x: z(treatPX), y: z(treatY) }}
          >
            <div className={cn("animate-float [--float-r:12deg] motion-reduce:animate-none", paused && "[animation-play-state:paused]")}>
              <PackArt shape="toffee" accent="lotte" label="Lotte Eclairs" className="h-20 w-20 drop-shadow-xl" />
            </div>
          </motion.div>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 bottom-[18%] z-30 hidden sm:block lg:-left-14"
            style={{ x: z(treat2X), y: z(treat2Y) }}
          >
            <div className={cn("animate-float [--float-r:-18deg] [animation-delay:-2.5s] motion-reduce:animate-none", paused && "[animation-play-state:paused]")}>
              <BrandGlyph className="h-10 w-10 text-lotte drop-shadow-[0_10px_18px_rgba(231,52,55,0.35)]" />
            </div>
          </motion.div>

          <CoffeeToffeeBadge
            x={z(badgePX)}
            y={z(badgeY)}
            rotate={reduce ? -3 : badgeScrollRotate}
            animateWords={!still}
          />

          <motion.div
            className="absolute -bottom-6 right-6 z-30 flex items-center gap-2.5 rounded-full bg-noir px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lift"
            style={{ x: z(chipPX) }}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: duration.reveal, ease: easeOut, delay: 1.05 }}
          >
            <span className={cn("inline-flex animate-[spin_8s_linear_infinite] motion-reduce:animate-none", paused && "[animation-play-state:paused]")}>
              <BrandGlyph className="h-3 w-3 text-lotte" />
            </span>
            India&apos;s <span className="tabular-nums">No.1</span> Choco Pie
          </motion.div>
        </div>
      </div>

      {/* Scroll-reactive brand marquee: drifts on its own, surges and reverses with scroll speed. */}
      <div className="relative border-y border-noir/10 bg-white/60 py-5 backdrop-blur-sm">
        <VelocityMarquee paused={paused} baseVelocity={2}>
          {marquee.map((m) => (
            <span key={m} className="flex items-center gap-12 pr-12 font-serif text-2xl italic text-noir/80">
              {m}
              <BrandGlyph className="h-3.5 w-3.5 text-lotte" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}

/**
 * Playful "Is it a Coffee or a Toffee?" badge (the Coffy Bite debate, est. 1987).
 * The key word swaps on its own; on hover the toffee wiggles and a call to vote slides in.
 * Links to the Coffy Bite quick-view on the Brands page.
 */
function CoffeeToffeeBadge({
  x,
  y,
  rotate,
  animateWords,
}: {
  x: MotionValue<number> | number;
  y: MotionValue<number> | number;
  rotate: MotionValue<number> | number;
  animateWords: boolean;
}) {
  const [word, setWord] = useState<"Coffee" | "Toffee">("Coffee");
  useEffect(() => {
    if (!animateWords) return;
    const id = window.setInterval(() => setWord((w) => (w === "Coffee" ? "Toffee" : "Coffee")), 2600);
    return () => window.clearInterval(id);
  }, [animateWords]);

  return (
    <motion.div
      className="absolute -left-2 top-10 z-30 hidden sm:block lg:-left-10"
      style={{ x, y, rotate }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: duration.reveal, ease: easeOut, delay: 0.9 }}
    >
      <Link
        href="/brands#toffees"
        className="group block w-52 rounded-2xl bg-white p-4 shadow-lift ring-1 ring-noir/5 transition-[transform,box-shadow] duration-500 ease-editorial hover:-translate-y-1.5 hover:rotate-2 hover:shadow-glow active:scale-[0.97]"
      >
        <span className="sr-only">Is it a Coffee or a Toffee? Explore Coffy Bite.</span>
        <span aria-hidden="true" className="block">
          <span className="block origin-center transition-transform group-hover:animate-wiggle motion-reduce:group-hover:animate-none">
            <PackArt shape="toffee" accent="coffee" label="Coffy Bite" className="mx-auto h-24 w-24" />
          </span>
          <span className="mt-1 flex items-baseline justify-center gap-1 font-serif text-sm italic text-noir">
            Is it a
            <span className="relative inline-grid h-[1.3em] min-w-[3.9em] overflow-hidden text-left not-italic">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={word}
                  className="col-start-1 row-start-1 font-semibold italic text-lotte-deep"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                >
                  {word}?
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <span className="mt-2 flex h-0 items-center justify-center gap-1 overflow-hidden text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-lotte-deep opacity-0 transition-all duration-300 ease-editorial group-hover:h-4 group-hover:opacity-100 group-focus-visible:h-4 group-focus-visible:opacity-100">
            Settle the debate
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
