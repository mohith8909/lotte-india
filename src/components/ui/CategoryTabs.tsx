"use client";

import { motion } from "framer-motion";
import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

interface Tab<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface CategoryTabsProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Unique per instance so multiple tab bars on a page animate independently. */
  layoutId: string;
  label: string;
  tone?: "light" | "dark";
  controls?: string;
}

/** Pill tab bar with a shared-element (`layoutId`) highlight and arrow-key navigation. */
export function CategoryTabs<T extends string>({
  tabs,
  active,
  onChange,
  layoutId,
  label,
  tone = "light",
  controls,
}: CategoryTabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    onChange(tab.id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "no-scrollbar -mx-1 flex max-w-full gap-1 self-start overflow-x-auto rounded-full p-1 lg:flex-wrap lg:overflow-visible lg:rounded-[1.6rem]",
        tone === "light" ? "bg-sand/70 ring-1 ring-noir/5" : "bg-cream/5 ring-1 ring-cream/10",
      )}
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={controls}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 sm:px-5",
              selected
                ? "text-cream"
                : tone === "light"
                  ? "text-ink-soft hover:text-noir"
                  : "text-cream/60 hover:text-cream",
            )}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className={cn("absolute inset-0 rounded-full", tone === "light" ? "bg-noir" : "bg-lotte")}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.label}
              {typeof tab.count === "number" && (
                <span className={cn("tabular-nums text-[0.7rem]", selected ? "text-cream/70" : "opacity-60")}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
