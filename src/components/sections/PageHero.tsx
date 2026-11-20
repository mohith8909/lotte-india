import type { ReactNode } from "react";
import { MaskText, Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  mesh?: "mesh-cream" | "mesh-lotte" | "mesh-crimson" | "mesh-blush";
  aside?: ReactNode;
}

export function PageHero({ eyebrow, title, intro, mesh = "mesh-cream", aside }: PageHeroProps) {
  return (
    <section className={cn("grain relative overflow-hidden", mesh)}>
      <div className="container relative z-10 grid gap-10 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-8">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-display-lg font-light text-balance">
            <MaskText immediate delay={0.15}>{title}</MaskText>
          </h1>
        </Reveal>
        <Reveal delay={0.15} className="lg:col-span-4">
          <p className="text-lg leading-relaxed text-ink-soft text-pretty">{intro}</p>
          {aside}
        </Reveal>
      </div>
    </section>
  );
}
