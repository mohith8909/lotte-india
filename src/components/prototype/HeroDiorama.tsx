"use client";

// "The Little Circle of Joy" — R3F hero diorama, told in four scroll chapters:
//   1. Assemble  2. Anatomy (exploded layers + projected labels)  3. The bite  4. Crumbs → numbers
// Owns: procedural PBR confectionery, studio lighting, depth layers, the spline camera, particles.
// Does NOT own scroll logic: GSAP writes to `driver`, this file only reads it inside useFrame.

import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { BITE_ANGLE, BITE_FACING, BITE_FACING_NARROW, cameraPath, heroNumbers, heroPalette as P, type HeroDriver } from "./driver";

const MAX_TILT = THREE.MathUtils.degToRad(8); // ±8° pitch/yaw toward the cursor
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Shortest signed angle from a to b. */
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/** Small seeded PRNG so procedural layouts are identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────────────────── Procedural geometry & textures ───────────────────────── */

/** Lathe a profile of [radius, height] points into a smooth solid of revolution. */
function lathe(points: Array<[number, number]>, segments = 96) {
  const g = new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments);
  g.computeVertexNormals();
  return g;
}

/** Dispose resources we created ourselves when the component unmounts. */
function useDisposable<T extends { dispose: () => void }>(items: T[]) {
  useEffect(() => () => items.forEach((i) => i.dispose()), [items]);
}

