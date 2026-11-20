// Babylon.js "Confectionery Studio" — a framework-free factory so its lifecycle is explicit:
// createStudio() builds engine + scene, returns a controller, and controller.dispose() tears
// everything down (render loop, observers, scene, engine, GPU resources).
// Deep imports keep this lazy chunk lean; side-effect imports register the engine features we use.

import "@babylonjs/core/Engines/Extensions/engine.renderTarget";
import "@babylonjs/core/Engines/Extensions/engine.renderTargetCube";
import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Layers/glowLayer";
import "@babylonjs/core/Probes/reflectionProbe";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { ReflectionProbe } from "@babylonjs/core/Probes/reflectionProbe";
import { Scene } from "@babylonjs/core/scene";

export type StudioProduct = "choco-pie" | "pepero" | "coffy-bite" | "caramilk";
export type StudioPreset = "warm-morning" | "diwali-gold" | "crisp-editorial";

export interface StudioController {
  setProduct(p: StudioProduct): void;
  setPreset(p: StudioPreset): void;
  /** Orbit by a step (keyboard / button alternative to dragging). */
  rotate(direction: -1 | 1): void;
  zoom(direction: -1 | 1): void;
  reset(): void;
  setActive(active: boolean): void;
  dispose(): void;
}

interface Options {
  reducedMotion: boolean;
}

const C = (hex: string) => Color3.FromHexString(hex);

// Each product sits on the plinth; the camera eases to its framing.
const framing: Record<StudioProduct, { target: Vector3; radius: number }> = {
  "choco-pie": { target: new Vector3(0, 0.15, 0), radius: 4.2 },
  pepero: { target: new Vector3(0, 0.75, 0), radius: 4.9 },
  "coffy-bite": { target: new Vector3(0, 0.5, 0), radius: 4.6 },
  caramilk: { target: new Vector3(0, 0.3, 0), radius: 4.1 },
};

interface PresetDef {
  clear: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  key: string;
  keyIntensity: number;
  softboxes: [string, string, string];
  backdrop: string;
  glow: number;
  diyas: boolean;
}

const presets: Record<StudioPreset, PresetDef> = {
  "warm-morning": {
    clear: "#F7F2EA", hemiSky: "#FFF1DC", hemiGround: "#E9D7BF", hemi: 0.75,
    key: "#FFD9A8", keyIntensity: 2.4, softboxes: ["#FFE7C7", "#FFFFFF", "#FFC98A"],
    backdrop: "#F4E9DA", glow: 0.15, diyas: false,
  },
  "diwali-gold": {
    clear: "#2A120B", hemiSky: "#FFB54D", hemiGround: "#3B1E12", hemi: 0.35,
    key: "#FFB347", keyIntensity: 2.8, softboxes: ["#FF9E2C", "#FFD27A", "#ED1D24"],
    backdrop: "#3B1E12", glow: 0.9, diyas: true,
  },
  "crisp-editorial": {
    clear: "#FFFFFF", hemiSky: "#FFFFFF", hemiGround: "#DADDE2", hemi: 0.95,
    key: "#FFFFFF", keyIntensity: 1.8, softboxes: ["#FFFFFF", "#EEF3FF", "#FFFFFF"],
    backdrop: "#F2F2F2", glow: 0.1, diyas: false,
  },
};

/** A text label baked into a DynamicTexture (pack artwork). */
function labelMaterial(scene: Scene, name: string, bg: string, lines: Array<{ text: string; font: string; color: string; y: number }>) {
  const tex = new DynamicTexture(`${name}-tex`, { width: 1024, height: 512 }, scene, true);
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.textAlign = "center";
  for (const l of lines) {
    ctx.font = l.font;
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, 512, l.y);
  }
  tex.update();
  const mat = new PBRMaterial(`${name}-mat`, scene);
  mat.albedoTexture = tex;
  mat.metallic = 0;
  mat.roughness = 0.35;
  mat.clearCoat.isEnabled = true;
  mat.clearCoat.intensity = 0.6;
  return mat;
}

