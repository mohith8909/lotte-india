import type { Metadata } from "next";
import { CareersExplorer } from "@/components/sections/CareersExplorer";
import { CultureBand } from "@/components/sections/CultureBand";
import { PageHero } from "@/components/sections/PageHero";
import { RevealItem, Stagger } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Careers — Grow With Lotte",
  description:
    "Build your career with Lotte India across sales, manufacturing, marketing, R&D, supply chain and corporate functions.",
};

const perks = [
  { stat: "6", label: "Departments to grow across" },
  { stat: "3", label: "Core hubs in India" },
  { stat: "1914", label: "A legacy you join" },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Grow with Lotte"
        title={
          <>
            Make the moments <em className="italic text-lotte">India remembers</em>.
          </>
        }
        intro="We're a century-old confectioner with a start-up's appetite. Bring your craft — we'll bring the global stage of the Lotte Group."
        mesh="mesh-crimson"
      />

      <section aria-label="At a glance" className="border-b hairline">
        <Stagger as="dl" className="container grid grid-cols-1 divide-y divide-noir/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {perks.map((p) => (
            <RevealItem key={p.label} className="flex flex-col gap-2 py-10 sm:px-8 sm:first:pl-0">
              <dt className="text-sm text-ink-soft">{p.label}</dt>
              <dd className="order-first font-sans text-5xl font-light tabular-nums">{p.stat}</dd>
            </RevealItem>
          ))}
        </Stagger>
      </section>

      <CareersExplorer />
      <CultureBand />
    </>
  );
}
