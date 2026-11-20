// Babylon.js "Confectionery Studio": a product shoot rendered live.
//
// createStudio() builds engine + scene and returns a controller; controller.dispose() tears everything
// down (render loop, listeners, scene, engine, GPU resources). The canvas is transparent: the page draws
// the backdrop (colour wash, giant product name) behind it, and the scene supplies a spot-lit floor that
// fades into that backdrop, with soft shadows and blurred reflections.
//
// Products are modelled from rounded primitives (rounded-box packs, lathed pies and jars, twist-wrapped
// toffees) with canvas-drawn pack print. Product changes play as a moment: the old product spins away, the
// new one drops in and lands with a scatter of crumbs. Lighting presets cross-fade.

import "@babylonjs/core/Engines/Extensions/engine.renderTarget";
import "@babylonjs/core/Engines/Extensions/engine.renderTargetCube";
import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Layers/glowLayer";
import "@babylonjs/core/Probes/reflectionProbe";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
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
  /** Entrance: the camera pulls back while the current product drops onto the floor. */
  enter(): void;
  setActive(active: boolean): void;
  dispose(): void;
}

interface Options {
  reducedMotion: boolean;
  /** Phones / low-end devices: no mirror floor, smaller shadow map and textures. */
  lite: boolean;
  /** CSS font-family strings for pack print (the site's own fonts). */
  serif: string;
  sans: string;
  /** Fired once, on the first drag of the canvas. */
  onFirstDrag?: () => void;
}

/** sRGB hex → linear (what PBR albedo expects), so brand colours render true. */
const L = (hex: string) => Color3.FromHexString(hex).toLinearSpace();
const S = (hex: string) => Color3.FromHexString(hex);

const ALPHA0 = -Math.PI / 2 - 0.42;
const BETA0 = Math.PI / 2.42;

const framing: Record<StudioProduct, { target: Vector3; radius: number }> = {
  "choco-pie": { target: new Vector3(0, 0.3, 0), radius: 5.0 },
  pepero: { target: new Vector3(0, 1.05, 0), radius: 5.5 },
  "coffy-bite": { target: new Vector3(0, 0.62, 0), radius: 4.8 },
  caramilk: { target: new Vector3(0, 0.22, 0), radius: 4.0 },
};

/** Size of the soft contact shadow under each product (1 = the Choco Pie carton). */
const footprint: Record<StudioProduct, number> = { "choco-pie": 1, pepero: 0.5, "coffy-bite": 0.62, caramilk: 0.7 };

const crumbColors: Record<StudioProduct, [string, string]> = {
  "choco-pie": ["#3A1C10", "#C98B4E"],
  pepero: ["#D9A867", "#3A1C10"],
  "coffy-bite": ["#6B3A22", "#D98A2B"],
  caramilk: ["#F0D830", "#E9C77A"],
};

interface PresetDef {
  floor: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  key: string;
  keyIntensity: number;
  keyPos: [number, number, number];
  rim: string;
  rimIntensity: number;
  softboxes: [string, string, string];
  /** PCSS light size: small = crisp shadow, large = soft. */
  penumbra: number;
  shadowDark: number;
  exposure: number;
  festive: boolean;
}

const presets: Record<StudioPreset, PresetDef> = {
  // Low, warm window light from the left; long soft shadow.
  "warm-morning": {
    floor: "#E6CDA8", hemiSky: "#FFE9CC", hemiGround: "#7A5232", hemi: 0.3,
    key: "#FFC98C", keyIntensity: 165, keyPos: [-4.2, 3.6, -2.4],
    rim: "#FFE7C4", rimIntensity: 3.4, softboxes: ["#FFD9A8", "#FFFFFF", "#FFB46B"],
    penumbra: 0.14, shadowDark: 0.12, exposure: 1.02, festive: false,
  },
  // Dark room: gold rim light, diyas and rising sparks.
  "diwali-gold": {
    floor: "#24100A", hemiSky: "#FF9E3D", hemiGround: "#0E0402", hemi: 0.12,
    key: "#FFA640", keyIntensity: 70, keyPos: [-3.4, 4.2, -2],
    rim: "#FFC266", rimIntensity: 6.5, softboxes: ["#FF9E2C", "#FFD27A", "#E73437"],
    penumbra: 0.1, shadowDark: 0.08, exposure: 1.08, festive: true,
  },
  // Hard top light, crisp shadow, cool fill.
  "crisp-editorial": {
    floor: "#E2E3E7", hemiSky: "#FFFFFF", hemiGround: "#8C909A", hemi: 0.4,
    key: "#FFFFFF", keyIntensity: 150, keyPos: [-0.6, 5.4, -1.2],
    rim: "#DCE6FF", rimIntensity: 3.6, softboxes: ["#FFFFFF", "#E8EFFF", "#FFFFFF"],
    penumbra: 0.025, shadowDark: 0.05, exposure: 1.0, festive: false,
  },
};

// ───────────────────────── geometry helpers ─────────────────────────

/** A box with every edge rounded (Minkowski sum of a box and a sphere), centred on the origin. */
function roundedBox(name: string, scene: Scene, w: number, h: number, d: number, r: number, segments = 28) {
  const vd = VertexData.CreateSphere({ diameter: 2, segments });
  const p = vd.positions as number[];
  const n = vd.normals as number[];
  const half = [w / 2 - r, h / 2 - r, d / 2 - r];
  for (let i = 0; i < p.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const nv = n[i + a]!;
      p[i + a] = nv * r + (nv > 1e-4 ? half[a]! : nv < -1e-4 ? -half[a]! : 0);
    }
  }
  const mesh = new Mesh(name, scene);
  vd.applyToMesh(mesh);
  return mesh;
}

/** Lathe from a list of [radius, height] pairs. */
function lathe(name: string, scene: Scene, profile: Array<[number, number]>, tessellation = 72) {
  return MeshBuilder.CreateLathe(name, { shape: profile.map(([x, y]) => new Vector3(x, y, 0)), tessellation, sideOrientation: Mesh.DOUBLESIDE }, scene);
}

// ───────────────────────── materials ─────────────────────────

function pbr(scene: Scene, name: string, hex: string, roughness: number, o: Partial<{ metallic: number; clearCoat: number; alpha: number }> = {}) {
  const m = new PBRMaterial(name, scene);
  m.albedoColor = L(hex);
  m.metallic = o.metallic ?? 0;
  m.roughness = roughness;
  if (o.clearCoat) {
    m.clearCoat.isEnabled = true;
    m.clearCoat.intensity = o.clearCoat;
    m.clearCoat.roughness = 0.08;
  }
  if (o.alpha !== undefined) {
    m.alpha = o.alpha;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  }
  return m;
}

type Ctx = CanvasRenderingContext2D;

