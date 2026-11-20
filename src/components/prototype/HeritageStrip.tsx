"use client";

import { motion } from "motion/react";
import { values } from "@/data/careers";

const ease = [0.16, 1, 0.3, 1] as const;

/** Legacy (Parrys → Lotte Wellfood) and the three culture pillars from lotteindia.com. */
export function HeritageStrip() {
  return (
    <section aria-labelledby="proto-heritage-title" className="relative overflow-hidden bg-proto-cocoa py-24 text-white md:py-32">
      {/* Concentric "circle of joy" arcs echoing the hero */}
      <svg aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] opacity-40" viewBox="0 0 640 640">
        {[300, 240, 180].map((r, i) => (
          <circle key={r} cx="320" cy="320" r={r} fill="none" stroke="#ED1D24" strokeWidth={2 - i * 0.4} strokeDasharray={`${r * 3.2} ${r * 3}`} />
        ))}
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.9, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A8E]">Heritage & values</p>
          <h2 id="proto-heritage-title" className="mt-4 font-sans text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1] tracking-[-0.035em]">
            Since 1914, one sweet thread.
          </h2>
          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/15 pt-8">
            <div>
              <dt className="text-sm text-white/80">Parrys Confectionery</dt>
              <dd className="order-first font-sans text-5xl font-extrabold tabular-nums tracking-tight">1914</dd>
            </div>
            <div>
              <dt className="text-sm text-white/80">Joins Lotte Wellfood</dt>
              <dd className="order-first font-sans text-5xl font-extrabold tabular-nums tracking-tight">2004</dd>
            </div>
          </dl>
          <p className="mt-6 max-w-md text-white/85">
            Lotte India Corporation was formed when Lotte Wellfood, Korea took over Parrys Confectionery from the
            Murugappa Group — uniting a century of Indian craft with the Lotte Group.
          </p>
        </motion.div>

        <motion.ol
          className="grid gap-4 lg:col-span-6 lg:col-start-7"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: "some" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        >
          {values.map((v, i) => (
            <motion.li
              key={v.title}
              variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease } } }}
              whileHover={{ x: 6 }}
              className="flex gap-6 rounded-3xl bg-white/[0.06] p-7 ring-1 ring-white/10"
            >
              <span className="font-sans text-sm font-bold tabular-nums text-[#FF8A8E]">0{i + 1}</span>
              <div>
                <h3 className="font-sans text-2xl font-bold tracking-tight">{v.title}</h3>
                <p className="mt-1 text-sm font-semibold text-white/85">{v.tagline}</p>
                <p className="mt-2 text-sm text-white/75">{v.body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
