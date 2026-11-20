"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { faqGroups, type FaqGroup } from "@/data/faq";
import { cn } from "@/lib/cn";

interface FaqAccordionProps {
  groups?: FaqGroup[];
  /** Compact teaser: no group headings, used on the homepage. */
  compact?: boolean;
}

/**
 * Accessible FAQ accordion (button + region pattern). Several answers can be open at once.
 * Deep links work: `/faq#veg-mark` opens that answer, `/faq#packaging` scrolls to its group.
 */
export function FaqAccordion({ groups = faqGroups, compact = false }: FaqAccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  // Keep heading levels sequential: group titles are h3 on /faq; compact teasers have none.
  const Question = compact ? "h3" : "h4";

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (groups.some((g) => g.items.some((i) => i.id === id))) setOpen(new Set([id]));
  }, [groups]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <div key={g.id} id={compact ? undefined : g.id}>
          {!compact && <h3 className="eyebrow mb-4">{g.title}</h3>}
          <ul className="divide-y divide-noir/10 overflow-hidden rounded-[1.75rem] bg-alabaster shadow-card ring-1 ring-noir/5">
            {g.items.map((item) => {
              const isOpen = open.has(item.id);
              const panelId = `faq-panel-${item.id}`;
              const buttonId = `faq-button-${item.id}`;
              return (
                <li key={item.id} id={compact ? undefined : item.id}>
                  <Question className="font-sans">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-base font-semibold transition hover:bg-cream sm:px-8"
                    >
                      <span className="text-pretty">{item.q}</span>
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition",
                          isOpen ? "border-noir bg-noir text-alabaster" : "border-noir/15",
                        )}
                        aria-hidden="true"
                      >
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </Question>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="max-w-prose px-6 pb-6 text-ink-soft sm:px-8">
                          <p className="leading-relaxed">{item.a}</p>
                          {item.link && (
                            <Link
                              href={item.link.href}
                              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lotte-deep underline-offset-4 hover:underline"
                            >
                              {item.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
