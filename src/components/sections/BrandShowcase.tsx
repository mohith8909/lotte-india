"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Plus, Vote } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PackArt } from "@/components/brand/PackArt";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { ProductDrawer } from "@/components/ui/ProductDrawer";
import { TiltCard } from "@/components/ui/TiltCard";
import { categories, products, type Category, type Product } from "@/data/products";
import { accentStyles, cn } from "@/lib/cn";
import { MaskText, Reveal } from "@/components/ui/Reveal";

type FilterId = Category["id"];

interface BrandShowcaseProps {
  /** Show a "view full portfolio" link and trim to the first N products when filtering "All". */
  limit?: number;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: string;
  /** Read `#pies` / `#chocolates` / `#toffees` / `#candies` from the URL to pre-select a category. */
  syncHash?: boolean;
}

export function BrandShowcase({
  limit,
  eyebrow = "The Portfolio",
  title = (
    <>
      Brands India <em className="italic text-lotte">reaches for</em>.
    </>
  ),
  intro = "Pies, toffees, biscuit sticks and gums — each one crafted to turn an ordinary moment into a small celebration.",
  syncHash = false,
}: BrandShowcaseProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (!syncHash) return;
    const apply = () => {
      const hash = window.location.hash.replace("#", "");
      if (categories.some((c) => c.id === hash)) setFilter(hash as FilterId);
    };
    apply();
    // Next <Link> changes the hash with history.pushState, which does not fire `hashchange`.
    // Re-read the hash after any in-page link click and on back/forward as well.
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href*="#"]')) window.setTimeout(apply, 50);
    };
    window.addEventListener("hashchange", apply);
    window.addEventListener("popstate", apply);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", apply);
      window.removeEventListener("popstate", apply);
      document.removeEventListener("click", onClick);
    };
  }, [syncHash]);

  const changeFilter = (id: FilterId) => {
    setFilter(id);
    // Keep the URL shareable: /brands#toffees opens with that category selected.
    if (syncHash) window.history.replaceState(null, "", id === "all" ? window.location.pathname : `#${id}`);
  };

  const visible = useMemo(() => {
    const list = filter === "all" ? products : products.filter((p) => p.category === filter);
    return limit && filter === "all" ? list.slice(0, limit) : list;
  }, [filter, limit]);

  const tabs = categories.map((c) => ({
    ...c,
    count: c.id === "all" ? products.length : products.filter((p) => p.category === c.id).length,
  }));

  return (
    <section aria-labelledby="portfolio-title" className="relative py-24 md:py-32">
      {/* Scroll targets so /brands#pies etc. land on the portfolio instead of the page top. */}
      {syncHash &&
        categories
          .filter((c) => c.id !== "all")
          .map((c) => <span key={c.id} id={c.id} className="absolute top-16" aria-hidden="true" />)}
      <div className="container">
        <div className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="portfolio-title" className="mt-4 text-display-md font-light text-balance">
              <MaskText>{title}</MaskText>
            </h2>
            <p className="mt-5 max-w-xl text-ink-soft text-pretty">{intro}</p>
          </div>
          <CategoryTabs
            tabs={tabs}
            active={filter}
            onChange={changeFilter}
            layoutId={limit ? "home-category-pill" : "brands-category-pill"}
            label="Filter products by category"
            controls="product-grid"
          />
        </div>

        <LayoutGroup>
          <motion.ul
            id="product-grid"
            role="tabpanel"
            aria-live="polite"
            layout
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((product, i) => (
                <motion.li
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 6) * 0.04 }}
                >
                  <Reveal delay={(i % 4) * 0.08} className="h-full">
                    <TiltCard>
                      <ProductCard product={product} onOpen={() => setSelected(product)} />
                    </TiltCard>
                  </Reveal>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>

        {limit && (
          <div className="mt-14 flex justify-center">
            <Link href="/brands" className="btn-ghost group">
              View the full portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      <ProductDrawer product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const style = accentStyles[product.accent];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-alabaster text-left shadow-card ring-1 ring-noir/5 transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-lift"
    >
      <div className={cn("grain relative aspect-[5/4] overflow-hidden", style.mesh)}>
        {/* TODO: Replace with official Lotte India photography */}
        <PackArt
          shape={product.shape}
          accent={product.accent}
          label={product.name}
          className="relative z-10 mx-auto h-full w-auto p-4 transition-transform duration-700 ease-editorial group-hover:-translate-y-2 group-hover:scale-[1.08] group-hover:-rotate-3"
        />
        {product.hasPoll && (
          <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-noir px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream">
            <Vote className="h-3 w-3" aria-hidden="true" /> Poll
          </span>
        )}
        {product.featured && !product.hasPoll && (
          <span className="absolute left-4 top-4 z-20 rounded-full bg-lotte-cta px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream">
            Icon
          </span>
        )}
      </div>
      <div className="flex flex-1 items-end justify-between gap-4 p-6">
        <div>
          <h3 className="text-2xl font-medium leading-tight">{product.name}</h3>
          <p className="mt-1.5 text-sm text-ink-soft">{product.tagline}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-noir/15 transition-all duration-300 group-hover:rotate-90 group-hover:border-noir group-hover:bg-noir group-hover:text-cream">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">View details for {product.name}</span>
        </span>
      </div>
    </button>
  );
}
