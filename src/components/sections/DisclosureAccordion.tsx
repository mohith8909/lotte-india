"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { disclosureGroups } from "@/data/disclosures";
import { cn } from "@/lib/cn";
import { MaskText } from "@/components/ui/Reveal";

export function DisclosureAccordion() {
  const [open, setOpen] = useState<string | null>(disclosureGroups[0]?.id ?? null);

  return (
    <section id="disclosures" aria-labelledby="disclosures-title" className="py-24 md:py-32">
      <div className="container grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">Governance & disclosures</p>
          <h2 id="disclosures-title" className="mt-4 text-display-md font-light text-balance">
            <MaskText>Transparent by <em className="italic text-lotte">design</em>.</MaskText>
          </h2>
          <p className="mt-6 text-ink-soft">
            Statutory filings, governance documents and policies, organised for shareholders, regulators and partners.
          </p>
        </div>

        <div className="lg:col-span-8">
          <ul className="divide-y divide-noir/10 overflow-hidden rounded-[2rem] bg-alabaster shadow-card ring-1 ring-noir/5">
            {disclosureGroups.map((g) => {
              const isOpen = open === g.id;
              const panelId = `disc-${g.id}`;
              return (
                <li key={g.id}>
                  <h3 className="font-sans">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : g.id)}
                      className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left transition hover:bg-cream sm:px-8"
                    >
                      <span>
                        <span className="block font-serif text-2xl">{g.title}</span>
                        <span className="mt-1 block text-sm text-ink-soft">{g.summary}</span>
                      </span>
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition",
                          isOpen ? "border-noir bg-noir text-cream" : "border-noir/15",
                        )}
                      >
                        {isOpen ? <Minus className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 sm:px-8">
                          <table className="w-full text-left text-sm">
                            <caption className="sr-only">{g.title} documents</caption>
                            <thead>
                              <tr className="border-b border-noir/10 text-xs uppercase tracking-[0.14em] text-ink-muted">
                                <th scope="col" className="py-3 font-semibold">Document</th>
                                <th scope="col" className="hidden py-3 font-semibold sm:table-cell">Period</th>
                                <th scope="col" className="py-3 text-right font-semibold">
                                  <span className="sr-only">Action</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.items.map((d) => (
                                <tr key={d.title + d.period} className="border-b border-noir/5 last:border-0">
                                  <td className="py-4 pr-4">
                                    <span className="block text-noir">{d.title}</span>
                                    <span className="text-xs text-ink-muted sm:hidden">{d.period}</span>
                                  </td>
                                  <td className="hidden py-4 tabular-nums text-ink-soft sm:table-cell">{d.period}</td>
                                  <td className="py-4 text-right">
                                    {d.href ? (
                                      <a
                                        href={d.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-noir/15 px-3 py-1.5 text-xs font-semibold transition hover:border-lotte-cta hover:bg-lotte-cta hover:text-cream"
                                        aria-label={`Open ${d.title} ${d.period} (${d.format}, opens in a new tab)`}
                                      >
                                        {d.format === "PDF" ? (
                                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        ) : (
                                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                        )}
                                        {d.format}
                                      </a>
                                    ) : (
                                      // TODO: Link the document once Lotte India publishes it.
                                      <span className="text-xs text-ink-muted">Coming soon</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
