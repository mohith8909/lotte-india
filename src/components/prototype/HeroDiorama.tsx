"use client";

// "The Little Circle of Joy" — R3F hero diorama.
// Owns: procedural PBR confectionery, studio lighting, three depth layers, pointer + scroll parallax.
// Does NOT own scroll logic: GSAP writes to `driver`, this file only reads it inside useFrame.

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { heroPalette as P, type HeroDriver } from "./driver";

const MAX_TILT = THREE.MathUtils.degToRad(8); // ±8° pitch/yaw toward the cursor

/* ───────────────────────── Procedural geometry ───────────────────────── */

/** Lathe a profile of [radius, height] points into a smooth solid of revolution. */
function lathe(points: Array<[number, number]>, segments = 96) {
  const g = new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments);
  g.computeVertexNormals();
  return g;
}

/** Dispose geometries we created ourselves when the component unmounts. */
function useDisposable<T extends { dispose: () => void }>(items: T[]) {
  useEffect(() => () => items.forEach((i) => i.dispose()), [items]);
}

/* ───────────────────────── Midground: the Choco Pie ───────────────────────── */

function ChocoPie({ driver, still }: { driver: MutableRefObject<HeroDriver>; still: boolean }) {
  const assembly = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const base = useRef<THREE.Mesh>(null);
  const idle = useRef(0); // accumulated idle spin, kept separate from the scroll-driven spin

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
    return { shellG, coreG, baseG, drizzles };
  }, []);
  useDisposable(useMemo(() => [geos.shellG, geos.coreG, geos.baseG, ...geos.drizzles], [geos]));

  useFrame((state, delta) => {
    const d = driver.current;
    const k = still ? 1 : 1 - Math.exp(-6 * delta); // frame-rate independent damping
    // Pointer tilt (no React state — direct mutation)
    if (assembly.current) {
      const tx = still ? 0 : -state.pointer.y * MAX_TILT;
      const ty = still ? 0 : state.pointer.x * MAX_TILT;
      assembly.current.rotation.x = THREE.MathUtils.lerp(assembly.current.rotation.x, 0.52 + tx, k);
      assembly.current.rotation.z = THREE.MathUtils.lerp(assembly.current.rotation.z, -ty * 0.6, k);
      if (!still) idle.current += delta * 0.12; // slow idle spin
      // Idle turn + scroll-driven turn (damped so fast flicks still feel smooth)
      assembly.current.rotation.y = THREE.MathUtils.lerp(assembly.current.rotation.y, idle.current + d.spin, k);
      // Intro: drop in from above and grow into place (GSAP drives `intro` with an elastic ease)
      const intro = d.intro;
      const bob = still ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      assembly.current.position.y = bob + (1 - intro) * 1.4;
      assembly.current.scale.setScalar(0.8 * (0.55 + 0.45 * intro));
    }
    // Exploded view: layers separate along the pie's own axis and tip apart for depth
    const e = d.explode;
    if (shell.current) {
      shell.current.position.y = THREE.MathUtils.lerp(shell.current.position.y, 0.24 + e * 0.8, k);
      shell.current.rotation.x = THREE.MathUtils.lerp(shell.current.rotation.x, -e * 0.16, k);
      shell.current.rotation.z = THREE.MathUtils.lerp(shell.current.rotation.z, e * 0.06, k);
    }
    if (core.current) {
      core.current.position.y = THREE.MathUtils.lerp(core.current.position.y, 0.13 + e * 0.15, k);
      // Pillowy marshmallow: a soft squash-and-stretch "breath" (volume-preserving)
      const breath = still ? 0 : Math.sin(state.clock.elapsedTime * 1.6) * 0.035;
      const sy = 1 + e * 0.05 + breath;
      const sxz = 1 + e * 0.03 - breath * 0.5;
      core.current.scale.set(sxz, THREE.MathUtils.lerp(core.current.scale.y, sy, k), sxz);
    }
    if (base.current) {
      base.current.position.y = THREE.MathUtils.lerp(base.current.position.y, 0 - e * 0.62, k);
      base.current.rotation.x = THREE.MathUtils.lerp(base.current.rotation.x, e * 0.12, k);
    }
  });

  return (
    <group ref={assembly} rotation={[0.52, 0, 0]} scale={0.44}>
      <group ref={shell} position={[0, 0.24, 0]}>
        <mesh geometry={geos.shellG} castShadow>
          <meshPhysicalMaterial color={P.cocoa} roughness={0.32} clearcoat={1} clearcoatRoughness={0.18} sheen={0.3} sheenColor="#7a3b25" />
        </mesh>
        {geos.drizzles.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshPhysicalMaterial color="#6B3424" roughness={0.25} clearcoat={1} />
          </mesh>
        ))}
      </group>
      <mesh ref={core} geometry={geos.coreG} position={[0, 0.13, 0]}>
        <meshPhysicalMaterial color={P.ivory} roughness={0.85} sheen={1} sheenColor="#ffffff" sheenRoughness={0.6} />
      </mesh>
      <mesh ref={base} geometry={geos.baseG} castShadow>
        <meshStandardMaterial color={P.biscuit} roughness={0.78} />
      </mesh>
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
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color(P.caramel), new THREE.Color(P.cocoa), new THREE.Color(P.red), new THREE.Color("#E8D9C4")];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = -2 - Math.random() * 6;
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
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      // Left-side crumbs stay low so the headline area remains clean.
      const y = side < 0 ? -1.1 - Math.random() * 1.4 : (Math.random() - 0.5) * 3.6;
      m.position.set(side * (2.2 + Math.random() * 2.2), y, 1.2 + Math.random() * 1.6);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      m.scale.setScalar(0.6 + Math.random() * 1.2);
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

