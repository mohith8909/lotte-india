import type { Metadata } from "next";
import { BadgeCheck, Building2, Factory, MapPin, Phone, Truck } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { ScaleMetrics } from "@/components/sections/ScaleMetrics";
import { Reveal, RevealItem, Stagger } from "@/components/ui/Reveal";
import { facilities, offices, otherCertifications, telHref } from "@/data/company";
import { reachMetrics } from "@/data/milestones";

export const metadata: Metadata = {
  title: "Manufacturing & Reach",
  description:
    "Two fully automated Choco Pie facilities in Chennai and Rohtak, our own confectionery unit in Nellikuppam, and a network of 26 C&F agencies and 2,000+ distributors reaching over a million retail outlets.",
};

export default function ReachPage() {
  const regional = offices.filter((o) => o.kind !== "Factory");
  const factories = offices.filter((o) => o.kind === "Factory");

  return (
    <>
      <PageHero
        eyebrow="Manufacturing & reach"
        title={
          <>
            Made in India, <em className="italic text-lotte">shared across it</em>.
          </>
        }
        intro="Fully automated Choco Pie lines, a heritage confectionery unit and a nationwide distribution network bring Lotte to over a million storefronts."
        mesh="mesh-blush"
      />

      {/* Facilities */}
      <section aria-labelledby="facilities-title" className="py-24 md:py-32">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Where we make</p>
            <h2 id="facilities-title" className="mt-4 max-w-3xl text-display-md font-light text-balance">
              Three facilities of our own, <em className="italic text-lotte">three partner units</em>.
            </h2>
          </Reveal>
          <Stagger as="ul" className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {facilities.map((f) => (
              <RevealItem
                as="li"
                key={f.name}
                className={
                  f.kind === "own"
                    ? "flex flex-col rounded-[2rem] bg-alabaster p-7 shadow-card ring-1 ring-noir/5"
                    : "flex flex-col rounded-[2rem] border border-dashed border-noir/20 p-7"
                }
              >
                <Factory className="h-7 w-7 text-lotte" aria-hidden="true" />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {f.kind === "own" ? "Own facility" : "Outsourced"}
                </p>
                <h3 className="mt-1 text-2xl">{f.name}</h3>
                <p className="mt-2 flex-1 text-sm text-ink-soft">{f.detail}</p>
                {f.certifications.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${f.name} certifications`}>
                    {f.certifications.map((c) => (
                      <li
                        key={c}
                        className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-noir"
                      >
                        <BadgeCheck className="h-3.5 w-3.5 text-lotte-deep" aria-hidden="true" />
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </RevealItem>
            ))}
          </Stagger>
          <p className="mt-6 text-sm text-ink-muted">
            Also certified: {otherCertifications.join(" · ")}.
          </p>
        </div>
      </section>

      <ScaleMetrics
        items={reachMetrics}
        eyebrow="Distribution network"
        title={
          <>
            From four regions to <em className="italic">a million</em> outlets.
          </>
        }
        intro="Four regional offices and 26 carrying & forwarding agencies supply more than 2,000 distributors, who reach over a million retail outlets across India."
      />

      {/* Office & factory directory */}
      <section aria-labelledby="directory-title" className="py-24 md:py-32">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Directory</p>
            <h2 id="directory-title" className="mt-4 text-display-md font-light">
              Offices <em className="italic text-lotte">&amp; factories</em>.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            {[
              { title: "Head & regional offices", Icon: Building2, list: regional },
              { title: "Factories", Icon: Truck, list: factories },
            ].map(({ title, Icon, list }) => (
              <div key={title}>
                <h3 className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  <Icon className="h-4 w-4 text-lotte" aria-hidden="true" /> {title}
                </h3>
                <ul className="mt-5 divide-y divide-noir/10 border-y border-noir/10">
                  {list.map((o) => (
                    <li key={o.kind + o.city + o.address} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
                      <p className="font-serif text-xl">
                        {o.city}
                        <span className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          {o.region === "Head Office" ? "Head office" : `${o.region} · ${o.kind}`}
                        </span>
                      </p>
                      <div className="text-sm text-ink-soft">
                        <address className="flex gap-2 not-italic">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                          {o.address}
                        </address>
                        <a
                          href={telHref(o.phone)}
                          className="mt-2 inline-flex min-h-[24px] items-center gap-2 font-semibold text-noir underline-offset-4 hover:text-lotte-deep hover:underline"
                        >
                          <Phone className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                          <span className="tabular-nums">{o.phone}</span>
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
