"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LotteMark } from "@/components/brand/LotteMark";
import { Magnetic } from "@/components/ui/Magnetic";
import { cn } from "@/lib/cn";
import { easeOut, spring } from "@/lib/motion";
import { useDialog } from "@/lib/useDialog";

export const navLinks = [
  { href: "/story", label: "Our Story" },
  { href: "/brands", label: "Brands" },
  { href: "/reach", label: "Manufacturing & Reach" },
  { href: "/faq", label: "FAQ / Contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const drawerRef = useDialog<HTMLDivElement>(open, () => setOpen(false));

  // The capsule stays put; once the page moves it lifts with a deeper shadow.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Wrapper is click-through so the transparent margin around the capsule never blocks content. */}
      <header className="pointer-events-none sticky top-0 z-50 pt-3 sm:pt-4">
        <div className="container">
          <motion.nav
            aria-label="Primary"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: easeOut }}
            className={cn(
              "pointer-events-auto mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-full border pl-5 pr-2.5",
              "bg-[rgba(250,248,245,0.72)] backdrop-blur-[14px] backdrop-saturate-150",
              "transition-[box-shadow,border-color,background-color] duration-500 ease-editorial",
              scrolled
                ? "border-noir/[0.09] bg-[rgba(250,248,245,0.82)] shadow-pill-lg"
                : "border-noir/[0.06] shadow-pill",
            )}
          >
            <Link href="/" aria-label="Lotte India — home" className="shrink-0 rounded-full">
              <LotteMark priority className="[&_img:first-child]:h-9 [&_img:first-child]:w-9" />
            </Link>

            <ul className="hidden items-center gap-0.5 lg:flex" onPointerLeave={() => setHovered(null)}>
              {navLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onPointerEnter={() => setHovered(link.href)}
                      onFocus={() => setHovered(link.href)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        "relative isolate flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                        active ? "text-noir" : "text-ink-soft hover:text-noir",
                      )}
                    >
                      {/* Current page: a raised white pill that glides between routes. */}
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_2px_rgba(22,22,22,0.06),0_4px_14px_-6px_rgba(22,22,22,0.18)] ring-1 ring-noir/[0.06]"
                          transition={spring.ui}
                        />
                      )}
                      {/* Hover: a soft tint that follows the pointer across links. */}
                      {hovered === link.href && !active && (
                        <motion.span
                          layoutId="nav-hover"
                          className="absolute inset-0 -z-10 rounded-full bg-noir/[0.05]"
                          transition={spring.ui}
                        />
                      )}
                      {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lotte" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex">
                <Magnetic strength={0.2}>
                  <Link href="/faq#contact" className="btn-primary group !px-5 !py-2.5">
                    Enquiry
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Magnetic>
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-noir/10 bg-white/70 transition hover:bg-white active:scale-95 lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </motion.nav>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap position:fixed children. */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-noir/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-menu"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="mesh-noir grain absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col p-6 text-cream"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <LotteMark tone="light" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 place-items-center rounded-full border border-cream/20"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <motion.ul
                className="relative z-10 mt-14 space-y-2"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
              >
                {[{ href: "/", label: "Home" }, ...navLinks].map((link) => (
                  <motion.li
                    key={link.href}
                    variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }}
                  >
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={cn(
                        "block border-b border-cream/10 py-4 font-serif text-3xl",
                        pathname === link.href ? "italic text-lotte-light" : "text-cream",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
              <Link href="/faq#contact" className="btn-light relative z-10 mt-auto">
                Enquiry <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
