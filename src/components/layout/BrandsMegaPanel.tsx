"use client";

// Brands mega-menu panel (wide screens). It grows out of the menu pill: four category tiles with pack
// art, a featured Choco Pie card with "Where to buy", and a link to the full portfolio.
// Open/close, hover intent and keyboard handling live in SiteNav; this file is the panel itself.

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { forwardRef, type KeyboardEventHandler, type PointerEventHandler } from "react";
import { PackArt } from "@/components/brand/PackArt";
import { categories, products, retailers } from "@/data/products";
import { easeOut } from "@/lib/motion";

const tiles = categories
  .filter((c) => c.id !== "all")
  .map((c) => {
    const items = products.filter((p) => p.category === c.id);
    return {
      id: c.id,
      label: c.label,
      count: items.length,
      names: items.slice(0, 3).map((p) => p.name.replace(/^Lotte\s+/i, "")),
      lead: items[0]!,
    };
  });

const featured = products.find((p) => p.slug === "choco-pie-classic")!;

interface BrandsMegaPanelProps {
  id: string;
  labelledBy: string;
  /** Called when a link inside is followed, so the menu closes. */
  onNavigate: () => void;
  onPointerEnter: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } } };

export const BrandsMegaPanel = forwardRef<HTMLDivElement, BrandsMegaPanelProps>(function BrandsMegaPanel(
  { id, labelledBy, onNavigate, onPointerEnter, onPointerLeave, onKeyDown },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.985, transition: { duration: 0.16 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{ transformOrigin: "top center" }}
      className="pointer-events-auto absolute inset-x-0 top-full z-10 mx-auto mt-3 w-[min(60rem,calc(100vw-2.5rem))] rounded-[1.75rem] border border-noir/[0.08] bg-[rgba(250,248,245,0.97)] p-3 text-noir shadow-[0_40px_80px_-32px_rgba(22,22,22,0.45)] backdrop-blur-xl"
    >
      <div className="grid grid-cols-[1.45fr_1fr] gap-3">
        {/* Categories */}
        <motion.ul
          className="grid grid-cols-2 gap-1.5"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }}
        >
          {tiles.map((t) => (
            <motion.li key={t.id} variants={item}>
              <Link
                href={`/brands#${t.id}`}
                onClick={onNavigate}
                className="group flex h-full items-center gap-4 rounded-2xl p-3 outline-none transition-[background-color,box-shadow] duration-300 hover:bg-white hover:shadow-card focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-lotte/50"
              >
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-sand/80">
                  <PackArt
                    shape={t.lead.shape}
                    accent={t.lead.accent}
                    label={t.lead.name}
                    className="h-16 w-16 transition-transform duration-500 ease-editorial group-hover:-rotate-3 group-hover:scale-110"
                  />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {t.label}
                    <ArrowRight
                      className="h-3.5 w-3.5 -translate-x-1 text-lotte opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {t.count} {t.count === 1 ? "brand" : "brands"}
                  </span>
                  <span className="mt-1.5 block truncate text-sm text-ink-soft">{t.names.join(" · ")}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* Featured: Choco Pie */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          className="mesh-signature grain relative overflow-hidden rounded-2xl text-white"
        >
          <PackArt
            shape="pie"
            accent="noir"
            label={featured.name}
            className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 rotate-[-12deg] opacity-95 drop-shadow-2xl"
          />
          <div className="relative z-10 flex h-full flex-col p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
              Featured · since {featured.launched}
            </p>
            <p className="mt-2 font-sans text-2xl font-bold tracking-[-0.02em]">{featured.name}</p>
            <p className="mt-1 max-w-[13rem] text-sm text-white/85">India&apos;s No.1 Choco Pie — {featured.tagline.toLowerCase()}.</p>
            <Link
              href="/brands#pies"
              onClick={onNavigate}
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold underline-offset-4 hover:underline"
            >
              Explore the pies <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <div className="mt-auto pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Where to buy</p>
              <ul className="mt-2 flex max-w-[15rem] flex-wrap gap-1.5">
                {retailers.map((r) => (
                  <li key={r.name}>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-white/15 px-3 text-xs font-semibold backdrop-blur transition hover:bg-white hover:text-lotte-deep"
                    >
                      {r.name} <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-noir/[0.06] px-3 pb-1 pt-3 text-sm">
        <span className="text-ink-muted">{products.length} brands across four categories</span>
        <Link
          href="/brands"
          onClick={onNavigate}
          className="group inline-flex items-center gap-1.5 font-semibold text-lotte-deep underline-offset-4 hover:underline"
        >
          View all brands
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
});
