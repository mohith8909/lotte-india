"use client";

// Babylon.js Confectionery Studio: one product at a time, shot like an advert.
//
// Layout: a full-width stage in a dark chocolate room. The page paints the backdrop (a colour wash per
// lighting preset and the product's name in giant serif type) and the transparent WebGL canvas sits on
// top of it, so the product stands in front of its own name. Around the stage edge: a numbered product
// list, a details strip, the lighting dots and the orbit controls (shown on hover, keyboard focus, and
// always on touch screens, as the single-pointer alternative to dragging).
//
// Lifecycle: Babylon is only downloaded once the section nears the viewport, rendering pauses off-screen,
// and the engine is disposed on unmount.

import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2, Hand, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ProductDrawer } from "@/components/ui/ProductDrawer";
import { products as catalogue, type Product } from "@/data/products";
import type { StudioController, StudioPreset, StudioProduct } from "./babylon/createStudio";

const products: { id: StudioProduct; name: string; slug: string; note: string }[] = [
  { id: "choco-pie", name: "Choco Pie", slug: "choco-pie-classic", note: "Fluffy marshmallow, soft biscuit, rich choco. The pie that created India's pie category." },
  { id: "pepero", name: "Pepero", slug: "pepero-original", note: "Crisp biscuit sticks, dipped almost end to end in chocolate." },
  { id: "coffy-bite", name: "Coffy Bite", slug: "coffy-bite", note: "Rich coffee, creamy toffee, and a debate that started in 1987." },
  { id: "caramilk", name: "Caramilk", slug: "caramilk", note: "Dairy-rich and soft. Fondly remembered as “the child's first toffee”." },
];

const presets: { id: StudioPreset; label: string; swatch: string; dark: boolean; backdrop: string }[] = [
  {
    id: "warm-morning",
    label: "Warm morning",
    swatch: "linear-gradient(135deg,#FFE1B8,#F3E3CB)",
    dark: false,
    backdrop: "radial-gradient(55% 45% at 50% 58%, rgba(255,206,140,0.55), transparent 72%), radial-gradient(130% 105% at 32% 12%, #FFF3E0 0%, #EED8B6 38%, #C99B68 78%, #8E5E35 100%)",
  },
  {
    id: "diwali-gold",
    label: "Diwali gold",
    swatch: "linear-gradient(135deg,#FFB347,#3B1E12)",
    dark: true,
    backdrop: "radial-gradient(48% 42% at 50% 60%, rgba(255,150,50,0.32), transparent 72%), radial-gradient(100% 90% at 50% 38%, #4E210D 0%, #220C05 52%, #080201 100%)",
  },
  {
    id: "crisp-editorial",
    label: "Crisp editorial",
    swatch: "linear-gradient(135deg,#FFFFFF,#D9DCE2)",
    dark: false,
    backdrop: "radial-gradient(50% 40% at 50% 58%, rgba(255,255,255,0.9), transparent 72%), radial-gradient(125% 105% at 50% 12%, #FFFFFF 0%, #EEEFF2 40%, #C6C9D0 80%, #9A9EA8 100%)",
  },
];

type Status = "idle" | "loading" | "ready" | "unsupported";
const ease = [0.22, 1, 0.36, 1] as const;

/** Facts for the details strip, taken from the product data. */
function facts(p: Product | undefined) {
  if (!p) return [];
  const out: string[] = [];
  if (p.launched) out.push(`Since ${p.launched}`);
  if (p.packs?.length) out.push(`Packs of ${p.packs.join(" · ")}`);
  if (p.pricePoints?.length) out.push(p.pricePoints.join(" · "));
  if (out.length < 2) out.push(p.tagline);
  return out;
}