/* ───────────────────────── Rig: layers, parallax, camera ───────────────────────── */

function Rig({ driver, still }: { driver: MutableRefObject<HeroDriver>; still: boolean }) {
  const fg = useRef<THREE.Group>(null);
  const mid = useRef<THREE.Group>(null);
  const bg = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const d = driver.current;
    const k = still ? 1 : 1 - Math.exp(-4 * delta);
    const px = still ? 0 : state.pointer.x;
    const py = still ? 0 : state.pointer.y;

    // Parallax speeds: foreground fast, midground medium, background slow.
    if (fg.current) {
      fg.current.position.x = THREE.MathUtils.lerp(fg.current.position.x, -px * 0.75, k);
      fg.current.position.y = THREE.MathUtils.lerp(fg.current.position.y, -py * 0.5 + d.fg * 3.2 * d.fgScale, k);
    }
    if (mid.current) {
      mid.current.position.x = THREE.MathUtils.lerp(mid.current.position.x, -px * 0.22, k);
      mid.current.position.y = THREE.MathUtils.lerp(mid.current.position.y, -py * 0.15, k);
    }
    if (bg.current) {
      bg.current.position.x = THREE.MathUtils.lerp(bg.current.position.x, px * 0.18, k);
      bg.current.position.y = THREE.MathUtils.lerp(bg.current.position.y, py * 0.12, k);
    }

    // Camera: scroll-scrubbed dolly + category focus, damped.
    const fx = d.focusX + d.baseX + d.panX * d.panScale;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, fx * 0.8, k);
    // Phones start with the pie lowered beneath the headline; as the headline scrolls away and the
    // layers separate, ease it back toward centre so the taller exploded stack stays in frame.
    const by = d.baseY * (1 - d.explode * 0.75);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, d.camY + d.focusY + by, k);
    // Portrait screens: back the camera off so the pie (r ≈ 1.3) always fits the width.
    const aspect = size.width / Math.max(size.height, 1);
    const fit = aspect < 1.1 ? Math.min(2.2, 0.85 / aspect) : 1;
    const dolly = 7.2 + (d.camZ - 7.2) * d.dollyScale; // 7.2 = resting distance
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, (dolly + d.zoom) * fit, k);
    look.lerp(target.set(fx, d.focusY + by, d.focusZ), k);
    camera.lookAt(look);
  });

  return (
    <>
      <group ref={bg}>
        <JoyArcs driver={driver} still={still} />
        <DepthParticles still={still} />
      </group>

      <group ref={mid}>
        <ChocoPie driver={driver} still={still} />
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
  /** Reduced motion or off-screen: render on demand, no idle motion. */
  still: boolean;
  active: boolean;
}

export default function HeroDiorama({ driver, invalidateRef, still, active }: HeroDioramaProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active && !still ? "always" : "demand"}
      camera={{ position: [0, 0.35, 7.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
      aria-hidden="true"
    >
      <Invalidator fnRef={invalidateRef} />
      <StudioLighting />
      <Rig driver={driver} still={still} />
      <ContactShadows position={[0, -1.35, 0]} opacity={0.35} scale={8} blur={2.8} far={3} color={P.cocoa} />
    </Canvas>
  );
}
