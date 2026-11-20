"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin logo-red reading-progress line pinned above the header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-lotte"
      style={{ scaleX }}
    />
  );
}
