export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const accentStyles = {
  noir: { mesh: "mesh-card", ink: "text-cream", chip: "bg-noir text-cream", dot: "bg-noir" },
  lotte: { mesh: "mesh-card", ink: "text-noir", chip: "bg-lotte text-cream", dot: "bg-lotte" },
  crimson: { mesh: "mesh-card", ink: "text-noir", chip: "bg-crimson text-cream", dot: "bg-crimson" },
  blush: { mesh: "mesh-card", ink: "text-noir", chip: "bg-blush text-cream", dot: "bg-blush" },
  coffee: { mesh: "mesh-card", ink: "text-noir", chip: "bg-coffee text-cream", dot: "bg-coffee" },
  sun: { mesh: "mesh-card", ink: "text-noir", chip: "bg-plum text-cream", dot: "bg-plum" },
} as const;