/** Pack print drawn on a canvas; `draw` gets the 2D context at the texture's size. */
function printMaterial(scene: Scene, name: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void, o: { clearCoat?: number; roughness?: number } = {}) {
  const tex = new DynamicTexture(`${name}-tex`, { width: w, height: h }, scene, true);
  const ctx = tex.getContext() as unknown as Ctx;
  draw(ctx, w, h);
  tex.update(true);
  tex.anisotropicFilteringLevel = 8;
  const m = new PBRMaterial(`${name}-mat`, scene);
  m.albedoTexture = tex;
  m.metallic = 0;
  m.roughness = o.roughness ?? 0.32;
  m.clearCoat.isEnabled = true;
  m.clearCoat.intensity = o.clearCoat ?? 0.7;
  m.clearCoat.roughness = 0.06;
  return m;
}

/** Text with letter spacing (canvas letterSpacing isn't everywhere yet). */
function spaced(ctx: Ctx, text: string, x: number, y: number, spacing: number) {
  const chars = [...text];
  const width = chars.reduce((s, c) => s + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);
  let cx = x - width / 2;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  }
  ctx.textAlign = align;
}

/** The Lotte roundel: a ring with a solid dot, as on the packs. */
function roundel(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.22;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.05, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** An illustrated Choco Pie for pack print. */
function drawPie(ctx: Ctx, x: number, y: number, r: number) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.08, y + r * 0.62, r * 1.02, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  // side
  ctx.fillStyle = "#2A130A";
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.22, r, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // top
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, "#7A4528");
  g.addColorStop(0.55, "#4A2414");
  g.addColorStop(1, "#2E150B");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // drizzle
  ctx.strokeStyle = "#1E0C05";
  ctx.lineWidth = r * 0.06;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let row = -1; row <= 1; row++) {
    ctx.beginPath();
    const yy = y + row * r * 0.17;
    const span = r * (row === 0 ? 0.75 : 0.6);
    for (let i = 0; i <= 8; i++) {
      const xx = x - span + (i / 8) * span * 2;
      const py = yy + (i % 2 ? -1 : 1) * r * 0.06;
      if (i === 0) ctx.moveTo(xx, py);
      else ctx.lineTo(xx, py);
    }
    ctx.stroke();
  }
  // highlight
  ctx.strokeStyle = "rgba(255,230,200,0.35)";
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.92, r * 0.44, 0, Math.PI * 1.1, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

/** A soft radial alpha disc (floor fade, contact shadow). */
function radialTexture(scene: Scene, name: string, stops: Array<[number, string]>, size = 512) {
  const tex = new DynamicTexture(name, { width: size, height: size }, scene, false);
  const ctx = tex.getContext() as unknown as Ctx;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  tex.hasAlpha = true;
  tex.update();
  return tex;
}

// ───────────────────────── studio ─────────────────────────

