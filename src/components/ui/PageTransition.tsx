"use client";

// Route transition: a logo-red circle grows from where you clicked and covers the screen while the
// destination's name rises in; the next page loads underneath, then the curtain lifts away.
//
// Next's App Router has no exit hook, so internal link clicks are intercepted (capture phase, before
// <Link> handles them), the cover plays, and only then does the router navigate. Same-page and hash
// links, new-tab / modified clicks, downloads, external links and reduced motion are left alone.

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LotteMark } from "@/components/brand/LotteMark";

const titles: Record<string, string> = {
  "/": "Home",
  "/story": "Our Story",
  "/brands": "Our Brands",
  "/reach": "Manufacturing & Reach",
  "/careers": "Careers",
  "/investors": "Investors",
  "/faq": "FAQ & Contact",
  "/classic": "Classic",
};

const curtain = [0.76, 0, 0.24, 1] as const;
const COVER_MS = 650;
const REVEAL_MS = 800;
const norm = (p: string) => p.replace(/\/+$/, "") || "/";

type Phase = "idle" | "cover" | "wait" | "reveal";

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [geo, setGeo] = useState({ x: 0, y: 0, r: 0 });
  const [title, setTitle] = useState("");
  const target = useRef<string | null>(null);
  const targetPath = useRef<string | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Intercept internal navigation clicks.
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || "noTransition" in a.dataset) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // A transition is already running: swallow extra clicks so they can't navigate underneath it.
      if (phase !== "idle") {
        e.preventDefault();
        return;
      }
      let path = url.pathname;
      if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
      if (norm(path) === norm(pathname)) return; // same page (hash links scroll as usual)

      e.preventDefault();
      // Keyboard activation reports 0,0 — grow from the link itself instead.
      const r = a.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      setGeo({ x, y, r: radius });
      setTitle(titles[norm(path)] ?? a.textContent?.trim().slice(0, 40) ?? "");
      target.current = path + url.search + url.hash;
      targetPath.current = norm(path);
      router.prefetch(path);
      setPhase("cover");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, phase, router]);

  // The new route has rendered: lift the curtain.
  useEffect(() => {
    if (!targetPath.current || norm(pathname) !== targetPath.current) return;
    if (fallback.current) clearTimeout(fallback.current);
    const t = setTimeout(() => setPhase("reveal"), 140);
    return () => clearTimeout(t);
  }, [pathname]);

  // Phase changes run on timers matched to the animations (not animation callbacks), so navigation and
  // the reveal always happen on time even if animation frames are paused, e.g. in a background tab.
  useEffect(() => {
    if (phase === "cover") {
      const t = setTimeout(() => {
        if (!target.current) return setPhase("idle");
        setPhase("wait");
        router.push(target.current);
        // Never strand the visitor behind the curtain if navigation stalls.
        fallback.current = setTimeout(() => setPhase("reveal"), 6000);
      }, COVER_MS);
      return () => clearTimeout(t);
    }
    if (phase === "reveal") {
      const t = setTimeout(() => {
        setPhase("idle");
        target.current = null;
        targetPath.current = null;
      }, REVEAL_MS);
      return () => clearTimeout(t);
    }
  }, [phase, router]);

  useEffect(() => () => {
    if (fallback.current) clearTimeout(fallback.current);
  }, []);

  if (phase === "idle") return null;

  const circle = (r: number) => `circle(${r}px at ${geo.x}px ${geo.y}px)`;
  const revealing = phase === "reveal";

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[110] grid place-items-center bg-[#E73437] text-white"
      initial={{ clipPath: circle(0), y: "0%" }}
      animate={revealing ? { clipPath: circle(geo.r), y: "-100%" } : { clipPath: circle(geo.r), y: "0%" }}
      transition={{ duration: (revealing ? REVEAL_MS : COVER_MS) / 1000, ease: curtain }}
    >
      <motion.div
        className="flex flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={revealing ? { opacity: 0, y: -40 } : { opacity: 1, y: 0 }}
        transition={{ duration: revealing ? 0.35 : 0.5, delay: revealing ? 0 : 0.22, ease: curtain }}
      >
        <LotteMark tone="light" markOnly className="[&_img]:h-12 [&_img]:w-12" />
        <p className="mt-6 font-serif text-[clamp(2.4rem,7vw,5.5rem)] font-light italic leading-none tracking-[-0.02em]">{title}</p>
      </motion.div>
    </motion.div>
  );
}
