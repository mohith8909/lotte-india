"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Package, RotateCcw, RotateCw, ShoppingBag, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PackArt } from "@/components/brand/PackArt";
import { LazyProductStage } from "@/components/three/Lazy3D";
import { hasStage } from "@/components/three/stage";
import { CoffyPoll } from "@/components/ui/CoffyPoll";
import { categories, retailers, type Product } from "@/data/products";
import { accentStyles, cn } from "@/lib/cn";
import { useDialog } from "@/lib/useDialog";

interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
}

/** FSS Regulations 2011 vegetarian symbol: green circle within a green square. Always paired with a text label. */
function VegMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" rx="2" fill="#fff" stroke="#1B7F3B" strokeWidth="2" />
      <circle cx="10" cy="10" r="5" fill="#1B7F3B" />
    </svg>
  );
}

/** Slide-over quick-view drawer with tasting notes, pack formats and (for Coffy Bite) a poll. */
export function ProductDrawer({ product, onClose }: ProductDrawerProps) {
  const open = product !== null;
  const panelRef = useDialog<HTMLDivElement>(open, onClose);
  // 45° steps for the 3D turntable — the single-pointer/keyboard alternative to dragging (WCAG 2.5.7).
  const [turn, setTurn] = useState(0);
  useEffect(() => setTurn(0), [product?.slug]);

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-noir/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto bg-cream shadow-lift outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className={cn("relative shrink-0 grain", accentStyles[product.accent].mesh)}>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close product details"
                className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-noir shadow-card transition hover:bg-noir hover:text-cream"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* TODO: Replace with official Lotte India photography */}
              {hasStage(product) ? (
                <div className="relative z-10 h-72 w-full sm:h-80">
                  <div
                    role="img"
                    aria-label={`3D model of ${product.name}`}
                    className="h-full w-full cursor-grab active:cursor-grabbing"
                  >
                  <LazyProductStage
                    product={product}
                    turn={turn}
                    fallback={
                      <PackArt
                        shape={product.shape}
                        accent={product.accent}
                        label={product.name}
                        className="mx-auto h-full w-auto py-4"
                      />
                    }
                  />
                  </div>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-alabaster/90 p-1 shadow-card backdrop-blur">
                    <button
                      type="button"
                      onClick={() => setTurn((t) => t - 1)}
                      aria-label={`Rotate ${product.name} left`}
                      className="grid h-11 w-11 place-items-center rounded-full text-noir transition hover:bg-noir hover:text-alabaster"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="px-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Drag or rotate
                    </span>
                    <button
                      type="button"
                      onClick={() => setTurn((t) => t + 1)}
                      aria-label={`Rotate ${product.name} right`}
                      className="grid h-11 w-11 place-items-center rounded-full text-noir transition hover:bg-noir hover:text-alabaster"
                    >
                      <RotateCw className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                <PackArt
                  shape={product.shape}
                  accent={product.accent}
                  label={product.name}
                  className="relative z-10 mx-auto h-64 w-64 py-4 sm:h-72 sm:w-72"
                />
              )}
            </div>

            <div className="flex-1 space-y-8 px-6 pb-10 pt-8 sm:px-10">
              <header>
                <p className="eyebrow">{categories.find((c) => c.id === product.category)?.label}</p>
                <h2 id="drawer-title" className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">
                  {product.name}
                </h2>
                <p className="mt-2 font-serif text-xl italic text-lotte-deep">{product.tagline}</p>
                <p className="mt-5 text-pretty leading-relaxed text-ink-soft">{product.description}</p>
              </header>

              {product.variants && (
                <div>
                  <h3 className="eyebrow !text-ink-muted">Variants</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <li key={v} className="rounded-full border border-noir/15 px-4 py-1.5 text-sm">
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(product.packs || product.pricePoints) && (
                <dl className="grid gap-6 sm:grid-cols-2">
                  {product.packs && (
                    <div>
                      <dt className="eyebrow !text-ink-muted">Pack sizes</dt>
                      <dd className="mt-3 flex flex-wrap gap-2">
                        {product.packs.map((n) => (
                          <span key={n} className="rounded-full bg-sand px-3 py-1 text-sm tabular-nums">
                            {n} pcs
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {product.pricePoints && (
                    <div>
                      <dt className="eyebrow !text-ink-muted">Price points</dt>
                      <dd className="mt-3 flex flex-wrap gap-2">
                        {product.pricePoints.map((n) => (
                          <span key={n} className="rounded-full bg-sand px-3 py-1 text-sm tabular-nums">
                            {n}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-alabaster p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-sans text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-lotte" aria-hidden="true" /> Highlights
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                    {product.highlights.map((n) => (
                      <li key={n} className="flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", accentStyles[product.accent].dot)} aria-hidden="true" />
                        {n}
                      </li>
                    ))}
                  </ul>
                  {product.launched && (
                    <p className="mt-4 border-t hairline pt-3 text-sm text-ink-soft">
                      Launched <span className="font-semibold tabular-nums text-noir">{product.launched}</span>
                    </p>
                  )}
                </div>
                <div className="rounded-2xl bg-alabaster p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-sans text-sm font-semibold">
                    <Package className="h-4 w-4 text-lotte" aria-hidden="true" /> Packaging marks
                  </h3>
                  {product.vegetarian ? (
                    <p className="mt-3 flex items-center gap-2.5 text-sm text-ink-soft">
                      <VegMark />
                      <span>
                        <span className="font-semibold text-noir">Vegetarian</span> — green mark on pack
                      </span>
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-ink-soft">
                      Check the pack for the green (veg) or red/brown (non-veg) symbol.
                    </p>
                  )}
                  <Link
                    href="/faq#packaging"
                    onClick={onClose}
                    className="mt-3 inline-block text-sm font-semibold text-lotte-deep underline-offset-4 hover:underline"
                  >
                    What the marks mean
                  </Link>
                </div>
              </div>

              {product.category === "pies" && (
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-sm font-semibold">
                    <ShoppingBag className="h-4 w-4 text-lotte" aria-hidden="true" /> Where to buy
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {retailers.map((r) => (
                      <li key={r.name}>
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-noir/15 px-4 text-sm font-semibold transition hover:border-lotte hover:text-lotte-deep"
                        >
                          {r.name} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.copyTodo && (
                // TODO: Official copy needed — the current lotteindia.com page has no text for this brand.
                <p className="rounded-xl border border-dashed border-noir/20 px-4 py-3 text-xs text-ink-muted">
                  Full product story coming soon.
                </p>
              )}

              {product.hasPoll && <CoffyPoll />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
