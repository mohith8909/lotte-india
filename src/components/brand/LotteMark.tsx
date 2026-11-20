// Official Lotte India logo, cut from the supplied artwork (public/images/brand/).
// TODO: Swap the PNGs for the vector (SVG) master from Lotte India brand for pixel-perfect rendering.
import Image from "next/image";
import { cn } from "@/lib/cn";

// Static hosting under a sub-path (GitHub Pages) needs the base path on raw image URLs.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface LotteMarkProps {
  className?: string;
  /** `light` swaps the red wordmark for white, for use on dark or red surfaces. */
  tone?: "dark" | "light";
  /** Show only the squircle mark. */
  markOnly?: boolean;
  /** Preload as an LCP candidate — only for the above-the-fold header instance. */
  priority?: boolean;
}

// Served as-is (`unoptimized`): the PNGs are a few KB, and the dev image optimiser hung on the wide,
// short wordmark at 2x (w=640), leaving a broken logo on high-DPI screens.
export function LotteMark({ className, tone = "dark", markOnly = false, priority = false }: LotteMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src={`${base}/images/brand/lotte-mark.png`}
        alt={markOnly ? "Lotte India" : ""}
        width={72}
        height={71}
        priority={priority}
        unoptimized
        className="h-10 w-10 shrink-0"
      />
      {!markOnly && (
        <Image
          src={`${base}/images/brand/${tone === "light" ? "lotte-wordmark-white" : "lotte-wordmark"}.png`}
          alt="Lotte India"
          width={240}
          height={25}
          priority={priority}
          unoptimized
          className="h-[15px] w-auto"
        />
      )}
    </span>
  );
}
