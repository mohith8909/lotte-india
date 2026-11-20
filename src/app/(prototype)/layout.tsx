"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ProtoFooter } from "@/components/prototype/ProtoFooter";
import { ProtoNav } from "@/components/prototype/ProtoNav";

/**
 * Homepage chrome (3D homepage). `motion/react` has its own context, so reduced motion is configured here
 * (the main site's MotionConfig belongs to framer-motion v11).
 */
export default function PrototypeLayout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-proto-cream text-proto-cocoa">
        <ProtoNav />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <ProtoFooter />
      </div>
    </MotionConfig>
  );
}
