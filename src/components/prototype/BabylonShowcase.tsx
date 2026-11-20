"use client";

// Babylon.js Confectionery Studio (below the fold).
// Lifecycle: the Babylon chunk is only downloaded once the section nears the viewport
// (IntersectionObserver → dynamic import). The render loop pauses off-screen, and the
// engine + scene are disposed on unmount, so it never competes with the R3F hero canvas.

import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { StudioController, StudioPreset, StudioProduct } from "./babylon/createStudio";

const products: { id: StudioProduct; label: string; note: string }[] = [
  { id: "choco-pie", label: "Choco Pie Box", note: "Glossy carton with the pie that created India's pie category." },
  { id: "pepero", label: "Pepero Pack", note: "Biscuit sticks, dipped almost end to end in chocolate." },
  { id: "coffy-bite", label: "Coffy Bite Jar", note: "A counter jar of the toffee that started a debate in 1987." },
  { id: "caramilk", label: "Caramilk", note: "“The child's first toffee”, since 1982." },
];

const presets: { id: StudioPreset; label: string; swatch: string }[] = [
  { id: "warm-morning", label: "Warm Morning", swatch: "linear-gradient(135deg,#FFE7C7,#F7F2EA)" },
  { id: "diwali-gold", label: "Festive Diwali Gold", swatch: "linear-gradient(135deg,#FFB347,#3B1E12)" },
  { id: "crisp-editorial", label: "Crisp Editorial", swatch: "linear-gradient(135deg,#FFFFFF,#DADDE2)" },
];

type Status = "idle" | "loading" | "ready" | "unsupported";

