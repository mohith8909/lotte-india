"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Candy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Choice = "coffee" | "toffee";

// TODO: Replace the seeded tally with a live endpoint (e.g. /api/poll) backed by a datastore.
const SEED: Record<Choice, number> = { coffee: 4812, toffee: 5236 };
const STORAGE_KEY = "lotte.coffybite.vote";

/** "Is it a Coffee or a Toffee?" — an interactive two-way poll toggle for Coffy Bite. */
export function CoffyPoll() {
  const [vote, setVote] = useState<Choice | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "coffee" || saved === "toffee") setVote(saved);
    } catch {
      /* storage unavailable — poll still works for this visit */
    }
  }, []);

  const cast = (choice: Choice) => {
    setVote(choice);
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
  };

  const tally = {
    coffee: SEED.coffee + (vote === "coffee" ? 1 : 0),
    toffee: SEED.toffee + (vote === "toffee" ? 1 : 0),
  };
  const total = tally.coffee + tally.toffee;
  const pct = (c: Choice) => Math.round((tally[c] / total) * 100);

  const options: { id: Choice; label: string; Icon: typeof Coffee }[] = [
    { id: "coffee", label: "It's a Coffee", Icon: Coffee },
    { id: "toffee", label: "It's a Toffee", Icon: Candy },
  ];

  return (
    <section aria-labelledby="coffy-poll" className="grain relative overflow-hidden rounded-3xl bg-noir p-6 text-cream">
      <div className="relative z-10">
        <p className="eyebrow !text-lotte-light">The great debate</p>
        <h3 id="coffy-poll" className="mt-2 font-serif text-2xl italic">
          Is it a Coffee or a Toffee?
        </h3>

        <div role="group" aria-label="Cast your vote" className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-cream/10 p-1">
          {options.map(({ id, label, Icon }) => {
            const selected = vote === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => cast(id)}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-semibold transition-colors",
                  selected ? "text-noir" : "text-cream/75 hover:text-cream",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="coffy-poll-pill"
                    className="absolute inset-0 rounded-full bg-lotte-light"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {vote && (
            <motion.div
              key="results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-5" aria-live="polite">
                {options.map(({ id }) => (
                  <div key={id}>
                    <div className="mb-1.5 flex justify-between text-xs uppercase tracking-[0.18em] text-cream/70">
                      <span>{id}</span>
                      <span className="tabular-nums text-cream">{pct(id)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cream/10">
                      <motion.div
                        className={cn("h-full rounded-full", id === "coffee" ? "bg-lotte" : "bg-blush")}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct(id)}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-xs text-cream/55">
                  {/* TODO: Show the real count once the poll is backed by an API. */}
                  Sample results — live voting coming soon. Your pick is saved on this device.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
