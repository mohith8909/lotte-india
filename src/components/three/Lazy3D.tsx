"use client";

import type { MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { Product } from "@/data/products";
import { useCanUseWebGL } from "./useCanUseWebGL";

// three.js is code-split out of the initial bundle and never rendered on the server.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const ProductStage = dynamic(() => import("./ProductStage"), { ssr: false });

/** Renders `fallback` until WebGL is confirmed (and permanently if it isn't available). */
function WebGLGate({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const ok = useCanUseWebGL();
  return <>{ok ? children : fallback}</>;
}

export function LazyHeroScene({
  scrollProgress,
  paused,
  fallback,
}: {
  scrollProgress?: MotionValue<number>;
  paused?: boolean;
  fallback: ReactNode;
}) {
  return (
    <WebGLGate fallback={fallback}>
      <HeroScene scrollProgress={scrollProgress} paused={paused} />
    </WebGLGate>
  );
}

export function LazyProductStage({ product, turn, fallback }: { product: Product; turn?: number; fallback: ReactNode }) {
  return (
    <WebGLGate fallback={fallback}>
      <ProductStage product={product} turn={turn} />
    </WebGLGate>
  );
}
