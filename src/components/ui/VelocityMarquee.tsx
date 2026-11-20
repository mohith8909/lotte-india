"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Wrap `v` into the half-open range [min, max). */
const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

interface VelocityMarqueeProps {
  children: ReactNode;
  /** Drift speed in % of one copy per second. Negative = rightwards. */
  baseVelocity?: number;
  className?: string;
  /** External pause (e.g. the hero's pause button). */
  paused?: boolean;
}

/**
 * Endless marquee that drifts on its own and surges with scroll speed — flicking the
 * page faster speeds it up, scrolling back up reverses it. Pauses on hover and stops
 * entirely for reduced-motion users.
 */
export function VelocityMarquee({ children, baseVelocity = 2.5, className, paused = false }: VelocityMarqueeProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce || paused || hovered) return;
    const f = velocityFactor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    let move = direction.current * baseVelocity * (delta / 1000);
    move += move * Math.min(Math.abs(f), 6);
    baseX.set(baseX.get() + move);
  });

  return (
    <div
      className={cn("overflow-hidden", className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-hidden="true"
    >
      <motion.div className="flex w-max flex-nowrap whitespace-nowrap will-change-transform" style={{ x }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </motion.div>
    </div>
  );
}
