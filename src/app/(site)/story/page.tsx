import type { Metadata } from "next";
import { Factory, Globe2, MapPin, Newspaper } from "lucide-react";
import { HeritageTimeline } from "@/components/sections/HeritageTimeline";
import { PageHero } from "@/components/sections/PageHero";
import { ScaleMetrics } from "@/components/sections/ScaleMetrics";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { coreValues, csr, groupStory, managementPrinciples, mission, pressCoverage, valueCreation } from "@/data/company";
import { hubs, milestones } from "@/data/milestones";

export const metadata: Metadata = {
  title: "Our Story — Heritage & Milestones",
  description:
    "From Parrys Confectionery in 1914 to Lotte Wellfood in 2004 — Lotte India's milestones, mission, values and CSR.",
};

const pillars = [
  {
    Icon: Factory,
    title: "Parrys roots",
    body: "Our story begins in 1914, when Parrys Confectionery was born as part of EID Parry.",
  },
  {
    Icon: Globe2,
    title: "Lotte Group backing",
    body: "Since 2004 we have been part of Lotte Wellfood, Korea — a member of the Lotte Group and its 80+ affiliates.",
  },
  {
    Icon: MapPin,
    title: "Made in India",
    body: "Automated Choco Pie lines in Chennai and Rohtak and our own confectionery unit in Nellikuppam supply over a million retail outlets.",
  },
];