function pbr(scene: Scene, name: string, hex: string, roughness: number, opts: Partial<{ metallic: number; clearCoat: number; alpha: number }> = {}) {
  const m = new PBRMaterial(name, scene);
  m.albedoColor = C(hex);
  m.metallic = opts.metallic ?? 0;
  m.roughness = roughness;
  if (opts.clearCoat) {
    m.clearCoat.isEnabled = true;
    m.clearCoat.intensity = opts.clearCoat;
  }
  if (opts.alpha !== undefined) {
    m.alpha = opts.alpha;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  }
  return m;
}

export function createStudio(canvas: HTMLCanvasElement, { reducedMotion }: Options): StudioController {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true }, true);
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2));
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString("#F7F2EAFF");

  // ── Camera: arc-rotate with inertia; wheel zoom removed so page scrolling is never hijacked ──
  const camera = new ArcRotateCamera("cam", -Math.PI / 2.4, Math.PI / 2.55, 4.4, framing["choco-pie"].target.clone(), scene);
  camera.lowerRadiusLimit = 2.6;
  camera.upperRadiusLimit = 7;
  camera.lowerBetaLimit = 0.35;
  camera.upperBetaLimit = Math.PI / 2.05; // never dip below the plinth
  camera.inertia = reducedMotion ? 0 : 0.9;
  camera.angularSensibilityX = 1600;
  camera.angularSensibilityY = 1600;
  camera.panningSensibility = 0; // orbit only
  camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
  camera.attachControl(canvas, true);
  camera.minZ = 0.05;

  // ── Lights ──
  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  const key = new DirectionalLight("key", new Vector3(-0.6, -1.2, -0.8), scene);
  key.position = new Vector3(4, 6, 4);

  // ── Studio set: cyclorama backdrop, plinth, contact shadow, overhead softboxes ──
  const backdropMat = new StandardMaterial("backdrop-mat", scene);
  backdropMat.specularColor = Color3.Black();
  // Seamless "infinity cove": a large floor disc dissolving into fog that matches the clear colour.
  const floor = MeshBuilder.CreateDisc("floor", { radius: 40, tessellation: 64 }, scene);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -0.8;
  floor.material = backdropMat;
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.055;

  const plinthMat = pbr(scene, "plinth-mat", "#FFF9F0", 0.55);
  const plinth = MeshBuilder.CreateCylinder("plinth", { diameter: 2.8, height: 0.8, tessellation: 96 }, scene);
  plinth.position.y = -0.4;
  plinth.material = plinthMat;

  const shadowTex = new DynamicTexture("shadow-tex", { width: 256, height: 256 }, scene, false);
  const sctx = shadowTex.getContext() as unknown as CanvasRenderingContext2D;
  const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "rgba(59,30,18,0.45)");
  grad.addColorStop(1, "rgba(59,30,18,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  shadowTex.hasAlpha = true;
  shadowTex.update();
  const shadowMat = new StandardMaterial("shadow-mat", scene);
  shadowMat.diffuseTexture = shadowTex;
  shadowMat.useAlphaFromDiffuseTexture = true;
  shadowMat.disableLighting = true;
  shadowMat.emissiveColor = Color3.White();
  const shadow = MeshBuilder.CreateGround("shadow", { width: 2.4, height: 2.4 }, scene);
  shadow.position.y = 0.005;
  shadow.material = shadowMat;

  // Softboxes are what the PBR materials reflect (captured by a reflection probe — no HDRI download).
  const softboxMats = [0, 1, 2].map((i) => {
    const m = new StandardMaterial(`softbox-${i}`, scene);
    m.disableLighting = true;
    return m;
  });
  const softboxes = [
    MeshBuilder.CreatePlane("sb0", { width: 6, height: 2 }, scene),
    MeshBuilder.CreatePlane("sb1", { width: 3, height: 5 }, scene),
    MeshBuilder.CreatePlane("sb2", { width: 3, height: 5 }, scene),
  ];
  softboxes[0]!.position.set(0, 6, 0.5);
  softboxes[0]!.rotation.x = Math.PI / 2;
  softboxes[1]!.position.set(-5, 2.5, -1);
  softboxes[1]!.rotation.y = -Math.PI / 2.3;
  softboxes[2]!.position.set(5, 2.5, 1);
  softboxes[2]!.rotation.y = Math.PI / 2.3;
  softboxes.forEach((s, i) => {
    s.material = softboxMats[i]!;
    // Hidden from the viewer's camera (default mask 0x0FFFFFFF) but still captured by the
    // reflection probe, whose explicit renderList bypasses layer-mask checks.
    s.layerMask = 0x10000000;
  });

  const probe = new ReflectionProbe("probe", 256, scene);
  probe.position = new Vector3(0, 0.8, 0);
  probe.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
  [floor, ...softboxes].forEach((m) => probe.renderList?.push(m));
  scene.environmentTexture = probe.cubeTexture;
  scene.environmentIntensity = 0.9;

  // Diwali diyas: small glowing lamps around the plinth (only lit in the festive preset).
  const glow = new GlowLayer("glow", scene, { blurKernelSize: 48 });
  const diyaMat = new StandardMaterial("diya-mat", scene);
  diyaMat.emissiveColor = C("#FFB347");
  diyaMat.disableLighting = true;
  const diyas = Array.from({ length: 8 }, (_, i) => {
    const d = MeshBuilder.CreateSphere(`diya-${i}`, { diameter: 0.09, segments: 12 }, scene);
    const a = (i / 8) * Math.PI * 2;
    d.position.set(Math.cos(a) * 1.6, 0.06, Math.sin(a) * 1.6);
    d.material = diyaMat;
    d.setEnabled(false); // lit only by the Diwali preset
    return d;
  });

  // ── Products ──
  const root = (name: string) => new TransformNode(name, scene);
  const nodes: Record<StudioProduct, TransformNode> = {
    "choco-pie": root("choco-pie"),
    pepero: root("pepero"),
    "coffy-bite": root("coffy-bite"),
    caramilk: root("caramilk"),
  };
  const parent = (m: Mesh, n: TransformNode) => {
    m.parent = n;
    return m;
  };

  // Choco Pie box + a pie resting in front
  {
    const n = nodes["choco-pie"];
    const box = parent(MeshBuilder.CreateBox("cp-box", { width: 1.7, height: 0.55, depth: 1.25 }, scene), n);
    box.position.y = 0.28;
    box.material = pbr(scene, "cp-box-mat", "#ED1D24", 0.32, { clearCoat: 0.8 });
    const top = parent(MeshBuilder.CreatePlane("cp-label", { width: 1.5, height: 0.75 }, scene), n);
    top.position.set(0, 0.561, 0);
    top.rotation.x = Math.PI / 2;
    top.material = labelMaterial(scene, "cp", "#ED1D24", [
      { text: "LOTTE", font: "bold 90px sans-serif", color: "#FFFFFF", y: 170 },
      { text: "Choco Pie", font: "italic bold 150px serif", color: "#FFFFFF", y: 330 },
      { text: "INDIA'S No.1 CHOCO PIE", font: "600 44px sans-serif", color: "#FFE6C7", y: 430 },
    ]);
    const pie = parent(MeshBuilder.CreateCylinder("cp-pie", { diameter: 0.85, height: 0.2, tessellation: 64 }, scene), n);
    pie.position.set(0.55, 0.66, 0.15);
    pie.rotation.x = -0.25;
    pie.material = pbr(scene, "cp-pie-mat", "#3B1E12", 0.3, { clearCoat: 1 });
    const seam = parent(MeshBuilder.CreateTorus("cp-seam", { diameter: 0.86, thickness: 0.05, tessellation: 64 }, scene), n);
    seam.position.copyFrom(pie.position);
    seam.rotation.x = -0.25;
    seam.material = pbr(scene, "cp-seam-mat", "#FFF9F0", 0.9);
  }

  // Pepero pack with sticks
  {
    const n = nodes.pepero;
    const pack = parent(MeshBuilder.CreateBox("pp-pack", { width: 0.7, height: 1.7, depth: 0.28 }, scene), n);
    pack.position.y = 0.85;
    pack.material = pbr(scene, "pp-pack-mat", "#C8102E", 0.35, { clearCoat: 0.7 });
    const face = parent(MeshBuilder.CreatePlane("pp-face", { width: 0.62, height: 1.0 }, scene), n);
    face.position.set(0, 0.8, -0.141);
    face.material = labelMaterial(scene, "pp", "#C8102E", [
      { text: "LOTTE", font: "bold 80px sans-serif", color: "#FFFFFF", y: 160 },
      { text: "Pepero", font: "italic bold 170px serif", color: "#FFFFFF", y: 340 },
      { text: "ORIGINAL", font: "600 52px sans-serif", color: "#FFD27A", y: 440 },
    ]);
    const biscuit = pbr(scene, "pp-biscuit", "#D9A867", 0.75);
    const choco = pbr(scene, "pp-choco", "#3B1E12", 0.28, { clearCoat: 0.8 });
    [-0.2, -0.07, 0.06, 0.19].forEach((x, i) => {
      const stick = parent(MeshBuilder.CreateCylinder(`pp-stick-${i}`, { diameter: 0.07, height: 0.5, tessellation: 16 }, scene), n);
      stick.position.set(x, 1.85 + (i % 2) * 0.08, 0);
      stick.material = biscuit;
      const coat = parent(MeshBuilder.CreateCylinder(`pp-coat-${i}`, { diameter: 0.085, height: 0.3, tessellation: 16 }, scene), n);
      coat.position.set(x, 1.68 + (i % 2) * 0.08, 0);
      coat.material = choco;
    });
  }

  // Coffy Bite jar full of wrapped candies
  {
    const n = nodes["coffy-bite"];
    const glass = parent(MeshBuilder.CreateCylinder("cb-jar", { diameter: 1.15, height: 1.35, tessellation: 64 }, scene), n);
    glass.position.y = 0.68;
    glass.material = pbr(scene, "cb-glass", "#FFFFFF", 0.05, { alpha: 0.22 });
    const lid = parent(MeshBuilder.CreateCylinder("cb-lid", { diameter: 1.2, height: 0.22, tessellation: 64 }, scene), n);
    lid.position.y = 1.46;
    lid.material = pbr(scene, "cb-lid-mat", "#5C3422", 0.4, { clearCoat: 0.6 });
    const band = parent(MeshBuilder.CreateCylinder("cb-band", { diameter: 1.17, height: 0.42, tessellation: 64 }, scene), n);
    band.position.y = 0.7;
    band.material = labelMaterial(scene, "cb", "#5C3422", [
      { text: "Coffy Bite", font: "italic bold 150px serif", color: "#F7E0B5", y: 250 },
      { text: "COFFEE OR TOFFEE?", font: "600 54px sans-serif", color: "#D98A2B", y: 370 },
    ]);
    const wrapA = pbr(scene, "cb-wrap-a", "#5C3422", 0.2, { clearCoat: 1 });
    const wrapB = pbr(scene, "cb-wrap-b", "#D98A2B", 0.2, { clearCoat: 1 });
    for (let i = 0; i < 16; i++) {
      const c = parent(MeshBuilder.CreateCapsule(`cb-candy-${i}`, { radius: 0.09, height: 0.32, tessellation: 12 }, scene), n);
      const a = i * 2.4;
      c.position.set(Math.cos(a) * 0.32 * ((i % 3) / 3 + 0.4), 0.18 + (i / 16) * 0.95, Math.sin(a) * 0.3 * ((i % 3) / 3 + 0.4));
      c.rotation.set(i, i * 0.7, Math.PI / 2 + i * 0.3);
      c.material = i % 2 ? wrapA : wrapB;
    }
  }

  // Caramilk — one oversized twist-wrapped toffee
  {
    const n = nodes.caramilk;
    const yellow = pbr(scene, "cm-wrap", "#F0D830", 0.22, { clearCoat: 1 });
    const purple = pbr(scene, "cm-band", "#603078", 0.3, { clearCoat: 0.8 });
    const body = parent(MeshBuilder.CreateCapsule("cm-body", { radius: 0.38, height: 1.5, tessellation: 32 }, scene), n);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.45;
    body.material = yellow;
    const bandMesh = parent(MeshBuilder.CreateCylinder("cm-bandmesh", { diameter: 0.785, height: 0.22, tessellation: 48 }, scene), n);
    bandMesh.rotation.z = Math.PI / 2;
    bandMesh.position.y = 0.45;
    bandMesh.material = purple;
    [1, -1].forEach((dir) => {
      const twist = parent(MeshBuilder.CreateCylinder(`cm-twist-${dir}`, { diameterTop: 0.62, diameterBottom: 0.04, height: 0.45, tessellation: 24 }, scene), n);
      twist.rotation.z = dir * -Math.PI / 2;
      twist.position.set(dir * 1.0, 0.45, 0);
      twist.material = yellow;
    });
  }

  // Only the diyas should bloom — not the emissive shadow decal or the softboxes.
  glow.addExcludedMesh(shadow);
  softboxes.forEach((s) => glow.addExcludedMesh(s));

  // Parse preset colours once (the render loop only lerps).
  const presetColors = Object.fromEntries(
    (Object.keys(presets) as StudioPreset[]).map((k) => {
      const p = presets[k];
      return [k, { clear: C(p.clear), hemiSky: C(p.hemiSky), hemiGround: C(p.hemiGround), key: C(p.key), backdrop: C(p.backdrop), softboxes: p.softboxes.map(C) }];
    }),
  ) as Record<StudioPreset, { clear: Color3; hemiSky: Color3; hemiGround: Color3; key: Color3; backdrop: Color3; softboxes: Color3[] }>;
  const tmpTarget = new Vector3();

  // ── State & per-frame easing (all transitions handled here; instant under reduced motion) ──
  let current: StudioProduct = "choco-pie";
  let presetKey: StudioPreset = "warm-morning";
  let targetPreset = presets[presetKey];
  const colorState = {
    clear: C(targetPreset.clear),
    hemiSky: C(targetPreset.hemiSky),
    hemiGround: C(targetPreset.hemiGround),
    key: C(targetPreset.key),
    backdrop: C(targetPreset.backdrop),
    softboxes: targetPreset.softboxes.map(C),
  };
  let hemiI = targetPreset.hemi;
  let keyI = targetPreset.keyIntensity;
  let glowI = targetPreset.glow;
  let lastInteraction = performance.now();
  let probeDirty = true;

  const applyProductVisibility = () => {
    (Object.keys(nodes) as StudioProduct[]).forEach((k) => nodes[k].setEnabled(k === current));
    nodes[current].scaling.setAll(reducedMotion ? 1 : 0.86);
  };
  applyProductVisibility();

  const markInteraction = () => (lastInteraction = performance.now());
  canvas.addEventListener("pointerdown", markInteraction);
  canvas.addEventListener("keydown", markInteraction);

  const beforeRender = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
    const k = reducedMotion ? 1 : 1 - Math.exp(-5 * dt);
    const p = targetPreset;
    const pc = presetColors[presetKey];

    // Lighting preset cross-fade
    Color3.LerpToRef(colorState.clear, pc.clear, k, colorState.clear);
    Color3.LerpToRef(colorState.hemiSky, pc.hemiSky, k, colorState.hemiSky);
    Color3.LerpToRef(colorState.hemiGround, pc.hemiGround, k, colorState.hemiGround);
    Color3.LerpToRef(colorState.key, pc.key, k, colorState.key);
    Color3.LerpToRef(colorState.backdrop, pc.backdrop, k, colorState.backdrop);
    colorState.softboxes.forEach((c, i) => Color3.LerpToRef(c, pc.softboxes[i]!, k, c));
    hemiI += (p.hemi - hemiI) * k;
    keyI += (p.keyIntensity - keyI) * k;
    glowI += (p.glow - glowI) * k;

    scene.clearColor.set(colorState.clear.r, colorState.clear.g, colorState.clear.b, 1);
    scene.fogColor.copyFrom(colorState.clear);
    hemi.diffuse.copyFrom(colorState.hemiSky);
    hemi.groundColor.copyFrom(colorState.hemiGround);
    hemi.intensity = hemiI;
    key.diffuse.copyFrom(colorState.key);
    key.intensity = keyI;
    backdropMat.diffuseColor.copyFrom(colorState.backdrop);
    softboxMats.forEach((m, i) => (m.emissiveColor = colorState.softboxes[i]!));
    glow.intensity = glowI;

    // Re-capture reflections while a preset is fading in (cheap: 256px cube, a few meshes)
    if (probeDirty) {
      probe.cubeTexture.resetRefreshCounter();
      if (Math.abs(p.hemi - hemiI) < 0.01) probeDirty = false;
    }

    // Product entrance + camera framing
    const node = nodes[current];
    const s = node.scaling.x + (1 - node.scaling.x) * k;
    node.scaling.setAll(s);
    const f = framing[current];
    if (Vector3.DistanceSquared(camera.target, f.target) > 1e-6) {
      Vector3.LerpToRef(camera.target, f.target, k, tmpTarget);
      camera.target = tmpTarget.clone();
    }

    // Idle auto-rotate after 3 s without interaction (never under reduced motion)
    if (!reducedMotion && performance.now() - lastInteraction > 3000) camera.alpha += dt * 0.25;
  });

  let running = false;
  const start = () => {
    if (running) return;
    running = true;
    engine.runRenderLoop(() => scene.render());
  };
  const stop = () => {
    running = false;
    engine.stopRenderLoop();
  };
  const onResize = () => engine.resize();
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);
  start();

  return {
    setProduct(p) {
      if (p === current) return;
      current = p;
      applyProductVisibility();
      camera.radius = framing[p].radius;
      markInteraction();
      probeDirty = true;
    },
    setPreset(p) {
      presetKey = p;
      targetPreset = presets[p];
      diyas.forEach((d) => d.setEnabled(targetPreset.diyas));
      probeDirty = true;
    },
    rotate(direction) {
      camera.alpha += direction * (Math.PI / 6);
      markInteraction();
    },
    zoom(direction) {
      camera.radius = Math.min(camera.upperRadiusLimit ?? 7, Math.max(camera.lowerRadiusLimit ?? 2.6, camera.radius + direction * 0.6));
      markInteraction();
    },
    reset() {
      camera.alpha = -Math.PI / 2.4;
      camera.beta = Math.PI / 2.55;
      camera.radius = framing[current].radius;
      markInteraction();
    },
    setActive(active) {
      if (active) start();
      else stop();
    },
    dispose() {
      stop();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", markInteraction);
      canvas.removeEventListener("keydown", markInteraction);
      scene.onBeforeRenderObservable.remove(beforeRender);
      camera.detachControl();
      scene.dispose(); // meshes, materials, textures, probe, glow layer
      engine.dispose(); // GL context & buffers
    },
  };
}
