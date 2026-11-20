"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Soft-box studio lighting built from Lightformers — no HDRI download required,
 * so the scene renders offline and on first paint.
 */
export function StudioLights({ rim = "#E73437" }: { rim?: string }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow />
      <pointLight position={[-4, 1, -2]} intensity={12} color={rim} distance={10} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[6, 2, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.5} position={[-4, 1, 2]} scale={[2, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2} color={rim} position={[4, 0, -2]} scale={2} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.8} position={[0, -3, 2]} scale={[6, 1, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}
