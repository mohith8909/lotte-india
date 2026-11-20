import type { Product } from "@/data/products";

/** Products with a 3D model in the quick-view turntable. Kept free of three.js imports. */
export function hasStage(p: Product) {
  return p.shape === "pie" || p.shape === "toffee";
}
