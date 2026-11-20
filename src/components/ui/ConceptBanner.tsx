import { Info } from "lucide-react";

/**
 * Shown on every page of the shared preview so nobody mistakes it for lotteindia.com.
 * Kept in normal document flow (not fixed) so it never covers navigation or controls.
 */
export function ConceptBanner() {
  return (
    <div role="note" className="relative z-[60] bg-[#161616] px-4 py-2 text-center text-xs font-medium text-white">
      <span className="inline-flex items-center gap-2">
        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Concept redesign — not the official Lotte India website. Visit{" "}
        <a href="https://www.lotteindia.com" className="font-semibold underline underline-offset-2" rel="noopener noreferrer">
          lotteindia.com
        </a>{" "}
        for the official site.
      </span>
    </div>
  );
}
