"use client";

// The one menu bar for every page (homepage included).
//  • Transparent at the very top; once you scroll it compacts into a frosted pill.
//  • Hides while you scroll down and springs back when you scroll up (never during the homepage story,
//    where its progress line is the reader's map). Keyboard focus always brings it back.
//  • Switches to light text over dark sections (marked with data-nav-theme="dark").
//  • A thin progress line along the pill: homepage story chapters, or reading progress elsewhere.
//  • Wide screens: "Brands" opens a mega-menu (hover with intent, or the chevron / ArrowDown by keyboard).
//  • Below 1280px: a full-screen menu that opens in a circle from the menu button; swipe down to close.

import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { LotteMark } from "@/components/brand/LotteMark";
import { BrandsMegaPanel } from "@/components/layout/BrandsMegaPanel";
import { Magnetic } from "@/components/ui/Magnetic";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { offices, telHref } from "@/data/company";
import { categories } from "@/data/products";
import { cn } from "@/lib/cn";
import { easeInOut, easeOut, spring, stagger } from "@/lib/motion";
import { navStory } from "@/lib/navStory";
import { useDialog } from "@/lib/useDialog";

export const navLinks = [
  { href: "/story", label: "Our Story" },
  { href: "/brands", label: "Brands" },
  { href: "/reach", label: "Manufacturing & Reach" },
  { href: "/careers", label: "Careers" },
  { href: "/investors", label: "Investors" },
] as const;

const menuLinks = [{ href: "/", label: "Home" }, ...navLinks, { href: "/faq", label: "FAQ & Contact" }];
const brandChips = categories.filter((c) => c.id !== "all").map((c) => ({ href: `/brands#${c.id}`, label: c.label }));
const headOffice = offices.find((o) => o.kind === "Head office")!;

