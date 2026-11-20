"use client";

import { ContactShadows, Float, PresentationControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Product } from "@/data/products";
import { ChocoPie, Toffee, type WrapperTone } from "./models";
import { StudioLights } from "./StudioLights";

const pieCoats: Record<string, { coat: string; drizzle: string }> = {
  "choco-pie-classic": { coat: "#3A1A12", drizzle: "#6B3424" },
  "choco-pie-rich-cocoa": { coat: "#22100B", drizzle: "#4A2418" },
  "fruto-pie": { coat: "#3A1A12", drizzle: "#B3263A" },
  "orange-pie": { coat: "#3A1A12", drizzle: "#E8862E" },
};

const accentTone: Record<Product["accent"], WrapperTone> = {
  lotte: "lotte",
  noir: "noir",
  crimson: "crimson",
  blush: "blush",
  coffee: "coffee",
  sun: "sun",
};

/** Eases the model towards `turn` × 45° — the button/keyboard alternative to dragging. */
function Turntable({ turn, still, children }: { turn: number; still: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const target = (turn * Math.PI) / 4;

  useEffect(() => {
    if (still && ref.current) {
      ref.current.rotation.y = target;
      invalidate();
    }
  }, [still, target, invalidate]);

  useFrame((_, delta) => {
    if (!still && ref.current) ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, target, 6, delta);
  });

  return <group ref={ref}>{children}</group>;
}

/** Drag-to-rotate 3D turntable for the product quick-view drawer. */
export default function ProductStage({ product, turn = 0 }: { product: Product; turn?: number }) {
  const reduce = useReducedMotion() ?? false;
  const coat = pieCoats[product.slug];

  return (
    <Canvas
      frameloop={reduce ? "demand" : "always"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 5], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <StudioLights />
      <PresentationControls
        global
        cursor
        snap
        speed={1.4}
        polar={[-0.3, 0.5]}
        azimuth={[-Infinity, Infinity]}
      >
        <Turntable turn={turn} still={reduce}>
        <Float enabled={!reduce} speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          {product.shape === "pie" ? (
            <group rotation={[0.6, 0, 0]} scale={1.05}>
              <ChocoPie coat={coat?.coat} drizzle={coat?.drizzle} />
            </group>
          ) : (
            <group scale={1.45} rotation={[0.3, 0.4, 0]}>
              <Toffee tone={accentTone[product.accent]} band={product.accent === "noir" ? "lotte" : "white"} />
            </group>
          )}
        </Float>
        </Turntable>
      </PresentationControls>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={5} blur={2.4} far={3} />
    </Canvas>
  );
}
