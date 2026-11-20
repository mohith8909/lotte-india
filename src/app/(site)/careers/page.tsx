import type { Metadata } from "next";
import { CareersExplorer } from "@/components/sections/CareersExplorer";
import { CultureBand } from "@/components/sections/CultureBand";
import { PageHero } from "@/components/sections/PageHero";
import { ArrowUpRight, Mail } from "lucide-react";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { careersContact } from "@/data/company";
import { lifeAtLotte } from "@/data/careers";

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

      {/* Life at Lotte — lotteindia.com/life-at-lotte.html & career-philosophy.html */}
      <section aria-labelledby="life-title" className="bg-sand/50 py-24 md:py-32">
        <div className="container grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Life at Lotte</p>
            <h2 id="life-title" className="mt-4 text-display-md font-light text-balance">
              A truly great company <em className="italic text-lotte">to work for</em>.
            </h2>
            <p className="mt-6 text-ink-soft">{lifeAtLotte.philosophy}</p>
            <p className="mt-4 text-sm text-ink-muted">{lifeAtLotte.equalOpportunity}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={careersContact.portal} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Apply on our careers portal <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a href={`mailto:${careersContact.email}`} className="btn-ghost">
                <Mail className="h-4 w-4" aria-hidden="true" /> {careersContact.email}
              </a>
            </div>
          </Reveal>
          <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {lifeAtLotte.benefits.map((b) => (
              <RevealItem as="li" key={b.title} className="rounded-3xl bg-alabaster p-7 shadow-card ring-1 ring-noir/5">
                <h3 className="text-2xl">{b.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{b.body}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CareersExplorer />
      <CultureBand />
    </>
  );
}
