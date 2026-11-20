"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Wraps a vertical timeline: a faint guide rail with a logo-red line that draws itself
 * as the reader scrolls through. Under reduced motion the line simply tracks scroll.
 */
export function ScrollLine({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-noir/10 md:left-1/2" />
      <motion.span
        aria-hidden="true"
        className="absolute bottom-2 left-[6px] top-2 w-[3px] origin-top rounded-full bg-lotte md:left-[calc(50%-1px)]"
        style={{ scaleY }}
      />
      {children}
    </div>
  );
}
