"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { setLenis } from "@/lib/smoothScroll";

/**
 * Inertial wheel scrolling (Lenis). Native scroll position is kept in sync, so
 * framer-motion `useScroll`, `whileInView` and sticky positioning all keep working.
 * Disabled for reduced-motion users; touch devices keep their native momentum.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const create = () => {
      if (media.matches || lenis) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.09, // lower = silkier glide
        wheelMultiplier: 0.9,
        smoothWheel: true,
        syncTouch: false,
        // In-page #anchor links glide too, stopping below the sticky header.
        anchors: { offset: -96 },
        // Let drawers and horizontally scrolling rails scroll on their own.
        prevent: (node) => Boolean(node.closest?.("[data-lenis-prevent], [role=dialog]")),
      });
      lenisRef.current = lenis;
      setLenis(lenis);
    };
    const destroy = () => {
      lenis?.destroy();
      lenis = null;
      lenisRef.current = null;
      setLenis(null);
    };

    create();
    const onChange = () => (media.matches ? destroy() : create());
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      destroy();
    };
  }, []);

  // New page: jump to the top instantly (Next does this natively; keep Lenis' target in sync).
  useEffect(() => {
    if (!window.location.hash) lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
