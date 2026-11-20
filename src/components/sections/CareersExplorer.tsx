"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { departments, roles, type DepartmentId } from "@/data/careers";
import { MaskText } from "@/components/ui/Reveal";

type Filter = DepartmentId | "all";
const ease = [0.22, 1, 0.36, 1] as const;

export function CareersExplorer() {
  const [filter, setFilter] = useState<Filter>("all");
  const dept = departments.find((d) => d.id === filter);
  const list = useMemo(() => (filter === "all" ? roles : roles.filter((r) => r.department === filter)), [filter]);

  const tabs = [
    { id: "all" as Filter, label: "All teams", count: roles.length },
    ...departments.map((d) => ({
      id: d.id as Filter,
      label: d.name,
      count: roles.filter((r) => r.department === d.id).length,
    })),
  ];

  return (
    <section id="roles" aria-labelledby="roles-title" className="py-24 md:py-32">
      <div className="container">
        <p className="eyebrow">Our teams</p>
        <h2 id="roles-title" className="mt-4 max-w-3xl text-display-md font-light text-balance">
          <MaskText>Find the team where you&apos;ll <em className="italic text-lotte">do your best work</em>.</MaskText>
        </h2>

        <div className="mt-10">
          <CategoryTabs
            tabs={tabs}
            active={filter}
            onChange={setFilter}
            layoutId="careers-dept-pill"
            label="Filter by department"
            controls="roles-panel"
          />
        </div>

        <div id="roles-panel" role="tabpanel" className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease }}
                className="mesh-signature grain relative overflow-hidden rounded-[2rem] p-8 text-white shadow-glow lg:sticky lg:top-28"
              >
                <div className="relative z-10">
                  <p className="eyebrow !text-white">{dept ? "Team focus" : "Six teams, one table"}</p>
                  <h3 className="mt-4 text-3xl">{dept?.name ?? "Every function matters"}</h3>
                  <p className="mt-3 text-white">
                    {dept?.blurb ??
                      "From the factory floor to the boardroom, every team shapes how India experiences Lotte."}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {(dept?.focus ?? departments.map((d) => d.name)).map((f) => (
                      <li key={f} className="rounded-full border border-white/50 px-3 py-1 text-xs text-white">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.ul layout className="divide-y divide-noir/10 border-y border-noir/10 lg:col-span-8" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((r) => (
                <motion.li
                  key={r.title}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.45, ease }}
                >
                  {/* Illustrative examples only — not live vacancies. TODO: replace with the ATS feed. */}
                  <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lotte-deep">
                        {departments.find((d) => d.id === r.department)?.name}
                      </p>
                      <h3 className="mt-1.5 text-2xl">{r.title}</h3>
                    </div>
                    <span className="self-start rounded-full bg-sand px-3 py-1 text-xs text-ink-soft sm:self-auto">
                      Example role
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-sm text-ink-soft">
              These are examples of roles in each team, not current vacancies. Live openings are posted on the
              Lotte India careers page and LinkedIn.
            </p>
            <a
              href="https://www.lotteindia.com/career-philosophy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5"
            >
              View current openings <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
