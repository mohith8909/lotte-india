import { cn } from "@/lib/cn";

/**
 * Decorative squircle-diamond, the silhouette of the Lotte India mark.
 * Used as a quiet recurring motif (frames, bullets, watermarks) — not a logo substitute.
 */
export function BrandGlyph({ className, filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} aria-hidden="true" focusable="false">
      <rect
        x="17"
        y="17"
        width="66"
        height="66"
        rx="22"
        transform="rotate(45 50 50)"
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={filled ? 0 : 1.2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