export function createStudio(canvas: HTMLCanvasElement, opts: Options): StudioController {
  const { reducedMotion, lite, serif, sans } = opts;
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true, alpha: true, premultipliedAlpha: true, doNotHandleTouchAction: true }, true);
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0); // the page paints the backdrop
  const TEX = lite ? 1024 : 2048;

  // Colour: KHR PBR Neutral keeps brand colours (Lotte red) true while rolling off highlights.
  const ip = scene.imageProcessingConfiguration;
  ip.toneMappingEnabled = true;
  ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
  ip.exposure = 1;
  ip.contrast = 1.22;

  // ── Camera ── (wheel zoom removed so page scrolling is never hijacked)
  const camera = new ArcRotateCamera("cam", ALPHA0, BETA0, framing["choco-pie"].radius, framing["choco-pie"].target.clone(), scene);
  camera.fov = 0.62;
  camera.lowerRadiusLimit = 2.4;
  camera.upperRadiusLimit = 9;
  camera.lowerBetaLimit = 0.45;
  camera.upperBetaLimit = Math.PI / 2.06; // never below the floor
  camera.inertia = reducedMotion ? 0 : 0.88;
  camera.angularSensibilityX = 1500;
  camera.angularSensibilityY = 1500;
  camera.panningSensibility = 0;
  camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
  camera.attachControl(canvas, true);
  // Babylon would set touch-action: none (no page scrolling over the stage). Keep vertical swipes for the
  // page; horizontal drags still orbit. Set inline because the engine writes the same property inline.
  canvas.style.touchAction = "pan-y";
  camera.minZ = 0.05;

  // ── Lights: key spot (casts the shadow and the light pool), rim from behind, soft fill ──
  const hemi = new HemisphericLight("fill", new Vector3(0, 1, 0), scene);
  const key = new SpotLight("key", new Vector3(...presets["warm-morning"].keyPos), Vector3.Zero(), Math.PI / 3.2, 1.6, scene);
  const keyAim = new Vector3(0, 0.3, 0);
  const rim = new DirectionalLight("rim", new Vector3(0.35, -0.55, 1), scene);
  rim.position = new Vector3(-2, 4, -6);

  const shadowGen = new ShadowGenerator(lite ? 1024 : 2048, key);
  shadowGen.bias = 0.0004;
  shadowGen.normalBias = 0.01;
  if (!lite && engine.webGLVersion >= 2) {
    shadowGen.useContactHardeningShadow = true; // PCSS: crisp at contact, soft further out
    shadowGen.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  } else {
    shadowGen.usePercentageCloserFiltering = true;
    shadowGen.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
  }
  shadowGen.transparencyShadow = true;

  // ── Floor: lit disc that fades out into the page's backdrop, with blurred reflections ──
  const floorMat = new PBRMaterial("floor-mat", scene);
  floorMat.metallic = 0;
  floorMat.roughness = 0.42;
  floorMat.environmentIntensity = 0.35;
  floorMat.opacityTexture = radialTexture(scene, "floor-fade", [
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,255,255,0.85)"],
    [0.68, "rgba(255,255,255,0.2)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  const floor = MeshBuilder.CreateGround("floor", { width: 10, height: 10 }, scene);
  floor.material = floorMat;
  floor.receiveShadows = true;

  let mirror: MirrorTexture | null = null;
  if (!lite) {
    mirror = new MirrorTexture("mirror", 1024, scene, true);
    mirror.mirrorPlane = new Plane(0, -1, 0, 0);
    mirror.adaptiveBlurKernel = 28;
    mirror.level = 0.32;
    floorMat.reflectionTexture = mirror;
  }

  // Contact shadow under each product (ambient occlusion where it meets the floor).
  const contact = MeshBuilder.CreateGround("contact", { width: 3, height: 3 }, scene);
  contact.position.y = 0.003;
  const contactMat = new StandardMaterial("contact-mat", scene);
  contactMat.diffuseTexture = radialTexture(scene, "contact-tex", [
    [0, "rgba(20,8,4,0.42)"],
    [0.35, "rgba(20,8,4,0.25)"],
    [1, "rgba(20,8,4,0)"],
  ], 256);
  contactMat.useAlphaFromDiffuseTexture = true;
  contactMat.disableLighting = true;
  contactMat.emissiveColor = Color3.White();
  contact.material = contactMat;

  // ── Reflections: softboxes captured once by a probe (no HDRI download) ──
  const softboxMats = [0, 1, 2].map((i) => {
    const m = new StandardMaterial(`softbox-${i}`, scene);
    m.disableLighting = true;
    return m;
  });
  const softboxes = [
    MeshBuilder.CreatePlane("sb0", { width: 7, height: 2.4 }, scene),
    MeshBuilder.CreatePlane("sb1", { width: 2.6, height: 5 }, scene),
    MeshBuilder.CreatePlane("sb2", { width: 2.2, height: 5 }, scene),
  ];
  softboxes[0]!.position.set(0, 6, 0.5);
  softboxes[0]!.rotation.x = Math.PI / 2;
  softboxes[1]!.position.set(-5, 2.6, -1.5);
  softboxes[1]!.rotation.y = -Math.PI / 2.4;
  softboxes[2]!.position.set(5, 2.6, 2);
  softboxes[2]!.rotation.y = Math.PI / 2.6;
  softboxes.forEach((s, i) => {
    s.material = softboxMats[i]!;
    s.layerMask = 0x10000000; // hidden from the camera, still seen by the probe
  });
  const probe = new ReflectionProbe("probe", lite ? 128 : 256, scene);
  probe.position = new Vector3(0, 1, 0);
  probe.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
  softboxes.forEach((m) => probe.renderList?.push(m));
  scene.environmentTexture = probe.cubeTexture;
  scene.environmentIntensity = 1;

  // Glow only for flames and sparks.
  const glow = new GlowLayer("glow", scene, { blurKernelSize: lite ? 24 : 48, mainTextureRatio: 0.5 });
  glow.intensity = 0;

  // ── Products ──
  const turntable = new TransformNode("turntable", scene);
  const nodes = {} as Record<StudioProduct, TransformNode>;
  const meshesOf = {} as Record<StudioProduct, Mesh[]>;
  const add = (p: StudioProduct, m: Mesh, parent?: TransformNode) => {
    m.parent = parent ?? nodes[p];
    meshesOf[p].push(m);
    return m;
  };
  (["choco-pie", "pepero", "coffy-bite", "caramilk"] as StudioProduct[]).forEach((p) => {
    nodes[p] = new TransformNode(p, scene);
    nodes[p].parent = turntable;
    meshesOf[p] = [];
  });

  const chocolate = pbr(scene, "chocolate", "#33150A", 0.3, { clearCoat: 0.8 });
  // A faint warm sheen across the coating, like tempered chocolate catching the light
  chocolate.sheen.isEnabled = true;
  chocolate.sheen.color = S("#B8784A");
  chocolate.sheen.intensity = 0.35;
  chocolate.sheen.roughness = 0.4;
  const chocolateDark = pbr(scene, "chocolate-dark", "#1C0B05", 0.26, { clearCoat: 0.9 });
  const biscuit = pbr(scene, "biscuit", "#D7A465", 0.78);

  /** One Choco Pie: lathed chocolate body, a marshmallow seam line and a zigzag drizzle on top. */
  const makePie = (p: StudioProduct, name: string) => {
    const g = new TransformNode(name, scene);
    g.parent = nodes[p];
    const body = add(p, lathe(`${name}-body`, scene, [
      [0, 0], [0.33, 0], [0.385, 0.01], [0.415, 0.035], [0.428, 0.07], [0.425, 0.105], [0.41, 0.14], [0.375, 0.165], [0.3, 0.182], [0.15, 0.19], [0, 0.192],
    ]), g);
    body.material = chocolate;
    const seam = add(p, MeshBuilder.CreateTorus(`${name}-seam`, { diameter: 0.852, thickness: 0.012, tessellation: 72 }, scene), g);
    seam.position.y = 0.07;
    seam.material = pbr(scene, `${name}-seam-mat`, "#6E3E22", 0.6);
    for (let row = -1; row <= 1; row++) {
      const pts: Vector3[] = [];
      const span = row === 0 ? 0.27 : 0.2;
      const z0 = row * 0.125;
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const x = -span + t * span * 2;
        const z = z0 + Math.sin(t * Math.PI * 7) * 0.028;
        const rr = Math.hypot(x, z);
        const y = 0.192 - rr * rr * 0.25 + 0.006;
        pts.push(new Vector3(x, y, z));
      }
      const drizzle = add(p, MeshBuilder.CreateTube(`${name}-dz-${row}`, { path: pts, radius: 0.0085, tessellation: 8, cap: Mesh.CAP_ALL }, scene), g);
      drizzle.material = chocolateDark;
    }
    return g;
  };

  // Choco Pie: the 12-pie carton with a pie on its lid and another leaning against its front.
  {
    const p: StudioProduct = "choco-pie";
    const W = 1.9, H = 0.62, D = 1.3, R = 0.05;
    const box = add(p, roundedBox("cp-box", scene, W, H, D, R));
    box.position.y = H / 2;
    box.rotation.y = 0.32;
    box.material = pbr(scene, "cp-box-mat", "#E73437", 0.24, { clearCoat: 0.95 });
    const top = add(p, MeshBuilder.CreatePlane("cp-top", { width: W - 2 * R, height: D - 2 * R }, scene), box);
    top.position.y = H / 2 + 0.001;
    top.rotation.x = Math.PI / 2;
    top.material = printMaterial(scene, "cp-top", TEX, Math.round(TEX * (D - 2 * R) / (W - 2 * R)), (c, w, h) => {
      c.fillStyle = "#E73437";
      c.fillRect(0, 0, w, h);
      const sun = c.createRadialGradient(w * 0.68, h * 0.5, 0, w * 0.68, h * 0.5, w * 0.42);
      sun.addColorStop(0, "rgba(255,214,150,0.55)");
      sun.addColorStop(1, "rgba(255,214,150,0)");
      c.fillStyle = sun;
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "rgba(255,248,236,0.85)";
      c.lineWidth = w * 0.006;
      c.strokeRect(w * 0.03, h * 0.045, w * 0.94, h * 0.91);
      roundel(c, w * 0.1, h * 0.18, w * 0.03, "#FFFFFF");
      c.fillStyle = "#FFFFFF";
      c.textAlign = "center";
      c.font = `800 ${w * 0.04}px ${sans}`;
      spaced(c, "LOTTE", w * 0.215, h * 0.205, w * 0.008);
      c.font = `italic 700 ${w * 0.15}px ${serif}`;
      c.fillText("Choco", w * 0.3, h * 0.48);
      c.fillText("Pie", w * 0.3, h * 0.72);
      c.font = `700 ${w * 0.026}px ${sans}`;
      c.fillStyle = "#FFE6C7";
      spaced(c, "INDIA'S No.1 CHOCO PIE", w * 0.3, h * 0.86, w * 0.004);
      drawPie(c, w * 0.7, h * 0.5, w * 0.2);
      c.fillStyle = "#FFF6E8";
      c.beginPath();
      c.arc(w * 0.9, h * 0.2, w * 0.055, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#C41E24";
      c.font = `800 ${w * 0.038}px ${sans}`;
      c.fillText("12", w * 0.9, h * 0.205);
      c.font = `700 ${w * 0.014}px ${sans}`;
      c.fillText("PIES", w * 0.9, h * 0.235);
    });
    // Front panel
    const front = add(p, MeshBuilder.CreatePlane("cp-front", { width: W - 2 * R, height: H - 2 * R }, scene), box);
    front.position.z = -D / 2 - 0.001;
    front.material = printMaterial(scene, "cp-front", TEX, Math.round(TEX * (H - 2 * R) / (W - 2 * R)), (c, w, h) => {
      c.fillStyle = "#E73437";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#C41E24";
      c.fillRect(0, h * 0.78, w, h * 0.22);
      c.fillStyle = "#FFFFFF";
      c.textAlign = "center";
      c.font = `italic 700 ${h * 0.42}px ${serif}`;
      c.fillText("Choco Pie", w * 0.5, h * 0.6);
      c.font = `700 ${h * 0.1}px ${sans}`;
      c.fillStyle = "#FFE6C7";
      spaced(c, "FLUFFY MARSHMALLOW · SOFT BISCUIT · RICH CHOCO", w * 0.5, h * 0.92, h * 0.02);
    });
    // Side panels
    [-1, 1].forEach((s) => {
      const side = add(p, MeshBuilder.CreatePlane(`cp-side-${s}`, { width: D - 2 * R, height: H - 2 * R }, scene), box);
      side.position.x = s * (W / 2 + 0.001);
      side.rotation.y = -s * Math.PI / 2;
      side.material = printMaterial(scene, `cp-side-${s}`, TEX / 2, Math.round((TEX / 2) * (H - 2 * R) / (D - 2 * R)), (c, w, h) => {
        c.fillStyle = "#E73437";
        c.fillRect(0, 0, w, h);
        roundel(c, w * 0.5, h * 0.32, h * 0.13, "#FFFFFF");
        c.fillStyle = "#FFFFFF";
        c.textAlign = "center";
        c.font = `800 ${h * 0.15}px ${sans}`;
        spaced(c, "LOTTE", w * 0.5, h * 0.72, h * 0.03);
      });
    });
    const pieTop = makePie(p, "cp-pie-a");
    pieTop.parent = box;
    pieTop.position.set(0.42, H / 2 + 0.001, 0.08);
    pieTop.rotation.y = -0.6;
    // Leaning back against the carton's front
    const pieLean = makePie(p, "cp-pie-b");
    pieLean.parent = box;
    pieLean.position.set(-0.42, 0.11, -D / 2 - 0.165);
    pieLean.rotation.set(-1.2, 0, 0.05);
  }

  // Pepero: tall pack with its top flap torn open and sticks fanning out, a few lying in front.
  {
    const p: StudioProduct = "pepero";
    const W = 0.78, H = 1.75, D = 0.3, R = 0.035;
    const pack = new TransformNode("pp-pack", scene);
    pack.parent = nodes[p];
    pack.rotation.y = 0.28;
    const body = add(p, roundedBox("pp-body", scene, W, H, D, R), pack);
    body.position.y = H / 2;
    body.material = pbr(scene, "pp-body-mat", "#E4002B", 0.24, { clearCoat: 0.95 });
    const face = add(p, MeshBuilder.CreatePlane("pp-face", { width: W - 2 * R, height: H - 2 * R - 0.1 }, scene), pack);
    face.position.set(0, H / 2 - 0.05, -D / 2 - 0.001);
    face.material = printMaterial(scene, "pp-face", Math.round(TEX * 0.5), TEX, (c, w, h) => {
      c.fillStyle = "#E4002B";
      c.fillRect(0, 0, w, h);
      // Sticks illustration, diagonal
      c.save();
      c.translate(w * 0.5, h * 0.66);
      c.rotate(-0.5);
      for (let i = -3; i <= 3; i++) {
        const x = i * w * 0.075;
        c.fillStyle = "#E3B377";
        c.fillRect(x - w * 0.02, -h * 0.34, w * 0.04, h * 0.14);
        c.fillStyle = "#3A1C10";
        c.beginPath();
        c.roundRect(x - w * 0.025, -h * 0.22, w * 0.05, h * 0.5, w * 0.025);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.18)";
        c.fillRect(x - w * 0.012, -h * 0.2, w * 0.008, h * 0.46);
      }
      c.restore();
      c.fillStyle = "#FFFFFF";
      c.textAlign = "center";
      roundel(c, w * 0.5, h * 0.07, w * 0.045, "#FFFFFF");
      c.font = `800 ${w * 0.075}px ${sans}`;
      spaced(c, "LOTTE", w * 0.5, h * 0.145, w * 0.018);
      c.font = `italic 800 ${w * 0.27}px ${serif}`;
      c.fillText("Pepero", w * 0.5, h * 0.3);
      c.font = `700 ${w * 0.06}px ${sans}`;
      c.fillStyle = "#FFE08A";
      spaced(c, "ORIGINAL", w * 0.5, h * 0.37, w * 0.02);
      c.fillStyle = "#FFFFFF";
      c.font = `700 ${w * 0.045}px ${sans}`;
      spaced(c, "CHOCOLATE COATED BISCUIT STICKS", w * 0.5, h * 0.96, w * 0.004);
    });
    const back = add(p, MeshBuilder.CreatePlane("pp-back", { width: W - 2 * R, height: H - 2 * R - 0.1 }, scene), pack);
    back.position.set(0, H / 2 - 0.05, D / 2 + 0.001);
    back.rotation.y = Math.PI;
    back.material = face.material;
    // Torn-open flap hinged at the back of the top edge
    const hinge = new TransformNode("pp-hinge", scene);
    hinge.parent = pack;
    hinge.position.set(0, H - 0.01, D / 2 - 0.01);
    hinge.rotation.x = 1.9;
    const flap = add(p, roundedBox("pp-flap", scene, W - 0.02, 0.012, 0.3, 0.005, 12), hinge);
    flap.position.z = -0.15;
    flap.material = pbr(scene, "pp-flap-mat", "#C70026", 0.4, { clearCoat: 0.5 });
    // Dark mouth so the open top reads as hollow
    const mouth = add(p, MeshBuilder.CreatePlane("pp-mouth", { width: W - 0.08, height: D - 0.06 }, scene), pack);
    mouth.position.y = H + 0.002;
    mouth.rotation.x = Math.PI / 2;
    mouth.material = pbr(scene, "pp-mouth-mat", "#2A0A06", 0.9);

    const stick = (name: string, len: number, parent: TransformNode) => {
      const g = new TransformNode(name, scene);
      g.parent = parent;
      const core = add(p, MeshBuilder.CreateCylinder(`${name}-core`, { diameter: 0.062, height: len, tessellation: 16 }, scene), g);
      core.material = biscuit;
      const coat = add(p, MeshBuilder.CreateCapsule(`${name}-coat`, { radius: 0.041, height: len * 0.8, tessellation: 16, capSubdivisions: 4 }, scene), g);
      coat.position.y = len * 0.1; // chocolate at the tip, plain biscuit handle inside the pack
      coat.material = chocolate;
      return g;
    };
    const fan = [
      [-0.24, 0.24, -0.22, 0.02], [-0.13, 0.33, -0.1, -0.03], [-0.02, 0.4, 0.02, 0.04], [0.1, 0.36, 0.12, -0.02], [0.21, 0.28, 0.24, 0.03], [0.05, 0.22, -0.05, 0.08],
    ];
    fan.forEach(([x, rise, tilt, depth], i) => {
      const s = stick(`pp-s${i}`, 1.1, pack);
      s.position.set(x!, H + rise! - 0.36, depth!);
      s.rotation.z = -tilt!;
      s.rotation.x = depth! * 2;
    });
    // On the floor, in front
    [[-0.3, -0.9, 0.5], [0.15, -1.0, 0.22], [0.55, -0.82, -0.18]].forEach(([x, z, ry], i) => {
      const s = stick(`pp-f${i}`, 1.1, nodes[p]);
      s.position.set(x!, 0.041, z!);
      s.rotation.set(0, ry!, Math.PI / 2);
    });
  }

  /** A twist-wrapped toffee merged into one mesh (one draw call per candy); `band` adds a centre stripe. */
  const makeCandy = (name: string, wrap: PBRMaterial, band?: PBRMaterial, size = 1) => {
    const parts: Mesh[] = [];
    const body = MeshBuilder.CreateCapsule(`${name}-b`, { radius: 0.085 * size, height: 0.3 * size, tessellation: 18, capSubdivisions: 5 }, scene);
    body.rotation.z = Math.PI / 2;
    body.material = wrap;
    parts.push(body);
    [-1, 1].forEach((s) => {
      // Pinched twist that fans out flat, like real wrapper ends
      const twist = MeshBuilder.CreateCylinder(`${name}-t${s}`, { diameterTop: 0.2 * size, diameterBottom: 0.03 * size, height: 0.12 * size, tessellation: 14 }, scene);
      twist.rotation.z = s * Math.PI / 2;
      twist.scaling.z = 0.32;
      twist.position.x = s * 0.2 * size;
      twist.material = wrap;
      parts.push(twist);
    });
    if (band) {
      const b = MeshBuilder.CreateCylinder(`${name}-band`, { diameter: 0.174 * size, height: 0.045 * size, tessellation: 18 }, scene);
      b.rotation.z = Math.PI / 2;
      b.material = band;
      parts.push(b);
    }
    return Mesh.MergeMeshes(parts, true, true, undefined, false, Boolean(band))!;
  };

  // Coffy Bite: glass counter jar of toffees, a few spilled in front.
  {
    const p: StudioProduct = "coffy-bite";
    const wrapA = pbr(scene, "cb-wrap-a", "#5A2F1B", 0.22, { clearCoat: 1, metallic: 0.25 });
    const wrapB = pbr(scene, "cb-wrap-b", "#D98A2B", 0.2, { clearCoat: 1, metallic: 0.35 });
    const srcA = makeCandy("cb-src-a", wrapA);
    const srcB = makeCandy("cb-src-b", wrapB);
    srcA.setEnabled(false);
    srcB.setEnabled(false);
    let n = 0;
    const place = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      const c = (n % 2 ? srcA : srcB).clone(`cb-c${n++}`) as Mesh;
      c.setEnabled(true);
      add(p, c);
      c.position.set(x, y, z);
      c.rotation.set(rx, ry, rz);
    };
    // Packed in layers inside the jar
    const layers = lite ? 5 : 7;
    for (let l = 0; l < layers; l++) {
      const ring = l % 2 ? 5 : 6;
      for (let i = 0; i < ring; i++) {
        const a = (i / ring) * Math.PI * 2 + l * 0.7;
        const rr = 0.28 + ((i + l) % 2) * 0.04;
        place(Math.cos(a) * rr, 0.13 + l * 0.13, Math.sin(a) * rr, l * 0.9 + i, a + Math.PI / 2, (i % 3) * 0.4);
      }
      if (l % 2 === 0) place(0, 0.15 + l * 0.13, 0, 0.3, l, 0.2);
    }
    // Spilled
    [[-0.95, -0.55, 0.4], [-0.7, -0.85, -0.6], [0.85, -0.7, 1.1], [0.55, -1.0, 0.1], [-0.25, -1.05, 2.0]].forEach(([x, z, ry]) => place(x!, 0.085, z!, 0, ry!, 0));

    const glass = new PBRMaterial("cb-glass", scene);
    glass.albedoColor = L("#FFFFFF");
    glass.metallic = 0;
    glass.roughness = 0.04;
    glass.alpha = 0.16;
    glass.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    glass.backFaceCulling = false;
    glass.separateCullingPass = true;
    glass.indexOfRefraction = 1.5;
    glass.useSpecularOverAlpha = true;
    glass.useRadianceOverAlpha = true;
    const jar = add(p, lathe("cb-jar", scene, [
      [0, 0.002], [0.5, 0.002], [0.56, 0.03], [0.585, 0.1], [0.59, 0.95], [0.565, 1.07], [0.5, 1.16], [0.44, 1.2], [0.44, 1.3],
    ], 80));
    jar.material = glass;
    const lid = add(p, lathe("cb-lid", scene, [
      [0, 1.42], [0.36, 1.42], [0.43, 1.405], [0.46, 1.38], [0.465, 1.36], [0.47, 1.34], [0.465, 1.32], [0.47, 1.3], [0.465, 1.28], [0.455, 1.27], [0.44, 1.27],
    ], 80));
    lid.material = pbr(scene, "cb-lid-mat", "#C9862E", 0.22, { metallic: 0.85 });
    const lidTop = add(p, MeshBuilder.CreateDisc("cb-lid-top", { radius: 0.36, tessellation: 64 }, scene));
    lidTop.position.y = 1.4205;
    lidTop.rotation.x = Math.PI / 2;
    lidTop.rotation.y = Math.PI; // print reads the same way up as the jar label
    lidTop.material = printMaterial(scene, "cb-lid-top", TEX / 2, TEX / 2, (c, w, h) => {
      c.fillStyle = "#4A2414";
      c.beginPath();
      c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#D98A2B";
      c.lineWidth = w * 0.02;
      c.beginPath();
      c.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#F7E0B5";
      c.textAlign = "center";
      c.font = `italic 700 ${w * 0.17}px ${serif}`;
      c.fillText("Coffy", w / 2, h * 0.5);
      c.fillText("Bite", w / 2, h * 0.67);
      c.font = `700 ${w * 0.045}px ${sans}`;
      c.fillStyle = "#D98A2B";
      spaced(c, "LOTTE", w / 2, h * 0.28, w * 0.012);
    });
    // Wrap-around label band on the glass
    const label = add(p, MeshBuilder.CreateCylinder("cb-label", { diameter: 1.192, height: 0.4, tessellation: 80, cap: Mesh.NO_CAP }, scene));
    label.position.y = 0.55;
    label.material = printMaterial(scene, "cb-label", TEX, Math.round(TEX * 0.11), (c, w, h) => {
      // Cylinder UVs run clockwise seen from outside: mirror the artwork so it reads correctly.
      c.translate(w, 0);
      c.scale(-1, 1);
      c.fillStyle = "#4A2414";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#D98A2B";
      c.fillRect(0, h * 0.06, w, h * 0.04);
      c.fillRect(0, h * 0.9, w, h * 0.04);
      c.textAlign = "center";
      for (const cx of [0.25, 0.75]) {
        c.fillStyle = "#F7E0B5";
        c.font = `italic 700 ${h * 0.48}px ${serif}`;
        c.fillText("Coffy Bite", w * cx, h * 0.6);
        c.fillStyle = "#D98A2B";
        c.font = `700 ${h * 0.12}px ${sans}`;
        spaced(c, "RICH COFFEE · CREAMY TOFFEE", w * cx, h * 0.82, h * 0.02);
      }
      c.fillStyle = "#F7E0B5";
      for (const cx of [0, 0.5, 1]) roundel(c, w * cx, h * 0.48, h * 0.12, "#D98A2B");
    }, { clearCoat: 0.4, roughness: 0.5 });
    label.rotation.y = Math.PI * 0.5;
  }

  // Caramilk: a pile of twist-wrapped milk toffees with one hero sweet on top.
  {
    const p: StudioProduct = "caramilk";
    const yellow = pbr(scene, "cm-yellow", "#F0D830", 0.2, { clearCoat: 1, metallic: 0.15 });
    const purple = pbr(scene, "cm-purple", "#603078", 0.25, { clearCoat: 0.9 });
    const cream = pbr(scene, "cm-cream", "#FFF4D6", 0.3, { clearCoat: 0.8 });
    const src = makeCandy("cm-src", yellow, purple, 1.05);
    const srcAlt = makeCandy("cm-src-alt", cream, purple, 1.05);
    src.setEnabled(false);
    srcAlt.setEnabled(false);
    const pile: Array<[number, number, number, number, number]> = [
      [0, 0.09, 0, 0.2, 0], [0.42, 0.09, 0.12, 1.4, 0], [-0.4, 0.09, 0.1, -0.6, 0], [0.18, 0.09, -0.4, 2.3, 0], [-0.22, 0.09, -0.38, 0.9, 0],
      [0.6, 0.09, -0.3, -0.3, 0], [-0.68, 0.09, -0.25, 1.9, 0], [0.05, 0.09, 0.45, 2.8, 0], [0.22, 0.25, -0.05, 2.0, 0.25], [-0.18, 0.25, -0.06, 0.6, -0.2],
      [0.02, 0.24, 0.25, -0.4, 0.3],
    ];
    pile.slice(0, lite ? 10 : pile.length).forEach(([x, y, z, ry, rx], i) => {
      const c = (i % 4 === 3 ? srcAlt : src).clone(`cm-c${i}`) as Mesh;
      c.setEnabled(true);
      add(p, c);
      c.position.set(x, y, z);
      c.rotation.set(rx, ry, 0);
    });
    const hero = makeCandy("cm-hero", yellow, purple, 1.7);
    add(p, hero);
    hero.position.set(0, 0.42, -0.05);
    hero.rotation.set(0.15, -0.35, 0.12);
  }

  // Shadows + mirror cover every product mesh.
  (Object.keys(meshesOf) as StudioProduct[]).forEach((k) => meshesOf[k].forEach((m) => {
    shadowGen.addShadowCaster(m, false);
    mirror?.renderList?.push(m);
  }));

  // ── Diwali set: diyas in an arc behind the product and sparks rising ──
  const festive = new TransformNode("festive", scene);
  const clay = pbr(scene, "clay", "#9C4A22", 0.75);
  const flameMat = new StandardMaterial("flame", scene);
  flameMat.emissiveColor = S("#FFB347");
  flameMat.disableLighting = true;
  const flames: Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.18 + i * 0.16);
    const d = new TransformNode(`diya-${i}`, scene);
    d.parent = festive;
    d.position.set(Math.cos(a) * 1.85, 0, Math.sin(a) * 1.5 + 0.35);
    const bowl = lathe(`diya-bowl-${i}`, scene, [[0, 0], [0.08, 0], [0.13, 0.03], [0.15, 0.07], [0.14, 0.075], [0.11, 0.045], [0, 0.04]], 32);
    bowl.parent = d;
    bowl.material = clay;
    const flame = MeshBuilder.CreateSphere(`diya-flame-${i}`, { diameter: 0.07, segments: 12 }, scene);
    flame.parent = d;
    flame.position.y = 0.13;
    flame.scaling.set(0.8, 1.6, 0.8);
    flame.material = flameMat;
    glow.addIncludedOnlyMesh(flame);
    flames.push(flame);
  }
  const sparkMat = new StandardMaterial("spark", scene);
  sparkMat.emissiveColor = S("#FFD27A");
  sparkMat.disableLighting = true;
  const sparkSrc = MeshBuilder.CreateIcoSphere("spark-src", { radius: 0.012, subdivisions: 1 }, scene);
  sparkSrc.material = sparkMat;
  sparkSrc.setEnabled(false);
  const sparks = Array.from({ length: lite ? 18 : 36 }, (_, i) => {
    const m = sparkSrc.clone(`spark-${i}`) as Mesh;
    m.parent = festive;
    m.setEnabled(true);
    glow.addIncludedOnlyMesh(m);
    return { m, x: 0, y: 0, z: 0, v: 0, phase: Math.random() * 6.28, life: Math.random() };
  });
  const respawn = (s: (typeof sparks)[number]) => {
    const a = Math.random() * Math.PI * 2;
    const r = 0.8 + Math.random() * 1.4;
    s.x = Math.cos(a) * r;
    s.z = Math.sin(a) * r;
    s.y = Math.random() * 0.4;
    s.v = 0.18 + Math.random() * 0.3;
    s.life = 0;
  };
  sparks.forEach((s) => {
    respawn(s);
    s.y = Math.random() * 2.6;
  });
  festive.setEnabled(false);

  // ── Crumbs: a small pool reused for every landing ──
  const crumbMats = [pbr(scene, "crumb-a", "#3A1C10", 0.6), pbr(scene, "crumb-b", "#C98B4E", 0.7)];
  const crumbSrc = MeshBuilder.CreateIcoSphere("crumb-src", { radius: 0.028, subdivisions: 1 }, scene);
  crumbSrc.setEnabled(false);
  const crumbs = Array.from({ length: lite ? 14 : 26 }, (_, i) => {
    const m = crumbSrc.clone(`crumb-${i}`) as Mesh;
    m.material = crumbMats[i % 2]!;
    m.setEnabled(false);
    return { m, vx: 0, vy: 0, vz: 0, life: 0, spin: 0 };
  });
  const burst = (p: StudioProduct) => {
    if (reducedMotion) return;
    const [a, b] = crumbColors[p];
    crumbMats[0]!.albedoColor = L(a);
    crumbMats[1]!.albedoColor = L(b);
    crumbs.forEach((c) => {
      const ang = Math.random() * Math.PI * 2;
      const sp = 0.9 + Math.random() * 1.6;
      c.m.position.set(Math.cos(ang) * 0.5, 0.05, Math.sin(ang) * 0.5);
      c.vx = Math.cos(ang) * sp;
      c.vz = Math.sin(ang) * sp;
      c.vy = 1.4 + Math.random() * 2.2;
      c.life = 1.6 + Math.random() * 0.6;
      c.spin = (Math.random() - 0.5) * 12;
      c.m.scaling.setAll(0.6 + Math.random() * 0.9);
      c.m.setEnabled(true);
    });
  };

  // ── Preset state (lerped every frame) ──
  const parsed = (k: StudioPreset) => {
    const d = presets[k];
    return { floor: S(d.floor), hemiSky: S(d.hemiSky), hemiGround: S(d.hemiGround), key: S(d.key), rim: S(d.rim), softboxes: d.softboxes.map(S), keyPos: new Vector3(...d.keyPos) };
  };
  const presetColors = {
    "warm-morning": parsed("warm-morning"),
    "diwali-gold": parsed("diwali-gold"),
    "crisp-editorial": parsed("crisp-editorial"),
  } as Record<StudioPreset, ReturnType<typeof parsed>>;
  let presetKey: StudioPreset = "warm-morning";
  const cs = parsed(presetKey);
  const num = { hemi: presets[presetKey].hemi, key: presets[presetKey].keyIntensity, rim: presets[presetKey].rimIntensity, penumbra: presets[presetKey].penumbra, dark: presets[presetKey].shadowDark, exposure: presets[presetKey].exposure, festive: 0 };
  let probeFrames = 2;

  // ── Product transition state ──
  let current: StudioProduct = "choco-pie";
  let outgoing: { p: StudioProduct; t: number } | null = null;
  const drop = { active: false, delay: 0, y: 0, vy: 0, squash: 0, squashV: 0, spin: 0, landed: true };
  let desiredRadius: number | null = null;
  let contactFoot = footprint[current];
  let spin = 0;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let lastInteraction = performance.now();
  const tmpTarget = new Vector3();

  (Object.keys(nodes) as StudioProduct[]).forEach((k) => nodes[k].setEnabled(k === current));

  const startDrop = (delay: number) => {
    if (reducedMotion) return;
    drop.active = true;
    drop.delay = delay;
    drop.y = 2.4;
    drop.vy = 0;
    drop.squash = 0;
    drop.squashV = 0;
    drop.spin = -1.1;
    drop.landed = false;
    nodes[current].position.y = drop.y;
  };

  // Input: pointer tilt, first-drag hint, idle tracking.
  let dragged = false;
  const onPointerDown = () => {
    lastInteraction = performance.now();
    if (!dragged) {
      dragged = true;
      opts.onFirstDrag?.();
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    tilt.tx = ((e.clientY - r.top) / r.height - 0.5) * 0.12;
    tilt.ty = ((e.clientX - r.left) / r.width - 0.5) * 0.22;
  };
  const onPointerLeave = () => {
    tilt.tx = 0;
    tilt.ty = 0;
  };
  const onKey = () => (lastInteraction = performance.now());
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("keydown", onKey);

  const t0 = performance.now();
  const beforeRender = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
    const k = reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt);
    const time = (performance.now() - t0) / 1000;
    const def = presets[presetKey];
    const pc = presetColors[presetKey];

    // Lighting cross-fade
    Color3.LerpToRef(cs.floor, pc.floor, k, cs.floor);
    Color3.LerpToRef(cs.hemiSky, pc.hemiSky, k, cs.hemiSky);
    Color3.LerpToRef(cs.hemiGround, pc.hemiGround, k, cs.hemiGround);
    Color3.LerpToRef(cs.key, pc.key, k, cs.key);
    Color3.LerpToRef(cs.rim, pc.rim, k, cs.rim);
    cs.softboxes.forEach((c, i) => Color3.LerpToRef(c, pc.softboxes[i]!, k, c));
    Vector3.LerpToRef(cs.keyPos, pc.keyPos, k, cs.keyPos);
    num.hemi += (def.hemi - num.hemi) * k;
    num.key += (def.keyIntensity - num.key) * k;
    num.rim += (def.rimIntensity - num.rim) * k;
    num.penumbra += (def.penumbra - num.penumbra) * k;
    num.dark += (def.shadowDark - num.dark) * k;
    num.exposure += (def.exposure - num.exposure) * k;
    num.festive += ((def.festive ? 1 : 0) - num.festive) * k;

    cs.floor.toLinearSpaceToRef(floorMat.albedoColor);
    hemi.diffuse.copyFrom(cs.hemiSky);
    hemi.groundColor.copyFrom(cs.hemiGround);
    hemi.intensity = num.hemi;
    key.diffuse.copyFrom(cs.key);
    key.specular.copyFrom(cs.key);
    key.intensity = num.key;
    key.position.copyFrom(cs.keyPos);
    key.direction = keyAim.subtract(key.position).normalize();
    rim.diffuse.copyFrom(cs.rim);
    rim.intensity = num.rim;
    shadowGen.contactHardeningLightSizeUVRatio = num.penumbra;
    shadowGen.setDarkness(num.dark);
    ip.exposure = num.exposure;
    softboxMats.forEach((m, i) => (m.emissiveColor = cs.softboxes[i]!));
    if (probeFrames > 0) {
      probe.cubeTexture.resetRefreshCounter();
      probeFrames--;
    }

    // Festive set
    festive.setEnabled(num.festive > 0.02);
    glow.intensity = num.festive * 0.9;
    if (num.festive > 0.02) {
      flames.forEach((f, i) => {
        const fl = reducedMotion ? 1 : 1 + Math.sin(time * 13 + i * 2.1) * 0.08 + Math.sin(time * 23 + i) * 0.05;
        f.scaling.set(0.8 * num.festive, 1.6 * fl * num.festive, 0.8 * num.festive);
      });
      sparks.forEach((s) => {
        if (!reducedMotion) {
          s.y += s.v * dt;
          s.life += dt * 0.3;
          if (s.y > 2.8) respawn(s);
        }
        s.m.position.set(s.x + Math.sin(time * 0.8 + s.phase) * 0.08, s.y, s.z);
        const fade = Math.min(1, s.y * 2) * Math.max(0, 1 - s.y / 2.8);
        s.m.scaling.setAll(Math.max(0.001, fade * num.festive * (0.7 + 0.3 * Math.sin(time * 9 + s.phase))));
      });
    }

    // Outgoing product: spin away and shrink into the floor
    if (outgoing) {
      outgoing.t += dt / 0.55;
      const n = nodes[outgoing.p];
      const e = Math.min(1, outgoing.t);
      const ease = e * e * (3 - 2 * e);
      n.rotation.y = ease * Math.PI * 1.1;
      n.position.y = -ease * ease * 0.6;
      n.scaling.setAll(Math.max(0.001, 1 - ease));
      if (outgoing.t >= 1) {
        n.setEnabled(false);
        n.rotation.y = 0;
        n.position.y = 0;
        n.scaling.setAll(1);
        outgoing = null;
      }
    }

    // Incoming product: falls, lands with a squash, bounces once, crumbs scatter
    const node = nodes[current];
    if (drop.active) {
      if (drop.delay > 0) {
        drop.delay -= dt;
        node.scaling.setAll(0.001);
      } else {
        node.scaling.setAll(1);
        drop.vy -= 16 * dt;
        drop.y += drop.vy * dt;
        if (drop.y <= 0) {
          drop.y = 0;
          if (!drop.landed) {
            drop.landed = true;
            drop.squash = -0.11; // land squashed, spring back
            drop.squashV = 0;
            burst(current);
          }
          drop.vy = Math.abs(drop.vy) > 1.2 ? -drop.vy * 0.22 : 0;
        }
        drop.spin += (0 - drop.spin) * (1 - Math.exp(-4 * dt));
        node.rotation.y = drop.spin;
        node.position.y = drop.y;
        if (drop.landed && drop.vy === 0 && Math.abs(drop.squash) < 0.002 && Math.abs(drop.spin) < 0.003) {
          drop.active = false;
          node.rotation.y = 0;
        }
      }
    }
    // Squash spring (stiff, lightly damped)
    drop.squashV += (-260 * drop.squash - 11 * drop.squashV) * dt;
    drop.squash += drop.squashV * dt;
    if (!drop.active || drop.landed) {
      const sq = drop.squash;
      node.scaling.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
    }
    // Contact shadow follows the height of the drop
    const h = Math.max(0, node.position.y);
    contactFoot += (footprint[current] - contactFoot) * k;
    contact.scaling.setAll(contactFoot * (1 + h * 0.5));
    contactMat.alpha = Math.max(0, 0.85 - h * 0.6);

    // Crumbs
    crumbs.forEach((c) => {
      if (c.life <= 0) return;
      c.life -= dt;
      c.vy -= 9.8 * dt;
      c.m.position.x += c.vx * dt;
      c.m.position.y += c.vy * dt;
      c.m.position.z += c.vz * dt;
      if (c.m.position.y < 0.02) {
        c.m.position.y = 0.02;
        c.vy = Math.abs(c.vy) * 0.3;
        c.vx *= 0.6;
        c.vz *= 0.6;
        c.spin *= 0.5;
      }
      c.m.rotation.x += c.spin * dt;
      c.m.rotation.z += c.spin * dt * 0.7;
      if (c.life < 0.4) c.m.scaling.scaleInPlace(0.9);
      if (c.life <= 0) c.m.setEnabled(false);
    });

    // Turntable: slow spin when idle, plus a gentle tilt towards the pointer
    const idle = performance.now() - lastInteraction > 2500;
    if (!reducedMotion) {
      if (idle) spin += dt * 0.22;
      tilt.x += (tilt.tx - tilt.x) * (1 - Math.exp(-4 * dt));
      tilt.y += (tilt.ty - tilt.y) * (1 - Math.exp(-4 * dt));
    }
    turntable.rotation.set(tilt.x, spin + tilt.y, 0);

    // Camera framing
    const f = framing[current];
    if (Vector3.DistanceSquared(camera.target, f.target) > 1e-6) {
      Vector3.LerpToRef(camera.target, f.target, k, tmpTarget);
      camera.target = tmpTarget.clone();
    }
    if (desiredRadius !== null) {
      const kr = reducedMotion ? 1 : 1 - Math.exp(-2.2 * dt);
      camera.radius += (desiredRadius - camera.radius) * kr;
      if (Math.abs(desiredRadius - camera.radius) < 0.002) desiredRadius = null;
    }
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
  // Portrait screens keep the horizontal field of view fixed, so the product never overflows the sides.
  const fitLens = () => {
    const portrait = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight()) < 1;
    camera.fovMode = portrait ? ArcRotateCamera.FOVMODE_HORIZONTAL_FIXED : ArcRotateCamera.FOVMODE_VERTICAL_FIXED;
    camera.fov = portrait ? 0.6 : 0.62;
  };
  fitLens();
  const ro = new ResizeObserver(() => {
    engine.resize();
    fitLens();
  });
  ro.observe(canvas);
  start();

  const clampR = (r: number) => Math.min(camera.upperRadiusLimit ?? 7.5, Math.max(camera.lowerRadiusLimit ?? 2.4, r));

  return {
    setProduct(p) {
      if (p === current) return;
      if (outgoing) {
        nodes[outgoing.p].setEnabled(false);
        nodes[outgoing.p].scaling.setAll(1);
        nodes[outgoing.p].rotation.y = 0;
        nodes[outgoing.p].position.y = 0;
      }
      const prev = current;
      nodes[prev].position.y = 0;
      current = p;
      nodes[p].setEnabled(true);
      nodes[p].rotation.y = 0;
      nodes[p].position.y = 0;
      nodes[p].scaling.setAll(1);
      if (reducedMotion) {
        nodes[prev].setEnabled(false);
      } else {
        outgoing = { p: prev, t: 0 };
        startDrop(0.28);
      }
      desiredRadius = framing[p].radius;
      lastInteraction = performance.now() - 1500;
    },
    setPreset(p) {
      presetKey = p;
      probeFrames = reducedMotion ? 2 : 40;
    },
    rotate(direction) {
      camera.alpha += direction * (Math.PI / 6);
      lastInteraction = performance.now();
    },
    zoom(direction) {
      desiredRadius = clampR((desiredRadius ?? camera.radius) + direction * 0.6);
      lastInteraction = performance.now();
    },
    reset() {
      camera.alpha = ALPHA0;
      camera.beta = BETA0;
      desiredRadius = framing[current].radius;
      lastInteraction = performance.now();
    },
    enter() {
      if (reducedMotion) return;
      camera.radius = framing[current].radius * 0.62;
      camera.beta = BETA0 - 0.25;
      desiredRadius = framing[current].radius;
      startDrop(0.35);
    },
    setActive(active) {
      if (active) start();
      else stop();
    },
    dispose() {
      stop();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("keydown", onKey);
      scene.onBeforeRenderObservable.remove(beforeRender);
      camera.detachControl();
      scene.dispose();
      engine.dispose();
    },
  };
}
