import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MaskText, Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { values } from "@/data/careers";

export function CultureBand() {
  return (
    <section aria-labelledby="culture-title" className="mesh-signature grain relative overflow-hidden py-24 text-white md:py-32">
      <div className="container relative z-10 grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow !text-white">Grow with Lotte</p>
          <h2 id="culture-title" className="mt-4 text-display-md font-light text-balance">
            <MaskText>Appreciate. Connect. <em className="italic">Excel.</em></MaskText>
          </h2>
          <p className="mt-6 max-w-md text-white">
            Join the teams who make, move and market India&apos;s favourite treats — with the reach of a global
            group and the warmth of a family business.
          </p>
          <Link href="/careers" className="btn-light mt-10">
            Explore careers <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
        <Stagger as="ul" className="grid gap-4 sm:grid-cols-3 lg:col-span-7 lg:col-start-6 lg:grid-cols-1">
          {values.map((v, i) => (
            <RevealItem
              as="li"
              key={v.title}
              className="flex flex-col gap-3 rounded-3xl bg-white p-7 text-noir shadow-lift lg:flex-row lg:items-baseline lg:gap-10"
            >
              <span className="font-sans text-sm tabular-nums text-lotte-deep">0{i + 1}</span>
              <div className="lg:w-56 lg:shrink-0">
                <h3 className="text-3xl">{v.title}</h3>
                <p className="mt-1 font-serif text-sm italic text-lotte-deep">{v.tagline}</p>
              </div>
              <p className="text-sm text-ink-soft">{v.body}</p>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
