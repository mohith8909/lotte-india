"use client";

import { motion, type Variants } from "framer-motion";
import { Fragment, type ReactNode } from "react";
import { duration, easeOut, stagger as staggerDefault } from "@/lib/motion";

// Entrance: rise + fade + subtle scale — transform/opacity only, so it stays on the GPU compositor.
// Under reduced motion MotionConfig drops the transform, leaving an instant/gentle fade.
const hidden = { opacity: 0, y: 32, scale: 0.98 };
const shown = { opacity: 1, y: 0, scale: 1 };

const itemVariants: Variants = {
  hidden,
  show: { ...shown, transition: { duration: duration.reveal, ease: easeOut } },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}

/** Fades, lifts and de-blurs content into view once it enters the viewport. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={hidden}
      whileInView={shown}
      // "some" = any pixel in view triggers, so tall or partially visible blocks never stay hidden.
      viewport={{ once: true, amount: "some", margin: "0px 0px -8% 0px" }}
      transition={{ duration: duration.reveal, ease: easeOut, delay }}
    >
      {children}
    </Component>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol" | "dl";
}

/** Parent container that staggers its <RevealItem> children. */
export function Stagger({ children, className, stagger = staggerDefault * 1.5, as = "div" }: StaggerProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: "some", margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Component = motion[as];
  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}

interface MaskTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Animate on mount (above the fold) instead of when scrolled into view. */
  immediate?: boolean;
}

/**
 * Editorial masked reveal: the text rises from behind a clipping edge.
 * Use inside headings: <h2><MaskText>Title <em>accent</em></MaskText></h2>.
 */
const maskVariants: Variants = {
  hidden: { y: "105%", rotate: 2, opacity: 0 },
  show: { y: "0%", rotate: 0, opacity: 1 },
};

/** Trigger props for a mask wrapper. The wrapper (not the clipped child) is observed:
 *  the child starts outside the overflow clip, so observing it would never fire. */
const maskTrigger = (immediate: boolean) =>
  immediate
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: "some" as const } };

export function MaskText({ children, className, delay = 0, immediate = false }: MaskTextProps) {
  return (
    // Padding/negative margin keeps descenders and italic overhangs from being clipped.
    <motion.span className={`-mb-[0.12em] block overflow-hidden pb-[0.12em] ${className ?? ""}`} {...maskTrigger(immediate)}>
      <motion.span
        className="block origin-top-left"
        variants={maskVariants}
        transition={{ duration: duration.hero, ease: easeOut, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

interface WordsProps {
  /** Words to reveal; mark emphasised words with `{ text, em: true }`. */
  words: Array<string | { text: string; em?: boolean; className?: string }>;
  delay?: number;
  immediate?: boolean;
}

/** Word-by-word masked reveal for short display headlines (hero titles). */
export function MaskWords({ words, delay = 0, immediate = false }: WordsProps) {
  return (
    <>
      {words.map((w, i) => {
        const word = typeof w === "string" ? { text: w } : w;
        const inner = word.em ? <em className={word.className}>{word.text}</em> : word.text;
        return (
          <Fragment key={i}>
            <motion.span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom" {...maskTrigger(immediate)}>
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: "110%", opacity: 0 }, show: { y: "0%", opacity: 1 } }}
                transition={{ duration: duration.hero, ease: easeOut, delay: delay + i * 0.08 }}
              >
                {inner}
              </motion.span>
            </motion.span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
}