/** Soft speckle noise, used as a bump map: cocoa-butter bloom on chocolate, crumb on biscuit. */
function speckleTexture(seed: number, count: number, rMin: number, rMax: number, repeat: [number, number]) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = rMin + rnd() * (rMax - rMin);
    const v = rnd() > 0.5 ? 255 : 0;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${v},${v},${v},${0.18 + rnd() * 0.3})`);
    grad.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}

/* ───────────────────────── The bite (shader clipping) ───────────────────────── */
// The bite is three overlapping circles on the pie's rim (a scalloped tooth mark), tested in each
// layer's object space on the XZ plane — so it cuts straight down through all layers wherever they
// sit. "cut" materials discard inside the bite; "keep" materials (the bitten piece) discard outside.
// Back faces revealed by the cut are tinted with a cross-section colour (cake, marshmallow, biscuit).

const BITE_RADIUS = 1.42; // bite circle centres sit just outside the rim (r ≈ 1.28)
const BITE_GLSL = /* glsl */ `
uniform float uBiteOn;
uniform vec3 uCutColor;
varying vec3 vBitePos;
float biteMask(vec2 p) {
  float d = 1e3;
  for (int i = 0; i < 3; i++) {
    float a = ${BITE_ANGLE.toFixed(4)} + (float(i) - 1.0) * 0.3;
    d = min(d, length(p - vec2(sin(a), cos(a)) * ${BITE_RADIUS.toFixed(3)}) - 0.4);
  }
  return d;
}`;

type BiteUniforms = { uBiteOn: { value: number } };

function withBite<T extends THREE.Material>(mat: T, mode: "cut" | "keep", cutColor: string, u: BiteUniforms): T {
  mat.side = THREE.DoubleSide;
  const cut = new THREE.Color(cutColor);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBiteOn = u.uBiteOn;
    shader.uniforms.uCutColor = { value: cut };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBitePos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBitePos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${BITE_GLSL}`)
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
         float biteD = biteMask(vBitePos.xz);
         ${mode === "cut" ? "if (uBiteOn > 0.5 && biteD < 0.0) discard;" : "if (biteD >= 0.0) discard;"}`,
      )
      .replace("#include <color_fragment>", "#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb = uCutColor;");
  };
  mat.customProgramCacheKey = () => `bite-${mode}-${cutColor}`;
  return mat;
}

/* ───────────────────────── Midground: the Choco Pie ───────────────────────── */

export interface LayerRefs {
  assembly: THREE.Group | null;
  shell: THREE.Group | null;
  core: THREE.Mesh | null;
  base: THREE.Mesh | null;
}

const BITE_DIR = new THREE.Vector3(Math.sin(BITE_ANGLE), 0, Math.cos(BITE_ANGLE));
const BITE_CENTER = new THREE.Vector3(Math.sin(BITE_ANGLE) * 1.15, 0.12, Math.cos(BITE_ANGLE) * 1.15);
const STRAND_ANGLES = [-0.3, -0.15, 0, 0.15, 0.3];
const CRUMB_COUNT = 30;

function ChocoPie({ driver, still, layers }: { driver: MutableRefObject<HeroDriver>; still: boolean; layers: MutableRefObject<LayerRefs> }) {
  const assembly = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const base = useRef<THREE.Mesh>(null);
  // The bitten piece: the same layers with "keep" materials, on a pivot at the bite.
  const pivot = useRef<THREE.Group>(null);
  const cShell = useRef<THREE.Group>(null);
  const cCore = useRef<THREE.Mesh>(null);
  const cBase = useRef<THREE.Mesh>(null);
  const strands = useRef<(THREE.Mesh | null)[]>([]);
  const crumbs = useRef<THREE.InstancedMesh>(null);
  const idle = useRef(0); // accumulated idle spin, kept separate from the scroll-driven spin
  const lean = useRef(0);

  const geos = useMemo(() => {
    // Glossy dark-chocolate dome shell
    const shellG = lathe([
      [0, 0.34], [0.7, 0.33], [1.06, 0.28], [1.2, 0.18], [1.27, 0.05], [1.28, -0.02],
      [1.24, -0.04], [1.0, -0.03], [0, -0.03],
    ]);
    // Pillowy marshmallow core: a soft, slightly bulging puck
    const coreG = lathe([
      [0, 0.07], [0.9, 0.075], [1.12, 0.05], [1.2, 0], [1.12, -0.05], [0.9, -0.075], [0, -0.07],
    ]);
    // Warm golden-brown biscuit base
    const baseG = lathe([
      [0, 0.03], [1.05, 0.03], [1.22, 0.0], [1.26, -0.08], [1.2, -0.17], [1.0, -0.2], [0, -0.2],
    ]);
    // Choco drizzle: three zig-zag tubes laid over the dome
    const drizzles = [-0.5, 0, 0.5].map((z, k) => {
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 10; s++) {
        const x = -0.95 + (1.9 * s) / 10;
        const zz = z + (s % 2 ? 0.15 : -0.15) + k * 0.01;
        const r = Math.hypot(x, zz);
        if (r > 1.1) continue;
        pts.push(new THREE.Vector3(x, 0.34 - 0.08 * Math.min(1, (r / 1.08) ** 2) + 0.012, zz));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.022, 8, false);
    });
    const strandG = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true);
    const crumbG = new THREE.DodecahedronGeometry(0.06, 0);
    return { shellG, coreG, baseG, drizzles, strandG, crumbG };
  }, []);
  useDisposable(useMemo(() => [geos.shellG, geos.coreG, geos.baseG, geos.strandG, geos.crumbG, ...geos.drizzles], [geos]));

  const tex = useMemo(
    () => ({
      choco: speckleTexture(11, 900, 1, 3.5, [10, 3]),
      biscuit: speckleTexture(29, 700, 1.5, 5, [8, 2]),
    }),
    [],
  );
  useDisposable(useMemo(() => [tex.choco, tex.biscuit], [tex]));

  const mats = useMemo(() => {
    const u: BiteUniforms = { uBiteOn: { value: 0 } };
    const shellM = () =>
      new THREE.MeshPhysicalMaterial({
        color: P.cocoa, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.16,
        sheen: 0.35, sheenColor: new THREE.Color("#7a3b25"), bumpMap: tex.choco, bumpScale: 0.6,
      });
    const drizzleM = () => new THREE.MeshPhysicalMaterial({ color: "#6B3424", roughness: 0.22, clearcoat: 1 });
    // Marshmallow: soft sheen plus a faint warm self-glow that reads as light scattering inside it.
    const coreM = () =>
      new THREE.MeshPhysicalMaterial({
        color: P.ivory, roughness: 0.85, sheen: 1, sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.6,
        emissive: new THREE.Color("#FFE3C8"), emissiveIntensity: 0.14,
      });
    const baseM = () => new THREE.MeshStandardMaterial({ color: P.biscuit, roughness: 0.8, bumpMap: tex.biscuit, bumpScale: 1.2 });
    const cuts = { shell: "#7A4A2A", drizzle: "#4A2416", core: "#FFF1E0", base: "#C98E52" };
    return {
      u,
      shell: withBite(shellM(), "cut", cuts.shell, u),
      drizzle: withBite(drizzleM(), "cut", cuts.drizzle, u),
      core: withBite(coreM(), "cut", cuts.core, u),
      base: withBite(baseM(), "cut", cuts.base, u),
      kShell: withBite(shellM(), "keep", cuts.shell, u),
      kDrizzle: withBite(drizzleM(), "keep", cuts.drizzle, u),
      kCore: withBite(coreM(), "keep", cuts.core, u),
      kBase: withBite(baseM(), "keep", cuts.base, u),
      strand: new THREE.MeshPhysicalMaterial({ color: P.ivory, roughness: 0.7, sheen: 1, sheenColor: new THREE.Color("#fff") }),
      crumb: new THREE.MeshStandardMaterial({ color: "#8A5530", roughness: 0.9 }),
    };
  }, [tex]);
  useDisposable(useMemo(() => Object.values(mats).flatMap((m) => (m instanceof THREE.Material ? [m] : [])), [mats]));

  // Crumb burst: fixed, seeded trajectories so scrubbing backwards replays the burst exactly.
  const crumbPaths = useMemo(() => {
    const rnd = mulberry32(5);
    return Array.from({ length: CRUMB_COUNT }, () => ({
      v: new THREE.Vector3(
        BITE_DIR.x * (0.6 + rnd()) + (rnd() - 0.5) * 1.6,
        0.6 + rnd() * 1.4,
        BITE_DIR.z * (0.6 + rnd()) + (rnd() - 0.5) * 1.6,
      ),
      spin: new THREE.Vector3(rnd() * 8, rnd() * 8, rnd() * 8),
      scale: 0.5 + rnd() * 0.9,
    }));
  }, []);

  useEffect(() => {
    layers.current.assembly = assembly.current;
    layers.current.shell = shell.current;
    layers.current.core = core.current;
    layers.current.base = base.current;
  }, [layers]);

  const tmp = useMemo(
    () => ({
      m: new THREE.Object3D(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      mid: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  useFrame((state, delta) => {
    const d = driver.current;
    const k = still ? 1 : 1 - Math.exp(-6 * delta); // frame-rate independent damping
    const a = assembly.current;
    if (!a) return;

    // Scroll-velocity lean: fast flicks tip the pie and make it lag, then it settles.
    d.velocity *= Math.exp(-3 * delta);
    lean.current = THREE.MathUtils.lerp(lean.current, still ? 0 : d.velocity, 1 - Math.exp(-5 * delta));

    // Pointer (desktop) or device tilt (phones)
    const px = still ? 0 : d.tiltX || state.pointer.x;
    const py = still ? 0 : d.tiltY || state.pointer.y;
    a.rotation.x = THREE.MathUtils.lerp(a.rotation.x, 0.52 - py * MAX_TILT + lean.current * 0.28, k);
    a.rotation.z = THREE.MathUtils.lerp(a.rotation.z, -px * MAX_TILT * 0.6, k);

    // Turn: idle + scroll spin, and during the bite, swing the bitten edge toward the camera.
    // As the camera heads for the bite (path 1.4 → 1.95) the idle spin eases off and the pie turns
    // its bite side to the lens; it stays that way through the numbers chapter.
    const w = smooth(1.4, 1.95, d.path);
    if (!still) idle.current += delta * 0.12 * (1 - w);
    const free = idle.current + d.spin;
    // Phones turn the bite more toward the lens so the departing piece stays inside the narrow frame.
    const face = THREE.MathUtils.lerp(BITE_FACING_NARROW, BITE_FACING, d.wide) - BITE_ANGLE;
    a.rotation.y = THREE.MathUtils.lerp(a.rotation.y, free + angleDelta(free, face) * w, k);

    // Intro drop + idle bob + recede (the pie sinks away for the numbers chapter)
    const bob = still ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    a.position.y = bob + (1 - d.intro) * 1.4 - d.recede * 2.6 - lean.current * 0.18;
    a.scale.setScalar(0.8 * (0.55 + 0.45 * d.intro) * (1 - d.recede * 0.35));

    // Exploded view: layers separate along the pie's own axis and tip apart for depth
    const e = d.explode;
    if (shell.current) {
      shell.current.position.y = THREE.MathUtils.lerp(shell.current.position.y, 0.24 + e * 0.8, k);
      shell.current.rotation.x = THREE.MathUtils.lerp(shell.current.rotation.x, -e * 0.16, k);
      shell.current.rotation.z = THREE.MathUtils.lerp(shell.current.rotation.z, e * 0.06, k);
    }
    if (core.current) {
      core.current.position.y = THREE.MathUtils.lerp(core.current.position.y, 0.13 + e * 0.15, k);
      const breath = still ? 0 : Math.sin(state.clock.elapsedTime * 1.6) * 0.035;
      const sy = 1 + e * 0.05 + breath;
      const sxz = 1 + e * 0.03 - breath * 0.5;
      core.current.scale.set(sxz, THREE.MathUtils.lerp(core.current.scale.y, sy, k), sxz);
    }
    if (base.current) {
      base.current.position.y = THREE.MathUtils.lerp(base.current.position.y, 0 - e * 0.62, k);
      base.current.rotation.x = THREE.MathUtils.lerp(base.current.rotation.x, e * 0.12, k);
    }

    // ── The bite ──
    const b = d.bite;
    const biting = b > 0.002;
    mats.u.uBiteOn.value = biting ? 1 : 0;
    const pull = smooth(0, 0.6, b); // piece pulls away, marshmallow stretches
    const fly = clamp01((b - 0.6) / 0.4); // strands snapped: piece flies off
    const pv = pivot.current;
    if (pv) {
      pv.visible = biting && fly < 0.985;
      const dist = pull * 0.55 + fly * fly * 2.4;
      pv.position.copy(BITE_CENTER).addScaledVector(BITE_DIR, dist);
      pv.position.y += Math.sin(pull * Math.PI * 0.5) * 0.22 + fly * 0.9;
      pv.rotation.set(-pull * 0.32 - fly * 1.3, fly * 0.6, pull * 0.18 + fly * 0.9);
      pv.scale.setScalar(Math.max(0.001, 1 - fly * 0.85));
      // The piece mirrors each layer's pose so it lines up with the pie before it leaves.
      if (cShell.current && shell.current) {
        cShell.current.position.copy(shell.current.position);
        cShell.current.rotation.copy(shell.current.rotation);
      }
      if (cCore.current && core.current) {
        cCore.current.position.copy(core.current.position);
        cCore.current.scale.copy(core.current.scale);
      }
      if (cBase.current && base.current) {
        cBase.current.position.copy(base.current.position);
        cBase.current.rotation.copy(base.current.rotation);
      }
      pv.updateMatrix();

      // Marshmallow strands: from the pie's cut edge to the same point on the departing piece.
      const snap = 1 - smooth(0.56, 0.62, b);
      const coreY = core.current?.position.y ?? 0.13;
      strands.current.forEach((s, i) => {
        if (!s) return;
        s.visible = biting && snap > 0.01;
        if (!s.visible) return;
        const ang = BITE_ANGLE + STRAND_ANGLES[i]!;
        tmp.a.set(Math.sin(ang) * 1.0, coreY + ((i % 3) - 1) * 0.035, Math.cos(ang) * 1.0);
        tmp.b.copy(tmp.a).sub(BITE_CENTER).applyMatrix4(pv.matrix);
        tmp.dir.subVectors(tmp.b, tmp.a);
        const len = Math.max(0.001, tmp.dir.length());
        tmp.mid.addVectors(tmp.a, tmp.b).multiplyScalar(0.5);
        s.position.copy(tmp.mid);
        s.quaternion.setFromUnitVectors(tmp.up, tmp.dir.normalize());
        // Thins as it stretches (roughly volume-preserving); outer strands are finer and snap first.
        const outer = Math.abs(i - 2) / 2;
        const r = 0.1 * Math.sqrt(0.08 / Math.max(0.08, len)) * snap * (1 - outer * 0.45) * (1 - smooth(0.4, 0.58, b) * outer);
        s.scale.set(r, len, r);
      });
    }

    // Crumb burst as the strands snap
    const cm = crumbs.current;
    if (cm) {
      const t = clamp01((b - 0.56) / 0.44);
      cm.visible = t > 0 && t < 1;
      if (cm.visible) {
        crumbPaths.forEach((c, i) => {
          tmp.m.position.copy(BITE_CENTER).addScaledVector(c.v, t * 1.3);
          tmp.m.position.y -= 2.8 * t * t;
          tmp.m.rotation.set(c.spin.x * t, c.spin.y * t, c.spin.z * t);
          tmp.m.scale.setScalar(c.scale * (1 - t * 0.5));
          tmp.m.updateMatrix();
          cm.setMatrixAt(i, tmp.m.matrix);
        });
        cm.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={assembly} rotation={[0.52, 0, 0]} scale={0.44}>
      <group ref={shell} position={[0, 0.24, 0]}>
        <mesh geometry={geos.shellG} material={mats.shell} castShadow />
        {geos.drizzles.map((g, i) => (
          <mesh key={i} geometry={g} material={mats.drizzle} />
        ))}
      </group>
      <mesh ref={core} geometry={geos.coreG} material={mats.core} position={[0, 0.13, 0]} />
      <mesh ref={base} geometry={geos.baseG} material={mats.base} castShadow />

      {/* The bitten piece */}
      <group ref={pivot} position={BITE_CENTER.toArray()} visible={false}>
        <group position={BITE_CENTER.clone().negate().toArray()}>
          <group ref={cShell}>
            <mesh geometry={geos.shellG} material={mats.kShell} />
            {geos.drizzles.map((g, i) => (
              <mesh key={i} geometry={g} material={mats.kDrizzle} />
            ))}
          </group>
          <mesh ref={cCore} geometry={geos.coreG} material={mats.kCore} />
          <mesh ref={cBase} geometry={geos.baseG} material={mats.kBase} />
        </group>
      </group>

      {STRAND_ANGLES.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            strands.current[i] = m;
          }}
          geometry={geos.strandG}
          material={mats.strand}
          visible={false}
        />
      ))}
      <instancedMesh ref={crumbs} args={[geos.crumbG, mats.crumb, CRUMB_COUNT]} visible={false} frustumCulled={false} />
    </group>
  );
}

/* ───────────────────────── Category clusters (midground) ───────────────────────── */

function PeperoStick({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.5, 16]} />
        <meshStandardMaterial color="#D9A867" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 1.1, 20]} />
        <meshPhysicalMaterial color={P.cocoa} roughness={0.3} clearcoat={0.8} />
      </mesh>
    </group>
  );
}

function Candy({ color, band, position, rotation, scale = 1 }: {
  color: string;
  band: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation-z={Math.PI / 2}>
        <mesh>
          <capsuleGeometry args={[0.24, 0.42, 10, 24]} />
          <meshPhysicalMaterial color={color} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.245, 0.245, 0.12, 32, 1, true]} />
          <meshPhysicalMaterial color={band} roughness={0.25} clearcoat={1} side={THREE.DoubleSide} />
        </mesh>
        {[1, -1].map((dir) => (
          <mesh key={dir} position-y={dir * 0.55} rotation-z={dir === 1 ? Math.PI : 0}>
            <coneGeometry args={[0.22, 0.26, 20, 1, true]} />
            <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── Background: circle of joy ───────────────────────── */

function JoyArcs({ driver, still }: { driver: MutableRefObject<HeroDriver>; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(
    () => [
      { r: 2.6, arc: Math.PI * 1.55, t: 0.016, rot: 0.3, speed: 0.05 },
      { r: 3.2, arc: Math.PI * 1.2, t: 0.01, rot: 2.1, speed: -0.035 },
      { r: 3.9, arc: Math.PI * 1.75, t: 0.008, rot: 4.0, speed: 0.02 },
      { r: 4.7, arc: Math.PI * 0.9, t: 0.006, rot: 1.2, speed: -0.015 },
    ],
    [],
  );
  useFrame((_, delta) => {
    if (!group.current) return;
    if (!still) group.current.children.forEach((c, i) => (c.rotation.z += delta * rings[i]!.speed));
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -driver.current.bg * 0.6, 0.1);
  });
  return (
    <group ref={group} position={[0, 0, -3.2]}>
      {rings.map((r, i) => (
        <mesh key={i} rotation-z={r.rot}>
          <torusGeometry args={[r.r, r.t, 8, 160, r.arc]} />
          <meshBasicMaterial color={P.red} transparent opacity={0.55 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

function DepthParticles({ still }: { still: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 220;
    const rnd = mulberry32(3);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color(P.caramel), new THREE.Color(P.cocoa), new THREE.Color(P.red), new THREE.Color("#E8D9C4")];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 16;
      pos[i * 3 + 1] = (rnd() - 0.5) * 9;
      pos[i * 3 + 2] = -2 - rnd() * 6;
      const c = palette[i % palette.length]!;
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  useDisposable(useMemo(() => [geometry], [geometry]));
  useFrame((state) => {
    if (ref.current && !still) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ───────────────────────── Foreground: fast-depth treats & crumbs ───────────────────────── */

function CocoaCrumbs({ count = 36 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(0.05, 0), []);
  useDisposable(useMemo(() => [geometry], [geometry]));
  useEffect(() => {
    const m = new THREE.Object3D();
    const rnd = mulberry32(17);
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      // Left-side crumbs stay low so the headline area remains clean.
      const y = side < 0 ? -1.1 - rnd() * 1.4 : (rnd() - 0.5) * 3.6;
      m.position.set(side * (2.2 + rnd() * 2.2), y, 1.2 + rnd() * 1.6);
      m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      m.scale.setScalar(0.6 + rnd() * 1.2);
      m.updateMatrix();
      ref.current?.setMatrixAt(i, m.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]}>
      <meshStandardMaterial color={P.cocoa} roughness={0.9} />
    </instancedMesh>
  );
}

/* ───────────────────────── Chapter 4: crumbs → numbers ───────────────────────── */

const NUM_DIST = 8; // particles live on a camera-locked plane this far in front of the lens

/** Rasterise each number with the site's display font and sample points inside the glyphs. */
async function buildNumberGeometry(count: number) {
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  const font = (px: number) => `800 ${px}px ${family}`;
  try {
    await document.fonts.load(font(200), heroNumbers.map((n) => n.text).join(" "));
  } catch {
    /* fall back to whatever font is available */
  }
  const W = 1400;
  const H = 420;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = font(320);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ref = Math.max(...heroNumbers.map((n) => ctx.measureText(n.text).width));
  const rnd = mulberry32(7);
  const step = 3;

  const sets = heroNumbers.map((n) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000";
    ctx.fillText(n.text, W / 2, H / 2);
    const data = ctx.getImageData(0, 0, W, H).data;
    const pts: number[] = [];
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3]! > 128) pts.push((x - W / 2) / ref, -(y - H / 2) / ref);
      }
    }
    // Shuffle point order so each particle's target is a random spot in the glyphs
    for (let i = pts.length / 2 - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [pts[i * 2], pts[j * 2]] = [pts[j * 2]!, pts[i * 2]!];
      [pts[i * 2 + 1], pts[j * 2 + 1]] = [pts[j * 2 + 1]!, pts[i * 2 + 1]!];
    }
    return pts;
  });

  const jitter = step / ref;
  const attr = (fill: (i: number, out: Float32Array) => void, size: number) => {
    const a = new Float32Array(count * size);
    for (let i = 0; i < count; i++) fill(i, a);
    return new THREE.BufferAttribute(a, size);
  };
  const target = (set: number[]) => (i: number, out: Float32Array) => {
    const n = set.length / 2 || 1;
    const k = (i % n) * 2;
    out[i * 3] = (set[k] ?? 0) + (rnd() - 0.5) * jitter;
    out[i * 3 + 1] = (set[k + 1] ?? 0) + (rnd() - 0.5) * jitter;
    out[i * 3 + 2] = (rnd() - 0.5) * 0.02;
  };

  const g = new THREE.BufferGeometry();
  const a = attr(target(sets[0]!), 3);
  g.setAttribute("position", a);
  g.setAttribute("aA", a);
  g.setAttribute("aB", attr(target(sets[1]!), 3));
  g.setAttribute("aC", attr(target(sets[2]!), 3));
  g.setAttribute(
    "aStart",
    attr((i, out) => {
      // Random point inside a unit sphere: the crumb cloud the numbers form from
      let x = 0, y = 0, z = 0;
      do {
        x = rnd() * 2 - 1;
        y = rnd() * 2 - 1;
        z = rnd() * 2 - 1;
      } while (x * x + y * y + z * z > 1);
      out.set([x, y * 0.6, z], i * 3);
    }, 3),
  );
  g.setAttribute("aRand", attr((i, out) => (out[i] = rnd()), 1));
  return g;
}

const numberVertex = /* glsl */ `
attribute vec3 aStart; attribute vec3 aA; attribute vec3 aB; attribute vec3 aC; attribute float aRand;
uniform float uMorph, uNum, uTime, uScale, uStartRadius, uPixel;
uniform vec3 uTarget, uStart;
varying float vAlpha; varying float vRand;
float ease(float t) { t = clamp(t, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
void main() {
  float m = ease((uMorph - aRand * 0.4) / 0.6);
  float t1 = ease((uNum - aRand * 0.35) / 0.65);
  float t2 = ease((uNum - 1.0 - aRand * 0.35) / 0.65);
  vec3 glyph = mix(mix(aA, aB, t1), aC, t2);
  // Between numbers the particles swirl outward a little before settling into the next glyph
  float swirl = sin(t1 * 3.14159) + sin(t2 * 3.14159);
  glyph += normalize(aStart + vec3(1e-4)) * swirl * 0.14;
  vec3 target = uTarget + glyph * uScale;
  vec3 start = uStart + aStart * uStartRadius;
  vec3 p = mix(start, target, m);
  p.y += sin(m * 3.14159) * uStartRadius * 0.7 * (0.4 + aRand);   // arc upward in flight
  p.xy += vec2(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 31.0)) * 0.005 * uScale * m;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixel * (0.7 + aRand * 0.6);
  vAlpha = smoothstep(0.0, 0.2, m);
  vRand = aRand;
}`;

const numberFragment = /* glsl */ `
varying float vAlpha; varying float vRand;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 col = vRand < 0.62 ? vec3(0.231, 0.118, 0.071) : (vRand < 0.9 ? vec3(0.725, 0.467, 0.227) : vec3(0.929, 0.114, 0.141));
  gl_FragColor = vec4(col, smoothstep(0.5, 0.25, d) * vAlpha);
}`;

function NumberParticles({ driver, count }: { driver: MutableRefObject<HeroDriver>; count: number }) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    void buildNumberGeometry(count).then((g) => {
      if (cancelled) g.dispose();
      else setGeometry(g);
    });
    return () => {
      cancelled = true;
    };
  }, [count]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: numberVertex,
        fragmentShader: numberFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uMorph: { value: 0 },
          uNum: { value: 0 },
          uTime: { value: 0 },
          uScale: { value: 1 },
          uStartRadius: { value: 1 },
          uPixel: { value: 3 },
          uTarget: { value: new THREE.Vector3() },
          uStart: { value: new THREE.Vector3() },
        },
      }),
    [],
  );
  useDisposable(useMemo(() => [material], [material]));

  useFrame((state) => {
    const d = driver.current;
    const g = group.current;
    if (!g) return;
    g.visible = d.morph > 0.001 && geometry !== null;
    if (!g.visible) return;
    // Lock to the camera so the numbers always sit square to the screen.
    g.position.copy(camera.position);
    g.quaternion.copy(camera.quaternion);
    const visH = 2 * NUM_DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * (size.width / Math.max(size.height, 1));
    const width = Math.min(visW * 0.84, visH * 1.2);
    const u = material.uniforms;
    u.uScale!.value = width;
    (u.uTarget!.value as THREE.Vector3).set(0, visH * 0.09, -NUM_DIST);
    (u.uStart!.value as THREE.Vector3).set(0, -visH * 0.3, -NUM_DIST);
    u.uStartRadius!.value = Math.min(visW, visH) * 0.2;
    u.uMorph!.value = d.morph;
    u.uNum!.value = d.num;
    u.uTime!.value = state.clock.elapsedTime;
    u.uPixel!.value = dpr * (size.width < 640 ? 2.8 : 3.8);
  });

  return <group ref={group}>{geometry && <points geometry={geometry} material={material} frustumCulled={false} renderOrder={10} />}</group>;
}

/* ───────────────────────── Chapter 2: labels projected from the 3D layers ───────────────────────── */

function AnatomyLabels({ driver, layers, labelsRef }: {
  driver: MutableRefObject<HeroDriver>;
  layers: MutableRefObject<LayerRefs>;
  labelsRef: MutableRefObject<(HTMLElement | null)[]>;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => ({ p: new THREE.Vector3(), right: new THREE.Vector3(), ws: new THREE.Vector3() }), []);
  const dims = useRef<{ w: number; h: number }[]>([]);

  useFrame(() => {
    const d = driver.current;
    const { assembly, shell, core, base } = layers.current;
    if (!assembly) return;
    assembly.getWorldScale(v.ws);
    const R = 1.18 * v.ws.x;
    v.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const wide = d.wide > 0.5;
    [shell, core, base].forEach((o, i) => {
      const el = labelsRef.current[i];
      if (!el || !o) return;
      const op = clamp01((d.labels - i * 0.22) / 0.4);
      if (op < 0.01) {
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";
      el.style.opacity = op.toFixed(3);
      const [dot, line, chip] = Array.from(el.children) as HTMLElement[];
      if (!dot || !line || !chip) return;
      if (!dims.current[i]) dims.current[i] = { w: chip.offsetWidth, h: chip.offsetHeight };
      const { w, h } = dims.current[i]!;
      // Wide screens: every label to the left of the pie. Phones: alternate sides.
      const side = wide ? -1 : i === 1 ? 1 : -1;
      o.getWorldPosition(v.p).addScaledVector(v.right, side * R).project(camera);
      const x = ((v.p.x + 1) / 2) * size.width;
      const y = ((1 - v.p.y) / 2) * size.height;
      const len = (wide ? 96 : 18) * (0.6 + 0.4 * op); // leader line draws out as it fades in
      let chipX = side < 0 ? x - len - w : x + len;
      chipX = Math.min(Math.max(chipX, 12), size.width - w - 12);
      const lineX = side < 0 ? chipX + w : x;
      const lineW = Math.max(0, side < 0 ? x - lineX : chipX - x);
      dot.style.transform = `translate3d(${x - 5}px, ${y - 5}px, 0)`;
      line.style.transform = `translate3d(${lineX}px, ${y}px, 0)`;
      line.style.width = `${lineW}px`;
      chip.style.transform = `translate3d(${chipX}px, ${y - h / 2}px, 0)`;
    });
  });
  return null;
}

/* ───────────────────────── Rig: layers, parallax, spline camera ───────────────────────── */

function Rig({ driver, still, layers }: { driver: MutableRefObject<HeroDriver>; still: boolean; layers: MutableRefObject<LayerRefs> }) {
  const fg = useRef<THREE.Group>(null);
  const mid = useRef<THREE.Group>(null);
  const bg = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const curves = useMemo(() => {
    const make = (pts: [number, number, number][]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    return {
      wide: { pos: make(cameraPath.wide.pos), look: make(cameraPath.wide.look) },
      narrow: { pos: make(cameraPath.narrow.pos), look: make(cameraPath.narrow.look) },
    };
  }, []);
  const v = useMemo(
    () => ({
      a: new THREE.Vector3(), b: new THREE.Vector3(), pos: new THREE.Vector3(),
      look: new THREE.Vector3(), lookTarget: new THREE.Vector3(), off: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const d = driver.current;
    const k = still ? 1 : 1 - Math.exp(-4 * delta);
    const px = still ? 0 : d.tiltX || state.pointer.x;
    const py = still ? 0 : d.tiltY || state.pointer.y;

    // Parallax speeds: foreground fast, midground medium, background slow.
    if (fg.current) {
      fg.current.position.x = THREE.MathUtils.lerp(fg.current.position.x, -px * 0.75, k);
      // fg 0→1: parallax travel (reduced on phones); fg 1→2.2: the treats leave the frame on every screen.
      const travel = Math.min(d.fg, 1) * 3.4 * d.fgScale + Math.max(0, d.fg - 1) * 6;
      fg.current.position.y = THREE.MathUtils.lerp(fg.current.position.y, -py * 0.5 + travel, k);
    }
    if (mid.current) {
      mid.current.position.x = THREE.MathUtils.lerp(mid.current.position.x, -px * 0.22, k);
      mid.current.position.y = THREE.MathUtils.lerp(mid.current.position.y, -py * 0.15, k);
    }
    if (bg.current) {
      bg.current.position.x = THREE.MathUtils.lerp(bg.current.position.x, px * 0.18, k);
      bg.current.position.y = THREE.MathUtils.lerp(bg.current.position.y, py * 0.12, k);
    }

    // Camera: glide along the chapter spline (blended between wide and phone framings).
    const t = clamp01(d.path / 3);
    v.pos.lerpVectors(curves.narrow.pos.getPoint(t, v.a), curves.wide.pos.getPoint(t, v.b), d.wide);
    v.lookTarget.lerpVectors(curves.narrow.look.getPoint(t, v.a), curves.wide.look.getPoint(t, v.b), d.wide);
    v.off.subVectors(v.pos, v.lookTarget);
    v.off.z += d.zoom; // category focus pulls the camera in
    // Portrait screens: back the camera off so the pie (r ≈ 1.3) always fits the width.
    const aspect = size.width / Math.max(size.height, 1);
    v.off.multiplyScalar(aspect < 1.1 ? Math.min(2.2, 0.85 / aspect) : 1);
    // Category focus shifts the whole framing sideways.
    v.lookTarget.x += d.focusX;
    v.lookTarget.y += d.focusY;
    v.lookTarget.z += d.focusZ;
    camera.position.lerp(v.a.addVectors(v.lookTarget, v.off), k);
    v.look.lerp(v.lookTarget, k);
    camera.lookAt(v.look);
  });

  return (
    <>
      <group ref={bg}>
        <JoyArcs driver={driver} still={still} />
        <DepthParticles still={still} />
      </group>

      <group ref={mid}>
        <ChocoPie driver={driver} still={still} layers={layers} />
        {/* Confectionery cluster (focus target) */}
        <group position={[4.8, -0.2, -0.6]}>
          <Candy color={P.coffee} band={P.caramel} position={[0, 0.35, 0]} rotation={[0.3, 0.6, 0.2]} />
          <Candy color={P.red} band="#F2C14E" position={[-0.55, -0.35, 0.3]} rotation={[-0.2, -0.4, 0.5]} scale={0.85} />
          <Candy color={P.caramel} band={P.ivory} position={[0.6, -0.45, -0.2]} rotation={[0.5, 0.2, -0.6]} scale={0.8} />
        </group>
        {/* Pepero cluster (focus target) */}
        <group position={[-6.6, 0.15, -0.6]}>
          {[-0.28, 0, 0.28, 0.5].map((x, i) => (
            <PeperoStick key={i} position={[x, (i % 2) * 0.12, 0]} rotation={[0, 0, (x - 0.1) * 0.35]} />
          ))}
        </group>
      </group>

      <group ref={fg}>
        <Candy color={P.coffee} band={P.caramel} position={[3.2, 1.6, 1.8]} rotation={[0.6, 0.2, 0.9]} scale={0.55} />
        <Candy color={P.red} band={P.ivory} position={[-2.7, -1.6, 2]} rotation={[-0.4, 0.7, -0.3]} scale={0.6} />
        <PeperoStick position={[1.7, -2.7, 2.2]} rotation={[0.3, 0.2, 0.9]} />
        <PeperoStick position={[2.3, -1.5, 2.4]} rotation={[-0.2, -0.3, -1.1]} />
        <CocoaCrumbs />
      </group>
    </>
  );
}

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.7} castShadow />
      {/* Warm back light: a bright rim along the chocolate's edge */}
      <directionalLight position={[-2.5, 3, -5]} intensity={2.2} color="#FFE2C2" />
      <pointLight position={[-4, 1.5, -2]} intensity={14} color={P.red} distance={12} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 4, 3]} scale={[7, 2, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} position={[-4, 1, 2]} scale={[2, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.8} color={P.caramel} position={[4, 0, -2]} scale={2} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.8} position={[0, -3, 2]} scale={[6, 1, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

/** Hands R3F's `invalidate` to the parent so GSAP can request a frame when rendering on demand. */
function Invalidator({ fnRef }: { fnRef: MutableRefObject<(() => void) | null> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    fnRef.current = invalidate;
    return () => {
      fnRef.current = null;
    };
  }, [invalidate, fnRef]);
  return null;
}

interface HeroDioramaProps {
  driver: MutableRefObject<HeroDriver>;
  invalidateRef: MutableRefObject<(() => void) | null>;
  /** DOM label elements (dot, leader line, chip) positioned from the 3D layers each frame. */
  labelsRef: MutableRefObject<(HTMLElement | null)[]>;
  /** Reduced motion: render on demand, no idle motion, no particles. */
  still: boolean;
  /** Off-screen: stop the render loop. */
  active: boolean;
}

export default function HeroDiorama({ driver, invalidateRef, labelsRef, still, active }: HeroDioramaProps) {
  // Adaptive quality: drop to 1× pixel ratio and skip contact shadows if frames start to slip.
  const [low, setLow] = useState(false);
  const layers = useRef<LayerRefs>({ assembly: null, shell: null, core: null, base: null });
  const particleCount = useMemo(() => {
    const narrow = window.innerWidth < 768;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    return Math.round((narrow ? 2400 : 5200) * (weak ? 0.6 : 1));
  }, []);

  return (
    <Canvas
      dpr={low ? 1 : [1, 2]}
      frameloop={active && !still ? "always" : "demand"}
      camera={{ position: [0, 0.35, 7.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setLow(true)} />
      <Invalidator fnRef={invalidateRef} />
      <StudioLighting />
      <Rig driver={driver} still={still} layers={layers} />
      {!still && <NumberParticles driver={driver} count={particleCount} />}
      <AnatomyLabels driver={driver} layers={layers} labelsRef={labelsRef} />
      {!low && <ContactShadows position={[0, -1.35, 0]} opacity={0.35} scale={8} blur={2.8} far={3} color={P.cocoa} />}
    </Canvas>
  );
}