export function BabylonShowcase() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const studio = useRef<StudioController | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [status, setStatus] = useState<Status>("idle");
  const [product, setProduct] = useState<StudioProduct>("choco-pie");
  const [preset, setPreset] = useState<StudioPreset>("warm-morning");
  const [entered, setEntered] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [drawer, setDrawer] = useState<Product | null>(null);

  // 1) Lazy-load Babylon only when the studio approaches the viewport.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStatus((s) => (s === "idle" ? "loading" : s));
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2) Create the engine once loading starts.
  useEffect(() => {
    if (status !== "loading" || !canvas.current) return;
    let cancelled = false;
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) {
      setStatus("unsupported");
      return;
    }
    const rootStyle = getComputedStyle(document.documentElement);
    const serif = `${rootStyle.getPropertyValue("--font-serif").trim() || "Georgia"}, Georgia, serif`;
    const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    const lite = window.matchMedia("(max-width: 767px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    import("./babylon/createStudio")
      .then(({ createStudio }) => {
        if (cancelled || !canvas.current || studio.current) return;
        studio.current = createStudio(canvas.current, { reducedMotion: reduce, lite, serif, sans, onFirstDrag: () => setDragged(true) });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("unsupported"));
    return () => {
      cancelled = true;
    };
  }, [status, reduce]);

  // Dispose only when the section unmounts.
  useEffect(
    () => () => {
      studio.current?.dispose();
      studio.current = null;
    },
    [],
  );

  // 3) Pause rendering off-screen; play the entrance the first time the stage is properly in view.
  useEffect(() => {
    if (status !== "ready" || !stage.current) return;
    const active = new IntersectionObserver(([e]) => studio.current?.setActive(Boolean(e?.isIntersecting)), { threshold: 0.01 });
    active.observe(stage.current);
    const entrance = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        studio.current?.enter();
        setEntered(true);
        entrance.disconnect();
      },
      { threshold: 0.45 },
    );
    entrance.observe(stage.current);
    return () => {
      active.disconnect();
      entrance.disconnect();
    };
  }, [status]);

  const pickProduct = (p: StudioProduct) => {
    setProduct(p);
    studio.current?.setProduct(p);
  };
  const pickPreset = (p: StudioPreset) => {
    setPreset(p);
    studio.current?.setPreset(p);
  };
  const onListKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = products[(i + step + products.length) % products.length]!;
    pickProduct(next.id);
    document.getElementById(`studio-tab-${next.id}`)?.focus();
  };

  const active = products.find((p) => p.id === product)!;
  const data = catalogue.find((p) => p.slug === active.slug);
  const look = presets.find((p) => p.id === preset)!;
  const dark = look.dark;
  const index = products.indexOf(active);
  const ink = dark ? "text-proto-ivory" : "text-proto-cocoa";
  const glass = dark ? "bg-black/35 text-proto-ivory ring-white/10" : "bg-white/70 text-proto-cocoa ring-proto-cocoa/10";
  const showCover = !reduce && !entered;

  return (
    <section
      ref={section}
      id="studio"
      aria-labelledby="studio-title"
      data-nav-theme="dark"
      // Slides up over the hero's pinned stage (its last 100vh), led by a chocolate wave: the hand-off.
      className="relative z-10 scroll-mt-24 bg-proto-cocoa pb-20 pt-28 text-proto-ivory motion-safe:-mt-[100svh] md:pb-28 md:pt-36"
      style={{ backgroundImage: "radial-gradient(70% 40% at 50% 0%, #5C2D15 0%, transparent 70%), linear-gradient(180deg, #3B1E12 0%, #2A1209 60%, #1C0B05 100%)" }}
    >
      {/* Wave crest rising above the section edge */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full h-12 overflow-hidden md:h-16">
        <svg className="wave-drift absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 1200 64" preserveAspectRatio="none">
          <path d="M0 32 C 100 0 200 0 300 32 S 500 64 600 32 S 800 0 900 32 S 1100 64 1200 32 V64 H0 Z" fill="#3B1E12" />
        </svg>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 sm:px-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A7E]">The confectionery studio</p>
          <h2 id="studio-title" className="mt-4 font-serif text-[clamp(2.4rem,5.6vw,5rem)] font-light leading-[0.95] tracking-[-0.03em]">
            Turn it over. <em className="text-[#FF6B5E]">Light it up.</em>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-proto-ivory/70">
          Four Lotte favourites, rendered live in your browser. Drag to turn them, change the light, and look closely.
        </p>
      </div>

      {/* ── Stage ── */}
      <div className="mx-auto mt-10 max-w-[100rem] px-3 sm:px-5 md:mt-14">
        <motion.div
          ref={stage}
          id="studio-stage"
          role="tabpanel"
          aria-labelledby={`studio-tab-${product}`}
          className={`group relative isolate h-[min(78svh,920px)] min-h-[520px] md:h-[min(86svh,920px)] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] ${ink}`}
          initial={false}
          animate={showCover ? { clipPath: "inset(6% 4% 6% 4% round 2rem)" } : { clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
          transition={{ duration: 1.4, ease }}
        >
          {/* Backdrop washes, cross-faded */}
          {presets.map((p) => (
            <div
              key={p.id}
              aria-hidden="true"
              className="absolute inset-0 -z-20 transition-opacity duration-[1200ms] ease-out"
              style={{ background: p.backdrop, opacity: p.id === preset ? 1 : 0 }}
            >
              {p.id === "warm-morning" && (
                // Window-blind light falling across the back wall
                <div
                  className="absolute -inset-x-1/4 -top-1/4 h-[90%] -rotate-12 opacity-60 blur-2xl"
                  style={{ background: "repeating-linear-gradient(100deg, rgba(255,226,180,0.9) 0 46px, transparent 46px 92px)", maskImage: "radial-gradient(60% 60% at 40% 40%, #000, transparent)" }}
                />
              )}
              {p.id === "diwali-gold" && (
                <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(60% 70% at 50% 100%, rgba(255,170,70,0.28), transparent 70%)" }} />
              )}
            </div>
          ))}

          {/* Giant product name behind the model */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={active.id}
                className="-translate-y-[30%] whitespace-nowrap bg-clip-text pr-[0.08em] font-serif text-[clamp(5rem,19vw,19rem)] font-light italic leading-none tracking-[-0.05em] text-transparent"
                style={{ backgroundImage: dark ? "linear-gradient(180deg, rgba(255,196,110,0.38) 0%, rgba(255,140,50,0.12) 60%, rgba(255,140,50,0) 100%)" : "linear-gradient(180deg, rgba(59,30,18,0.22) 0%, rgba(59,30,18,0.08) 60%, rgba(59,30,18,0) 100%)" }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: "35%", filter: "blur(12px)" }}
                animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-25%", filter: "blur(12px)" }}
                transition={{ duration: 0.9, ease }}
              >
                {active.name}
              </motion.p>
            </AnimatePresence>
          </div>

          <canvas
            ref={canvas}
            tabIndex={0}
            aria-label={`Interactive 3D model: ${active.name}. Use the arrow keys or the orbit buttons to turn it.`}
            className="absolute inset-0 block h-full w-full touch-pan-y outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-proto-red/50"
          />

          {/* Photographic finish: lens vignette and fine film grain over the render */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{ background: "radial-gradient(85% 75% at 50% 48%, transparent 55%, rgba(20,8,3,0.42) 100%)", opacity: dark ? 0.9 : 0.55 }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Entrance: the stage opens out of the dark */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[#140804]"
            initial={false}
            animate={{ opacity: showCover ? 1 : 0 }}
            transition={{ duration: 1.1, ease, delay: showCover ? 0 : 0.15 }}
          />

          {status !== "ready" && (
            <div className="absolute inset-0 grid place-items-center">
              <p className={`flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold ring-1 backdrop-blur ${glass}`} role="status">
                {status === "unsupported" ? (
                  "3D preview isn't available on this device."
                ) : (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-proto-red border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                    Lighting the studio…
                  </>
                )}
              </p>
            </div>
          )}

          {/* Product list: numbered, left edge (top row on phones) */}
          <div
            role="tablist"
            aria-label="Choose a product"
            aria-orientation="vertical"
            className={`absolute inset-x-0 top-0 flex gap-1 overflow-x-auto transition-opacity duration-700 ${showCover ? "opacity-0" : ""} px-4 pt-4 [scrollbar-width:none] md:inset-x-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-2 md:overflow-visible md:p-0 lg:left-10`}
          >
            {products.map((p, i) => {
              const on = p.id === product;
              return (
                <button
                  key={p.id}
                  id={`studio-tab-${p.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="studio-stage"
                  tabIndex={on ? 0 : -1}
                  onClick={() => pickProduct(p.id)}
                  onKeyDown={(e) => onListKey(e, i)}
                  className={`group/tab relative flex shrink-0 items-baseline gap-2.5 rounded-full px-3 py-2 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-proto-red md:px-0 md:py-1.5 ${on ? "opacity-100" : "opacity-55 hover:opacity-90"}`}
                >
                  <span className="font-sans text-[11px] font-semibold tabular-nums tracking-[0.12em]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative font-serif text-lg leading-none md:text-2xl">
                    {p.name}
                    {on && (
                      <motion.span
                        layoutId="studio-active-line"
                        className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-proto-red"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orbit controls: hover / keyboard focus on desktop, always visible on touch */}
          <div
            className={`absolute right-4 top-16 flex gap-1 rounded-full p-1 ring-1 backdrop-blur transition-opacity duration-300 md:right-6 md:top-6 ${glass} ${status === "ready" ? "opacity-0 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {[
              { label: "Turn left", Icon: RotateCcw, fn: () => studio.current?.rotate(-1) },
              { label: "Turn right", Icon: RotateCw, fn: () => studio.current?.rotate(1) },
              { label: "Zoom in", Icon: ZoomIn, fn: () => studio.current?.zoom(-1) },
              { label: "Zoom out", Icon: ZoomOut, fn: () => studio.current?.zoom(1) },
              { label: "Reset view", Icon: Maximize2, fn: () => studio.current?.reset() },
            ].map(({ label, Icon, fn }) => (
              <button
                key={label}
                type="button"
                onClick={fn}
                aria-label={label}
                title={label}
                className={`grid h-10 w-10 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-proto-red ${dark ? "hover:bg-white/15" : "hover:bg-proto-cocoa/[0.07]"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>

          {/* Drag hint: fades after the first drag */}
          <AnimatePresence>
            {status === "ready" && !dragged && (
              <motion.p
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-8 hidden -translate-x-1/2 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70 md:flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.span animate={reduce ? undefined : { x: [-6, 6, -6] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                  <Hand className="h-4 w-4" />
                </motion.span>
                Drag to turn
              </motion.p>
            )}
          </AnimatePresence>

          {/* Bottom bar: details (left) and lighting (right) */}
          <div className={`absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 transition-opacity duration-700 sm:flex-row sm:items-end sm:justify-between md:p-6 lg:p-10 ${showCover ? "opacity-0" : ""}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="max-w-md"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">
                  {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                </p>
                <p className="mt-2 hidden text-sm leading-relaxed opacity-85 sm:block md:text-[15px]">{active.note}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {facts(data).map((f) => (
                    <span key={f} className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur ${glass}`}>
                      {f}
                    </span>
                  ))}
                  {data && (
                    <button
                      type="button"
                      onClick={() => setDrawer(data)}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full bg-proto-cta px-3.5 py-1 text-xs font-semibold text-white outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Pack details <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <fieldset className="flex items-center gap-3 self-end">
              <legend className="sr-only">Studio lighting</legend>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70" aria-hidden="true">
                {look.label}
              </span>
              <div className={`flex gap-1.5 rounded-full p-1.5 ring-1 backdrop-blur ${glass}`}>
                {presets.map((p) => {
                  const on = p.id === preset;
                  return (
                    <label key={p.id} title={p.label} className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-proto-red">
                      <input type="radio" name="studio-preset" value={p.id} checked={on} onChange={() => pickPreset(p.id)} className="sr-only" aria-label={p.label} />
                      {on && (
                        <motion.span
                          layoutId="studio-preset-ring"
                          className="absolute inset-0 rounded-full ring-2 ring-proto-red"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: p.swatch }} aria-hidden="true" />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </motion.div>
        <p className="mt-4 px-2 text-xs text-proto-ivory/50">Modelled and lit in real time with Babylon.js. No photographs.</p>
      </div>

      <ProductDrawer product={drawer} onClose={() => setDrawer(null)} />
    </section>
  );
}