export default function StoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Heritage & milestones"
        title={
          <>
            Since 1914, we have been <em className="italic text-lotte">making moments</em>.
          </>
        }
        intro="A story that begins in the Parrys kitchens of South India and continues today as part of Lotte Wellfood and the Lotte Group, founded as a confectionery company in 1948."
      />

      <section aria-labelledby="pillars-title" className="py-24">
        <div className="container">
          <h2 id="pillars-title" className="sr-only">
            What defines us
          </h2>
          <Stagger as="ul" className="grid gap-5 md:grid-cols-3">
            {pillars.map(({ Icon, title, body }) => (
              <RevealItem as="li" key={title} className="rounded-[2rem] bg-alabaster p-8 shadow-card ring-1 ring-noir/5">
                <Icon className="h-7 w-7 text-lotte" aria-hidden="true" />
                <h3 className="mt-6 text-3xl">{title}</h3>
                <p className="mt-3 text-ink-soft">{body}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>


      {/* Vision, mission & values — lotteindia.com/vision-mission.html & management-principles.html */}
      <section id="values" aria-labelledby="values-title" className="bg-sand/50 py-24 md:py-32">
        <div className="container grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Our mission</p>
            <h2 id="values-title" className="mt-4 text-display-md font-light text-balance">
              {mission.replace(/\.$/, "")}
              <span className="text-lotte">.</span>
            </h2>
            {/* TODO: Add the separate Vision statement once confirmed — the live page shows only the mission. */}
          </Reveal>
          <div className="space-y-12 lg:col-span-6 lg:col-start-7">
            <div>
              <h3 className="eyebrow !text-ink-muted">Core values</h3>
              <Stagger as="ul" className="mt-5 grid grid-cols-2 gap-3">
                {coreValues.map((v) => (
                  <RevealItem as="li" key={v} className="rounded-2xl bg-alabaster p-5 font-serif text-2xl shadow-card ring-1 ring-noir/5">
                    {v}
                  </RevealItem>
                ))}
              </Stagger>
            </div>
            <div>
              <h3 className="eyebrow !text-ink-muted">Management principles</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {managementPrinciples.map((p) => (
                  <li key={p} className="rounded-full border border-noir/15 px-4 py-2 text-sm">
                    {p}
                  </li>
                ))}
              </ul>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {valueCreation.map((v) => (
                  <li key={v.title}>
                    <p className="font-semibold">{v.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{v.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lotte Group — lotteindia.com/about-us.html */}
      <section aria-labelledby="group-title" className="py-24">
        <div className="container grid gap-10 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Lotte Group</p>
            <h2 id="group-title" className="mt-4 text-display-md font-light">
              Global roots, <em className="italic text-lotte">since 1948</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-4 text-ink-soft">
            <p>{groupStory.lotteGroup}</p>
            <p>{groupStory.wellfood}</p>
            <p className="font-semibold text-noir">{groupStory.ambition}</p>
            <ul aria-label="Lotte Group markets" className="flex flex-wrap gap-2 pt-2">
              {groupStory.markets.map((m) => (
                <li key={m} className="rounded-full border border-noir/15 px-3 py-1 text-sm text-noir">
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <ScaleMetrics />
      <HeritageTimeline />

      {/* Full chronological archive with stagger reveals */}
      <section aria-labelledby="archive-title" className="bg-sand/50 py-24 md:py-32">
        <div className="container">
          <Reveal>
            <p className="eyebrow">The archive</p>
            <h2 id="archive-title" className="mt-4 text-display-md font-light">
              Every chapter, <em className="italic text-lotte">in order</em>.
            </h2>
          </Reveal>
          <ScrollLine className="mt-14">
          <Stagger as="ol" className="relative space-y-4">
            {milestones.map((m, i) => (
              <RevealItem
                as="li"
                key={m.year + m.title}
                className={`relative pl-10 md:w-1/2 md:pl-0 ${i % 2 === 0 ? "md:pr-14" : "md:ml-auto md:pl-14"}`}
              >
                <span
                  className={`absolute left-0 top-8 h-[15px] w-[15px] rounded-full border-2 border-lotte bg-cream ${
                    i % 2 === 0 ? "md:left-auto md:-right-[7.5px]" : "md:-left-[7.5px]"
                  }`}
                  aria-hidden="true"
                />
                <article className="rounded-3xl bg-cream p-7 shadow-card ring-1 ring-noir/5">
                  <p className="font-serif text-4xl font-light italic text-lotte">{m.year}</p>
                  <h3 className="mt-3 text-2xl">{m.title}</h3>
                  <p className="mt-2 text-ink-soft">{m.body}</p>
                </article>
              </RevealItem>
            ))}
          </Stagger>
          </ScrollLine>
        </div>
      </section>

      <section aria-labelledby="hubs-title" className="py-24 md:py-32">
        <div className="container">
          <p className="eyebrow">Where we make</p>
          <h2 id="hubs-title" className="mt-4 text-display-md font-light">
            Three hubs, <em className="italic text-lotte">one standard</em>.
          </h2>
          <Stagger as="ul" className="mt-12 grid gap-5 md:grid-cols-3">
            {hubs.map((h, i) => (
              <RevealItem
                as="li"
                key={h.city}
                className={`grain relative overflow-hidden rounded-[2rem] p-8 ${["mesh-signature text-white", "mesh-noir text-white", "bg-sand"][i]}`}
              >
                {/* TODO: Replace with official Lotte India photography of each facility */}
                <div className="relative z-10 flex min-h-[220px] flex-col justify-between">
                  <span className="font-sans text-sm tabular-nums opacity-60">0{i + 1}</span>
                  <div>
                    <h3 className="text-4xl">{h.city}</h3>
                    <p className="mt-2 text-sm">
                      {h.state} — {h.role}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CSR — lotteindia.com/csr.html */}
      <section aria-labelledby="csr-title" data-nav-theme="dark" className="mesh-noir grain relative overflow-hidden py-24 text-alabaster md:py-32">
        <div className="container relative z-10 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow !text-lotte-light">Corporate social responsibility</p>
            <h2 id="csr-title" className="mt-4 text-display-md font-light text-balance">{csr.name}</h2>
            <p className="mt-6 text-alabaster/75">{csr.summary}</p>
            <p className="mt-4 text-sm text-alabaster/60">
              With {csr.partner} · Launched {csr.launched}
            </p>
            <p className="mt-4 text-sm text-alabaster/60">{csr.frameworks}</p>
          </Reveal>
          <Stagger as="ol" className="grid gap-4 lg:col-span-6 lg:col-start-7">
            {csr.pillars.map((p, i) => (
              <RevealItem as="li" key={p.title} className="rounded-3xl bg-alabaster/5 p-6 ring-1 ring-alabaster/10">
                <span className="font-sans text-sm tabular-nums text-lotte-light">0{i + 1}</span>
                <h3 className="mt-2 text-2xl">{p.title}</h3>
                <p className="mt-1 text-sm text-alabaster/70">{p.body}</p>
              </RevealItem>
            ))}
          </Stagger>
          <div className="lg:col-span-12">
            <h3 className="eyebrow !text-lotte-light">Earlier community work</h3>
            <Stagger as="ol" className="mt-5 grid gap-px overflow-hidden rounded-3xl bg-alabaster/10 sm:grid-cols-2 lg:grid-cols-3">
              {csr.history.map((h) => (
                <RevealItem as="li" key={h.date} className="bg-[#1b1b1b] p-6">
                  <p className="text-sm font-semibold tabular-nums text-lotte-light">{h.date}</p>
                  <p className="mt-1 text-alabaster/80">{h.body}</p>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* News & events — lotteindia.com/news-events.html */}
      <section id="news" aria-labelledby="news-title" className="py-24 md:py-32">
        <div className="container grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">In the news · {pressCoverage.period}</p>
            <h2 id="news-title" className="mt-4 text-display-md font-light">
              Coffy Bite is <em className="italic text-lotte">back</em>.
            </h2>
            <p className="mt-6 text-ink-soft">
              The relaunch of our cult coffee toffee made headlines in print and online across India.
            </p>
            <h3 className="eyebrow mt-10 !text-ink-muted">In print</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {pressCoverage.print.map((p) => (
                <li key={p} className="rounded-full border border-noir/15 px-3 py-1 text-sm">
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Stagger as="ul" className="grid gap-4 lg:col-span-6 lg:col-start-7">
            {pressCoverage.online.map((a) => (
              <RevealItem as="li" key={a.outlet} className="rounded-3xl bg-alabaster p-7 shadow-card ring-1 ring-noir/5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lotte-deep">
                  <Newspaper className="h-4 w-4" aria-hidden="true" /> {a.outlet}
                </p>
                <p className="mt-3 font-serif text-2xl leading-snug">“{a.title}”</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
