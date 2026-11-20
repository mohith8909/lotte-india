"use client";

// Procedural 3D confectionery models. No external assets: geometry is built in code so it
// loads instantly and stays on-brand.
// TODO: Swap for glTF scans of the real products (public/models/*.glb via useGLTF) when available.

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export const brandColors = {
  lotte: "#E73437",
  crimson: "#9C1420",
  noir: "#2A0F11",
  blush: "#EF7A6D",
  white: "#FFF8F4",
  coffee: "#784830",
  sun: "#F0D830",
} as const;

export type WrapperTone = keyof typeof brandColors;

/** Height of the pie's domed top at a given radius — keeps the drizzle glued to the surface. */
const topHeight = (r: number) => 0.34 - 0.07 * Math.min(1, (r / 1.08) ** 2);

interface PieProps {
  coat?: string;
  drizzle?: string;
}

/** Lotte Choco Pie: lathed chocolate shell, marshmallow seam and a choco drizzle. */
export function ChocoPie({ coat = "#3A1A12", drizzle = "#6B3424" }: PieProps) {
  const shell = useMemo(() => {
    const p = [
      [0, -0.31], [0.9, -0.31], [1.1, -0.3], [1.21, -0.25], [1.27, -0.15], [1.29, -0.03],
      [1.29, 0.04], [1.26, 0.15], [1.19, 0.24], [1.06, 0.3], [0.7, 0.33], [0, 0.345],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(p, 96);
    g.computeVertexNormals();
    return g;
  }, []);

  const drizzles = useMemo(
    () =>
      [-0.55, 0, 0.55].map((z, i) => {
        const pts: THREE.Vector3[] = [];
        const steps = 9;
        for (let s = 0; s <= steps; s++) {
          const x = -0.95 + (1.9 * s) / steps;
          const zz = z + (s % 2 ? 0.16 : -0.16) + i * 0.02;
          const r = Math.hypot(x, zz);
          if (r > 1.12) continue;
          pts.push(new THREE.Vector3(x, topHeight(r) + 0.012, zz));
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.022, 8, false);
      }),
    [],
  );

  return (
    <group>
      <mesh geometry={shell} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={coat}
          roughness={0.42}
          metalness={0}
          clearcoat={0.55}
          clearcoatRoughness={0.4}
          sheen={0.4}
          sheenColor="#7a3b25"
        />
      </mesh>
      {/* Marshmallow peeking out at the seam */}
      <mesh rotation-x={Math.PI / 2} position-y={0.005}>
        <torusGeometry args={[1.285, 0.045, 16, 96]} />
        <meshStandardMaterial color="#F7EFE6" roughness={0.95} />
      </mesh>
      {drizzles.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshPhysicalMaterial color={drizzle} roughness={0.3} clearcoat={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Twist-wrapped toffee (Coffy Bite / Eclairs style) with a glossy wrapper. */
export function Toffee({ tone = "lotte", band = "white" }: { tone?: WrapperTone; band?: WrapperTone }) {
  const color = brandColors[tone];
  return (
    <group rotation-z={Math.PI / 2}>
      <mesh castShadow>
        <capsuleGeometry args={[0.32, 0.62, 12, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.326, 0.326, 0.16, 48, 1, true]} />
        <meshPhysicalMaterial color={brandColors[band]} roughness={0.3} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      {[1, -1].map((dir) => (
        <mesh key={dir} position-y={dir * 0.78} rotation-z={dir === 1 ? Math.PI : 0} castShadow>
          {/* Cone tip points back into the candy, flaring outwards like a twisted wrapper */}
          <coneGeometry args={[0.3, 0.34, 24, 1, true]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.25}
            clearcoat={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The squircle-diamond silhouette of the Lotte India mark, as a glossy tile. */
export function GlyphTile({ tone = "lotte", size = 0.6 }: { tone?: WrapperTone; size?: number }) {
  return (
    <RoundedBox args={[size, size, size * 0.2]} radius={size * 0.22} smoothness={6} rotation-z={Math.PI / 4}>
      <meshPhysicalMaterial color={brandColors[tone]} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
    </RoundedBox>
  );
}
