"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { eras, milestones } from "@/data/milestones";
import { cn } from "@/lib/cn";
import { MaskText } from "@/components/ui/Reveal";

const ease = [0.22, 1, 0.36, 1] as const;

interface HeritageTimelineProps {
  showLink?: boolean;
}

/** Interactive chronological timeline: year rail + animated detail panel. */
export function HeritageTimeline({ showLink = false }: HeritageTimelineProps) {
  const [index, setIndex] = useState(0);
  const active = milestones[index]!;
  const progress = milestones.length > 1 ? index / (milestones.length - 1) : 1;
  const go = (delta: number) => setIndex((i) => Math.min(milestones.length - 1, Math.max(0, i + delta)));
  const rail = useRef<HTMLOListElement>(null);

  // On narrow screens the year rail scrolls sideways: keep the active year in view.
  // (Scroll the rail itself rather than scrollIntoView, which would also scroll the page.)
  useEffect(() => {
    const el = rail.current;
    const item = el?.children[index] as HTMLElement | undefined;
    if (!el || !item || el.scrollWidth <= el.clientWidth) return;
    const target = item.offsetLeft - el.clientWidth / 2 + item.offsetWidth / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
  }, [index]);

  return (
    <section aria-labelledby="timeline-title" className="py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Heritage timeline</p>
            <h2 id="timeline-title" className="mt-4 text-display-md font-light text-balance">
              <MaskText>Over a hundred years, <em className="italic text-lotte">one sweet thread</em>.</MaskText>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-disabled={index === 0}
              aria-label="Previous milestone"
              className="grid h-12 w-12 place-items-center rounded-full border border-noir/15 transition hover:bg-noir hover:text-cream aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-noir"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-disabled={index === milestones.length - 1}
              aria-label="Next milestone"
              className="grid h-12 w-12 place-items-center rounded-full border border-noir/15 transition hover:bg-noir hover:text-cream aria-disabled:cursor-not-allowed aria-disabled:opacity-30 aria-disabled:hover:bg-transparent aria-disabled:hover:text-noir"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Year rail */}
        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-[11px] h-px bg-noir/10" aria-hidden="true" />
          <motion.div
            className="absolute left-0 top-[11px] h-px origin-left bg-lotte"
            style={{ right: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.7, ease }}
            aria-hidden="true"
          />
          <ol ref={rail} className="no-scrollbar relative flex gap-6 overflow-x-auto pb-2 sm:justify-between sm:gap-2">
            {milestones.map((m, i) => {
              const isActive = i === index;
              const passed = i <= index;
              return (
                <li key={m.year + m.title} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`${m.year}: ${m.title}`}
                    className="group flex flex-col items-start gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "grid h-[23px] w-[23px] place-items-center rounded-full border transition-colors duration-500",
                        passed ? "border-lotte bg-cream" : "border-noir/20 bg-cream",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-all duration-500",
                          isActive ? "scale-125 bg-lotte" : passed ? "bg-lotte/60" : "bg-noir/20",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "font-serif text-lg transition-colors",
                        isActive ? "italic text-noir" : "text-ink-muted group-hover:text-noir",
                      )}
                    >
                      {m.year}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Detail panel */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="mesh-signature grain relative min-h-[320px] overflow-hidden rounded-[2rem] p-8 text-white shadow-glow sm:p-12 lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                className="relative z-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease }}
                aria-live="polite"
              >
                <p className="eyebrow !text-white">{eras.find((e) => e.id === active.era)?.label}</p>
                <p className="mt-6 font-serif text-6xl font-light leading-none sm:text-8xl">{active.year}</p>
                <h3 className="mt-6 text-3xl font-normal sm:text-4xl">{active.title}</h3>
                <p className="mt-4 max-w-xl text-white text-pretty">{active.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-[2rem] bg-alabaster p-8 shadow-card lg:col-span-4">
            <div>
              <p className="eyebrow !text-ink-muted">Chapter</p>
              <p className="mt-3 font-sans text-5xl font-light tabular-nums">
                {String(index + 1).padStart(2, "0")}
                <span className="text-ink-muted">/{String(milestones.length).padStart(2, "0")}</span>
              </p>
            </div>
            <ul className="space-y-2">
              {eras.map((e) => {
                const on = e.id === active.era;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(milestones.findIndex((m) => m.era === e.id))}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition",
                        on ? "bg-noir text-cream" : "text-ink-soft hover:bg-sand",
                      )}
                    >
                      {e.label}
                      <span className="text-xs tabular-nums opacity-60">
                        {milestones.filter((m) => m.era === e.id).length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {showLink && (
              <Link href="/story" className="btn-ghost w-full">
                Read our full story
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
