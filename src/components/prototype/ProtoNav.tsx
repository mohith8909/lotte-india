"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LotteMark } from "@/components/brand/LotteMark";

const links = [
  { href: "/story", label: "Our Story" },
  { href: "/brands", label: "Our Brands" },
  { href: "/careers", label: "Grow With Lotte" },
  { href: "/investors", label: "Investor Centre" },
];

const spring = { type: "spring", stiffness: 420, damping: 26 } as const;

/** Floating glass navigation for the homepage (Motion owns all of its UI motion). */
export function ProtoNav() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mobile disclosure: Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.nav
        aria-label="Primary"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border border-proto-cocoa/[0.08] bg-[rgba(255,253,249,0.72)] pl-5 pr-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_14px_36px_-20px_rgba(59,30,18,0.45)] backdrop-blur-[14px] backdrop-saturate-150"
      >
        <Link href="/" aria-label="Lotte India — home" className="shrink-0 rounded-full">
          <LotteMark priority />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex" onPointerLeave={() => setHover(null)}>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onPointerEnter={() => setHover(l.href)}
                onFocus={() => setHover(l.href)}
                onBlur={() => setHover(null)}
                className="relative isolate block rounded-full px-4 py-2 text-sm font-medium text-proto-cocoa/75 transition-colors hover:text-proto-cocoa"
              >
                {hover === l.href && (
                  <motion.span
                    layoutId="proto-nav-hover"
                    className="absolute inset-0 -z-10 rounded-full bg-proto-cocoa/[0.06]"
                    transition={spring}
                  />
                )}
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <motion.span whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.95, y: 0 }} transition={spring} className="hidden sm:inline-flex">
            <Link
              href="/faq#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-proto-cta px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(237,29,36,0.8)] transition-colors hover:bg-[#B5121A]"
            >
              Enquiry
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </motion.span>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="proto-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full border border-proto-cocoa/10 bg-white/70 text-proto-cocoa transition active:scale-95 lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="proto-menu"
            ref={panelRef}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto mx-auto mt-2 max-w-7xl origin-top rounded-3xl border border-proto-cocoa/[0.08] bg-[rgba(255,253,249,0.94)] p-3 shadow-[0_24px_50px_-24px_rgba(59,30,18,0.5)] backdrop-blur-[14px] lg:hidden"
          >
            <ul className="grid gap-1">
              {[...links, { href: "/faq#contact", label: "Enquiry" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-semibold text-proto-cocoa hover:bg-proto-cocoa/[0.05]"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
