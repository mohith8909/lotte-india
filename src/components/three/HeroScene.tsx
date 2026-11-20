"use client";

import { ContactShadows, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useInView, useReducedMotion, type MotionValue } from "framer-motion";
import { useRef } from "react";
import * as THREE from "three";
import { ChocoPie, GlyphTile, Toffee, type WrapperTone } from "./models";
import { StudioLights } from "./StudioLights";

interface HeroSceneProps {
  /** 0 → 1 scroll progress of the hero section; spins the pie as the user scrolls. */
  scrollProgress?: MotionValue<number>;
  /** Freeze all motion (user pressed pause, or reduced motion). */
  paused?: boolean;
}

const orbiters: { kind: "toffee" | "tile"; pos: [number, number, number]; tone: WrapperTone; scale: number; speed: number }[] = [
  { kind: "toffee", pos: [-0.85, 1.25, -0.4], tone: "noir", scale: 0.42, speed: 1.4 },
  { kind: "toffee", pos: [0.9, -0.55, 0.4], tone: "white", scale: 0.36, speed: 1.1 },
  { kind: "tile", pos: [0.85, 1.4, -0.8], tone: "white", scale: 0.45, speed: 1.6 },
  { kind: "tile", pos: [-0.95, -0.6, 0.5], tone: "crimson", scale: 0.34, speed: 1.2 },
  { kind: "toffee", pos: [-0.2, 1.85, -1.6], tone: "white", scale: 0.3, speed: 0.9 },
];

function Rig({ scrollProgress, still }: HeroSceneProps & { still: boolean }) {
  const pie = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!pie.current || !rig.current) return;
    const scroll = scrollProgress?.get() ?? 0;
    if (!still) pie.current.rotation.y += delta * 0.25;
    // Scroll adds a full extra turn and tips the pie towards the viewer.
    pie.current.rotation.z = THREE.MathUtils.damp(pie.current.rotation.z, scroll * 0.35, 4, delta);
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, still ? 0 : state.pointer.x * 0.35 + scroll * Math.PI, 3, delta);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, still ? 0 : -state.pointer.y * 0.18, 3, delta);
  });

  return (
    <group ref={rig}>
      <Float enabled={!still} speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <group ref={pie} rotation={[0.55, 0, 0.12]} position={[0, 0.45, 0]} scale={0.62}>
          <ChocoPie />
        </group>
      </Float>
      {orbiters.map((o, i) => (
        <Float key={i} enabled={!still} speed={o.speed} rotationIntensity={1.2} floatIntensity={1.1}>
          <group position={o.pos} scale={o.scale} rotation={[i * 0.7, i * 1.3, i * 0.4]}>
            {o.kind === "toffee" ? <Toffee tone={o.tone} band={o.tone === "white" ? "lotte" : "white"} /> : <GlyphTile tone={o.tone} />}
          </group>
        </Float>
      ))}
    </group>
  );
}

/** Hero WebGL stage: a floating 3D Choco Pie orbited by toffees and logo-shaped tiles. */
export default function HeroScene({ scrollProgress, paused = false }: HeroSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper, { amount: 0.1 });
  const reduce = (useReducedMotion() ?? false) || paused;

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      <Canvas
        // Pause the render loop when off-screen or when the user prefers reduced motion.
        frameloop={inView && !reduce ? "always" : "demand"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 5.4], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
      >
        <StudioLights rim="#FFB3AC" />
        <Rig scrollProgress={scrollProgress} still={reduce} />
        <ContactShadows position={[0, -0.55, 0]} opacity={0.5} scale={4} blur={2.6} far={2} color="#5E0A12" />
      </Canvas>
    </div>
  );
}