/** Height of the line (px from the top of the viewport) used to decide what the bar is sitting over. */
const PROBE_Y = 40;

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const reduce = useReducedMotion() ?? false;
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drag = useDragControls();
  const dialogRef = useDialog<HTMLDivElement>(open, () => setOpen(false));
  const chapter = useSyncExternalStore(navStory.onLabel, () => navStory.get().label, () => null);

  // ── Brands mega-menu ──
  const [mega, setMega] = useState(false);
  const megaItem = useRef<HTMLLIElement>(null);
  const megaPanel = useRef<HTMLDivElement>(null);
  const megaToggle = useRef<HTMLButtonElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusFirstOnOpen = useRef(false);
  const clearMegaTimer = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    megaTimer.current = null;
  };
  const openMega = (focusFirst = false) => {
    clearMegaTimer();
    focusFirstOnOpen.current = focusFirst;
    setMega(true);
  };
  const closeMega = (returnFocus = false) => {
    clearMegaTimer();
    setMega(false);
    if (returnFocus) megaToggle.current?.focus();
  };
  // Hover intent: a short pause before opening (no flicker when the pointer just passes over) and a
  // grace period before closing (so you can travel from the link down into the panel).
  const megaHoverIn = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearMegaTimer();
    megaTimer.current = setTimeout(() => setMega(true), 90);
  };
  const megaHoverOut = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearMegaTimer();
    megaTimer.current = setTimeout(() => setMega(false), 220);
  };
  // Arrow keys move between the panel's links.
  const megaKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    const links = Array.from(megaPanel.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    e.preventDefault();
    const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? links.length - 1 : forward ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
    links[next]?.focus();
  };

  useEffect(() => {
    if (!mega) return;
    if (focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      requestAnimationFrame(() => megaPanel.current?.querySelector<HTMLAnchorElement>("a")?.focus());
    }
    const inside = (t: EventTarget | null) =>
      t instanceof Node && Boolean(megaItem.current?.contains(t) || megaPanel.current?.contains(t));
    const onPointerDown = (e: globalThis.PointerEvent) => {
      if (!inside(e.target)) closeMega();
    };
    const onFocusIn = (e: FocusEvent) => {
      if (!inside(e.target)) closeMega();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeMega(inside(document.activeElement));
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKey);
    };
    // closeMega only touches refs and setState, so it is stable in effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mega]);
  useEffect(() => clearMegaTimer, []);

  // ── Scroll: compact, hide on the way down, return on the way up ──
  const { scrollY, scrollYProgress } = useScroll();
  const lastY = useRef(0);
  // Overlay mode (homepage): the bar is fixed, so keep it below the in-flow concept banner until the
  // banner scrolls away — otherwise the banner (which must stay on top) covers the pill.
  const [bannerOffset, setBannerOffset] = useState(0);
  const measureBanner = () => {
    if (!overlay) return;
    const bottom = document.querySelector("[role='note']")?.getBoundingClientRect().bottom ?? 0;
    setBannerOffset(Math.max(0, Math.round(bottom)));
  };
  useEffect(() => {
    if (!overlay) return;
    measureBanner();
    window.addEventListener("resize", measureBanner);
    return () => window.removeEventListener("resize", measureBanner);
    // measureBanner only reads the DOM and sets state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, pathname]);

  useMotionValueEvent(scrollY, "change", (y) => {
    measureBanner();
    const dy = y - lastY.current;
    lastY.current = y;
    setAtTop(y < 24);
    if (Math.abs(dy) > 4) setMega(false); // the panel never lingers over content that scrolls away
    if (y < 120 || navStory.get().progress !== null) setHidden(false);
    else if (dy > 6) setHidden(true);
    else if (dy < -6) setHidden(false);
  });

  // ── Progress line: the homepage story when it's on screen, otherwise page reading progress ──
  const progress = useMotionValue(0);
  const progressSmooth = useSpring(progress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  useEffect(() => {
    const update = () => progress.set(navStory.get().progress ?? scrollYProgress.get());
    const offStory = navStory.onProgress(update);
    const offPage = scrollYProgress.on("change", update);
    update();
    return () => {
      offStory();
      offPage();
    };
  }, [progress, scrollYProgress]);

  // ── Dark sections: watch which [data-nav-theme=dark] block crosses the bar's line ──
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const setup = () => {
      io?.disconnect();
      const inside = new Set<Element>();
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? inside.add(e.target) : inside.delete(e.target)));
          setDark(inside.size > 0);
        },
        { rootMargin: `-${PROBE_Y}px 0px -${Math.max(0, window.innerHeight - PROBE_Y - 1)}px 0px` },
      );
      document.querySelectorAll("[data-nav-theme='dark']").forEach((el) => io!.observe(el));
    };
    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      io?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  const openMenu = () => {
    const b = menuButton.current?.getBoundingClientRect();
    const x = b ? b.left + b.width / 2 : window.innerWidth - 40;
    const y = b ? b.top + b.height / 2 : 40;
    // Radius that reaches the farthest corner, so the circle fully covers the screen.
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setOrigin({ x, y, r });
    setOpen(true);
  };
  const close = () => setOpen(false);

  const solid = !atTop || dark;
  const circle = (r: number) => `circle(${r}px at ${origin.x}px ${origin.y}px)`;

  return (
    <>
      {/* Click-through wrapper so the margin around the pill never blocks content. */}
      <header
        className={cn("pointer-events-none z-50 px-3 pt-3 sm:px-5 sm:pt-4", overlay ? "fixed inset-x-0 top-0" : "sticky top-0")}
        style={overlay ? { top: bannerOffset } : undefined}
        onFocusCapture={() => setHidden(false)}
      >
        <motion.nav
          aria-label="Primary"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: hidden && !open && !mega ? "-150%" : 0, opacity: 1 }}
          transition={hidden ? { duration: 0.35, ease: easeInOut } : { ...spring.sheet, opacity: { duration: 0.6, ease: easeOut } }}
          className={cn(
            "pointer-events-auto relative mx-auto flex items-center justify-between gap-3 rounded-full border pl-4 pr-2 sm:pl-5 sm:pr-2.5",
            "transition-[max-width,height,background-color,border-color,box-shadow,color] duration-500 ease-editorial",
            atTop ? "h-16 max-w-6xl" : "h-14 max-w-[68rem]",
            !solid && "border-transparent bg-transparent text-noir",
            solid && "backdrop-blur-[14px] backdrop-saturate-150",
            solid && !dark && "border-noir/[0.08] bg-[rgba(250,248,245,0.8)] text-noir shadow-pill-lg",
            dark && "border-white/10 bg-[rgba(22,22,22,0.6)] text-cream shadow-pill-lg",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label="Lotte India — home" className="shrink-0 rounded-full">
              <LotteMark priority tone={dark ? "light" : "dark"} className="[&_img:first-child]:h-9 [&_img:first-child]:w-9" />
            </Link>
            {/* Homepage story: which chapter you're in (the hero's own rail and headings carry it for AT). */}
            <AnimatePresence mode="popLayout" initial={false}>
              {chapter && !atTop && (
                <motion.span
                  key={chapter}
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className={cn(
                    "hidden whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] tabular-nums sm:inline-block",
                    dark ? "bg-white/10 text-cream/80" : "bg-noir/[0.05] text-ink-soft",
                  )}
                >
                  {chapter}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <ul className="hidden items-center gap-0.5 xl:flex" onPointerLeave={() => setHovered(null)}>
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const isBrands = link.href === "/brands";
              return (
                <li
                  key={link.href}
                  ref={isBrands ? megaItem : undefined}
                  className={isBrands ? "flex items-center" : undefined}
                  onPointerEnter={isBrands ? megaHoverIn : undefined}
                  onPointerLeave={isBrands ? megaHoverOut : undefined}
                >
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onKeyDown={
                      isBrands
                        ? (e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              openMega(true);
                            }
                          }
                        : undefined
                    }
                    onPointerEnter={() => setHovered(link.href)}
                    onFocus={() => setHovered(link.href)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      "relative isolate flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300",
                      dark
                        ? active ? "text-cream" : "text-cream/70 hover:text-cream"
                        : active ? "text-noir" : "text-ink-soft hover:text-noir",
                    )}
                  >
                    {/* Current page: a raised pill that glides between routes. */}
                    {active && (
                      <motion.span
                        layoutId="site-nav-active"
                        className={cn(
                          "absolute inset-0 -z-10 rounded-full",
                          dark ? "bg-white/15" : "bg-white shadow-[0_1px_2px_rgba(22,22,22,0.06),0_4px_14px_-6px_rgba(22,22,22,0.18)] ring-1 ring-noir/[0.06]",
                        )}
                        transition={spring.ui}
                      />
                    )}
                    {/* Hover: a soft tint that follows the pointer across links. */}
                    {hovered === link.href && !active && (
                      <motion.span
                        layoutId="site-nav-hover"
                        className={cn("absolute inset-0 -z-10 rounded-full", dark ? "bg-white/10" : "bg-noir/[0.05]")}
                        transition={spring.ui}
                      />
                    )}
                    {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lotte" />}
                    {link.label}
                  </Link>
                  {isBrands && (
                    <button
                      ref={megaToggle}
                      id="brands-menu-toggle"
                      type="button"
                      aria-expanded={mega}
                      aria-controls="brands-menu"
                      aria-label="Brand categories"
                      // Keyboard (detail 0) toggles and moves focus in. A mouse click only opens:
                      // hovering has usually opened it already, so a click must never snap it shut.
                      onClick={(e) => (e.detail === 0 ? (mega ? closeMega() : openMega(true)) : openMega())}
                      className={cn(
                        "-ml-2 grid h-7 w-7 place-items-center rounded-full transition-colors",
                        dark ? "text-cream/70 hover:bg-white/10 hover:text-cream" : "text-ink-soft hover:bg-noir/[0.05] hover:text-noir",
                      )}
                    >
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300 ease-editorial", mega && "rotate-180")} aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
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
              ref={menuButton}
              type="button"
              onClick={openMenu}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              className={cn(
                "grid h-11 w-11 place-items-center rounded-full border transition active:scale-95 xl:hidden",
                dark ? "border-white/15 bg-white/10 text-cream" : "border-noir/10 bg-white/70 text-noir hover:bg-white",
              )}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Progress line along the bottom of the pill */}
          <span aria-hidden="true" className={cn("pointer-events-none absolute inset-x-7 bottom-[3px] h-[2px] overflow-hidden rounded-full transition-opacity duration-500", solid ? "opacity-100" : "opacity-0")}>
            <span className={cn("absolute inset-0", dark ? "bg-white/10" : "bg-noir/[0.06]")} />
            <motion.span className="absolute inset-0 origin-left rounded-full bg-lotte" style={{ scaleX: progressSmooth }} />
          </span>

          {/* Brands mega-menu (wide screens only; phones use the full-screen menu and its brand chips) */}
          <AnimatePresence>
            {mega && (
              <BrandsMegaPanel
                key="brands-menu"
                ref={megaPanel}
                id="brands-menu"
                labelledBy="brands-menu-toggle"
                onNavigate={() => closeMega()}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") clearMegaTimer();
                }}
                onPointerLeave={megaHoverOut}
                onKeyDown={megaKeys}
              />
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* Full-screen phone menu. Rendered outside <header>: its backdrop-filter would trap fixed children. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="mesh-noir grain fixed inset-0 z-[90] flex flex-col overflow-y-auto text-cream xl:hidden"
            initial={{ clipPath: circle(0) }}
            animate={{ clipPath: circle(origin.r), y: 0 }}
            exit={{ clipPath: circle(0) }}
            transition={{ duration: reduce ? 0 : 0.65, ease: easeInOut }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 650) close();
            }}
          >
            {/* Drag area: swipe down anywhere on the top bar to close. */}
            <div
              className="relative z-10 flex touch-none items-center justify-between px-5 pb-2 pt-4"
              onPointerDown={(e) => drag.start(e)}
            >
              <span aria-hidden="true" className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25" />
              <Link href="/" onClick={close} aria-label="Lotte India — home" className="rounded-full">
                <LotteMark tone="light" />
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition active:scale-95"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Site" className="relative z-10 flex flex-1 flex-col px-5 pb-8 pt-6">
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: reduce ? 0 : 0.18 } } }}
              >
                {menuLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <motion.li
                      key={link.href}
                      variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } } }}
                    >
                      <Link
                        href={link.href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-[52px] items-center justify-between gap-4 border-b border-white/10 py-2 font-sans text-[clamp(1.6rem,7vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]",
                          active ? "text-lotte-light" : "text-cream",
                        )}
                      >
                        {link.label}
                        {active && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-lotte" />}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.55, duration: 0.5, ease: easeOut }}
                className="mt-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/60">Our brands</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {brandChips.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        onClick={close}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-4 text-sm font-medium text-cream/90 transition hover:border-white hover:text-white"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.7, duration: 0.5 }}
                className="mt-auto space-y-5 pt-10"
              >
                <Link href="/faq#contact" onClick={close} className="btn-light w-full justify-center">
                  Enquiry <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <a href={telHref(headOffice.phone)} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-cream/85">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span className="tabular-nums">{headOffice.phone}</span>
                  </a>
                  <SocialLinks />
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
