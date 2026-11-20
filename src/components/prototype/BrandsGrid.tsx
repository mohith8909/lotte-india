"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { PackArt } from "@/components/brand/PackArt";
import { products, type Product } from "@/data/products";

// The six brands the prototype brief calls out, pulled from the verified portfolio data.
const slugs = ["choco-pie-classic", "coffy-bite", "lotte-eclairs", "caramilk", "lacto-king", "pepero-original"];
const featured = slugs.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p));

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

export function BrandsGrid() {
  return (
    <section aria-labelledby="proto-brands-title" className="mesh-ivory py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-proto-cta">Our brands</p>
            <h2 id="proto-brands-title" className="mt-4 font-sans text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1] tracking-[-0.035em] text-proto-cocoa">
              Six reasons India smiles.
            </h2>
          </div>
          <Link href="/brands" className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-proto-cocoa">
            See the full portfolio
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <motion.ul
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: "some" }}
        >
          {featured.map((p) => (
            <motion.li key={p.slug} variants={item}>
              <motion.div
                whileHover={{ y: -10, rotate: -0.6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="group h-full"
              >
                <Link
                  href={`/brands#${p.category}`}
                  className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_1px_0_rgba(59,30,18,0.04),0_18px_40px_-24px_rgba(59,30,18,0.35)] ring-1 ring-proto-cocoa/5 transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-28px_rgba(237,29,36,0.45)]"
                >
                  <div className="relative aspect-[5/4] bg-[radial-gradient(120%_100%_at_50%_0%,#FFFFFF,#F7F2EA)]">
                    <motion.div className="h-full" whileHover={{ scale: 1.08, rotate: -3 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}>
                      <PackArt shape={p.shape} accent={p.accent} label={p.name} className="mx-auto h-full w-auto p-6" />
                    </motion.div>
                    {p.launched && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-proto-cocoa">
                        Since <span className="tabular-nums">{p.launched}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 items-end justify-between gap-4 p-6">
                    <div>
                      <h3 className="font-sans text-xl font-bold tracking-tight text-proto-cocoa">{p.name}</h3>
                      <p className="mt-1 text-sm text-proto-muted">{p.tagline}</p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-proto-sand text-proto-cocoa transition-colors group-hover:bg-proto-cta group-hover:text-white" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
