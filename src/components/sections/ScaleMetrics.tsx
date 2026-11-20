"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { metrics, type Metric } from "@/data/milestones";
import { cn } from "@/lib/cn";
import { MaskText } from "@/components/ui/Reveal";

function Counter({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(metric.plain ? metric.value : 0);

  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setValue(metric.value);
      return;
    }
    const from = metric.plain ? Math.round(metric.value * 0.9) : 0;
    const controls = animate(from, metric.value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, metric.value, metric.plain]);

  const display = metric.plain ? String(value) : value.toLocaleString("en-IN");
  return (
    <span ref={ref} className="tabular-nums" aria-hidden="true">
      {display}
      <span className="opacity-80">{metric.suffix}</span>
    </span>
  );
}

interface ScaleMetricsProps {
  tone?: "dark" | "light";
  items?: Metric[];
  eyebrow?: string;
  title?: ReactNode;
  intro?: string;
}

export function ScaleMetrics({
  tone = "dark",
  items = metrics,
  eyebrow = "Heritage at national scale",
  title = (
    <>
      From one kitchen to <em className="italic">a million</em> counters.
    </>
  ),
  intro = "Backed by the global Lotte Group, two automated Choco Pie facilities and our own confectionery unit carry Indian-made sweets from Chennai, Rohtak and Nellikuppam to over a million retail outlets.",
}: ScaleMetricsProps) {
  const dark = tone === "dark";
  return (
    <section
      aria-labelledby="scale-title"
      className={cn("relative overflow-hidden py-20 md:py-28", dark ? "mesh-signature grain text-white" : "bg-sand/60")}
    >
      <div className="container relative z-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className={cn("eyebrow", dark && "!text-white")}>{eyebrow}</p>
            <h2 id="scale-title" className="mt-4 text-display-md font-light text-balance">
              <MaskText>{title}</MaskText>
            </h2>
          </div>
          <p className={cn("md:col-span-5 md:col-start-8", dark ? "text-white" : "text-ink-soft")}>
            {intro}
          </p>
        </div>

        <motion.dl
          className={cn(
            "mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:grid-cols-4",
            dark ? "bg-white/25 ring-1 ring-white/25" : "bg-noir/10 ring-1 ring-noir/10",
          )}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        >
          {items.map((m) => (
            <motion.div
              key={m.label}
              className={cn("flex flex-col justify-between gap-6 p-6 sm:p-8", dark ? "bg-lotte-cta/95 backdrop-blur-sm" : "bg-cream")}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <dt className={cn("order-2 text-sm", dark ? "text-white" : "text-ink-soft")}>
                <span className={cn("block font-semibold", dark ? "text-white" : "text-noir")}>{m.label}</span>
                {m.caption}
              </dt>
              <dd className="order-1 font-sans text-4xl font-light tracking-tight sm:text-5xl xl:text-6xl">
                <span className="sr-only">
                  {m.plain ? m.value : m.value.toLocaleString("en-IN")}
                  {m.suffix}
                </span>
                <Counter metric={m} />
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