export function BabylonShowcase() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const studio = useRef<StudioController | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [status, setStatus] = useState<Status>("idle");
  const [product, setProduct] = useState<StudioProduct>("choco-pie");
  const [preset, setPreset] = useState<StudioPreset>("warm-morning");

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
      { rootMargin: "300px 0px" },
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
    import("./babylon/createStudio")
      .then(({ createStudio }) => {
        if (cancelled || !canvas.current || studio.current) return;
        studio.current = createStudio(canvas.current, { reducedMotion: reduce });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("unsupported"));
    return () => {
      cancelled = true;
    };
  }, [status, reduce]);

  // Dispose the engine, scene and GPU resources only when the section unmounts
  // (not on status changes — that would tear down the studio right after creating it).
  useEffect(
    () => () => {
      studio.current?.dispose();
      studio.current = null;
    },
    [],
  );

  // 3) Pause rendering whenever the studio is off-screen.
  useEffect(() => {
    if (status !== "ready" || !section.current) return;
    const io = new IntersectionObserver(([e]) => studio.current?.setActive(Boolean(e?.isIntersecting)), { threshold: 0.01 });
    io.observe(section.current);
    return () => io.disconnect();
  }, [status]);

  const pickProduct = (p: StudioProduct) => {
    setProduct(p);
    studio.current?.setProduct(p);
  };
  const pickPreset = (p: StudioPreset) => {
    setPreset(p);
    studio.current?.setPreset(p);
  };

  const active = products.find((p) => p.id === product)!;
  const dark = preset === "diwali-gold";

  return (
    <section ref={section} id="studio" aria-labelledby="studio-title" className="scroll-mt-24 bg-proto-sand py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta">The confectionery studio</p>
            <h2 id="studio-title" className="mt-4 font-sans text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1] tracking-[-0.035em] text-proto-cocoa">
              Turn it over. <span className="text-proto-red">Light it up.</span>
            </h2>
            <p className="mt-4 max-w-lg text-proto-muted">
              Drag to orbit, or use the controls. Switch the studio lighting to see each pack in a new mood.
            </p>
          </div>
          {/* Product tabs (Motion layoutId) */}
          <div role="tablist" aria-label="Choose a product" className="flex flex-wrap gap-1 rounded-3xl border border-proto-cocoa/10 bg-white/70 p-1">
            {products.map((p) => {
              const on = p.id === product;
              return (
                <button
                  key={p.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="studio-stage"
                  onClick={() => pickProduct(p.id)}
                  className={`relative isolate rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "text-white" : "text-proto-cocoa/75 hover:text-proto-cocoa"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="studio-product-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-proto-cocoa"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* Stage */}
          <div
            id="studio-stage"
            role="tabpanel"
            className="relative overflow-hidden rounded-[2rem] bg-proto-cream shadow-[0_40px_80px_-40px_rgba(59,30,18,0.45)] ring-1 ring-proto-cocoa/5 lg:col-span-9"
          >
            <canvas
              ref={canvas}
              tabIndex={0}
              aria-label={`Interactive 3D model: ${active.label}. Use the arrow keys or the rotate buttons to orbit.`}
              className="block aspect-[4/3] w-full touch-pan-y outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-proto-red/40 sm:aspect-[16/10]"
              data-lenis-prevent
            />
            {status !== "ready" && (
              <div className="absolute inset-0 grid place-items-center bg-proto-cream">
                <p className="flex items-center gap-3 text-sm font-semibold text-proto-muted" role="status">
                  {status === "unsupported" ? (
                    "3D preview isn't available on this device."
                  ) : (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-proto-red border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                      Warming up the studio…
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Overlay controls: single-pointer + keyboard alternatives to dragging (WCAG 2.5.7) */}
            <div className={`absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 ${status === "ready" ? "" : "pointer-events-none opacity-0"}`}>
              <motion.p
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm backdrop-blur ${dark ? "bg-black/40 text-white" : "bg-white/80 text-proto-cocoa"}`}
              >
                <span className="font-semibold">{active.label}.</span> {active.note}
              </motion.p>
              <div className={`flex gap-1 rounded-full p-1 backdrop-blur ${dark ? "bg-black/40" : "bg-white/80"}`}>
                {[
                  { label: "Rotate left", Icon: RotateCcw, fn: () => studio.current?.rotate(-1) },
                  { label: "Rotate right", Icon: RotateCw, fn: () => studio.current?.rotate(1) },
                  { label: "Zoom in", Icon: ZoomIn, fn: () => studio.current?.zoom(-1) },
                  { label: "Zoom out", Icon: ZoomOut, fn: () => studio.current?.zoom(1) },
                  { label: "Reset view", Icon: Maximize2, fn: () => studio.current?.reset() },
                ].map(({ label, Icon, fn }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={fn}
                    aria-label={label}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`grid h-11 w-11 place-items-center rounded-full ${dark ? "text-white hover:bg-white/15" : "text-proto-cocoa hover:bg-proto-cocoa/[0.06]"}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Lighting presets */}
          <fieldset className="flex flex-col gap-3 lg:col-span-3">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-proto-muted">Studio lighting</legend>
            {presets.map((p) => {
              const on = p.id === preset;
              return (
                <motion.label
                  key={p.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-4 transition-shadow has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-proto-red ${on ? "border-proto-red shadow-[0_14px_30px_-18px_rgba(237,29,36,0.7)]" : "border-proto-cocoa/10 hover:shadow-[0_14px_30px_-20px_rgba(59,30,18,0.4)]"}`}
                >
                  <input type="radio" name="studio-preset" value={p.id} checked={on} onChange={() => pickPreset(p.id)} className="sr-only" />
                  <span className="h-10 w-10 shrink-0 rounded-full ring-1 ring-proto-cocoa/10" style={{ background: p.swatch }} aria-hidden="true" />
                  <span className="text-sm font-semibold text-proto-cocoa">{p.label}</span>
                  {on && <motion.span layoutId="preset-dot" className="ml-auto h-2.5 w-2.5 rounded-full bg-proto-red" aria-hidden="true" />}
                </motion.label>
              );
            })}
            <p className="mt-2 text-xs leading-relaxed text-proto-muted">
              Rendered live with Babylon.js — procedural packs and PBR reflections, no images.
            </p>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
