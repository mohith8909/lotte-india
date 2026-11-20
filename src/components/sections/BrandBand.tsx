"use client";

import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { VelocityMarquee } from "@/components/ui/VelocityMarquee";

// Phrases from lotteindia.com: the Choco Pie tagline, the Coffy Bite debate and the culture pillars.
const rowA = ["Love and Lotte", "India's No.1 Choco Pie", "Since 1914"];
const rowB = ["Is it a Coffee or a Toffee?", "Appreciate", "Connect", "Excel"];

/** Two counter-drifting rows of oversized type that surge with scroll velocity. */
export function BrandBand() {
  return (
    <section aria-label="Lotte India in a few words" className="overflow-hidden bg-white py-16 md:py-24">
      <VelocityMarquee baseVelocity={-1.6}>
        {rowA.map((t) => (
          <span key={t} className="flex items-center gap-10 pr-10 font-serif text-[clamp(3rem,9vw,8.5rem)] font-light leading-none tracking-tight text-noir">
            {t}
            <BrandGlyph className="h-[0.35em] w-[0.35em] text-lotte" />
          </span>
        ))}
      </VelocityMarquee>
      <VelocityMarquee baseVelocity={1.6} className="mt-4">
        {rowB.map((t) => (
          <span
            key={t}
            className="flex items-center gap-10 pr-10 font-serif text-[clamp(3rem,9vw,8.5rem)] font-light italic leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_#E73437]"
          >
            {t}
            <BrandGlyph filled={false} className="h-[0.35em] w-[0.35em] text-lotte" />
          </span>
        ))}
      </VelocityMarquee>
      {/* The marquee is decorative (aria-hidden); give assistive tech the same words once. */}
      <p className="sr-only">
        {rowA.join(". ")}. {rowB.join(". ")}.
      </p>
    </section>
  );
}
