import type { Metadata } from "next";
import { BabylonShowcase } from "@/components/prototype/BabylonShowcase";
import { BrandsGrid } from "@/components/prototype/BrandsGrid";
import { HeritageStrip } from "@/components/prototype/HeritageStrip";
import { HeroStage } from "@/components/prototype/HeroStage";

export const metadata: Metadata = {
  title: { absolute: "Lotte India — A Little Circle of Joy" },
  description:
    "Home of Lotte Choco Pie, Coffy Bite, Pepero and Caramilk. Crafting everyday moments of sweetness across India since 1914, as part of the Lotte Group.",
};

/**
 * Library responsibilities on this page:
 *  • Three.js + R3F — hero diorama (HeroDiorama)
 *  • GSAP + ScrollTrigger — scrubbed hero timeline + category camera moves (HeroStage)
 *  • Motion — all 2D UI motion (nav, reveals, layoutId pills, card hover physics)
 *  • Babylon.js — below-the-fold studio viewer, lazy-loaded and disposed (BabylonShowcase)
 */
export default function HomePage() {
  return (
    <>
      <HeroStage />
      <BabylonShowcase />
      <BrandsGrid />
      <HeritageStrip />
    </>
  );
}
