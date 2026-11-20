// TODO: Replace with official Lotte India photography — drop pack shots into public/images/products/.
import type { Accent, PackShape } from "@/data/products";

const palette: Record<Accent, { base: string; deep: string; light: string; ink: string }> = {
  // Pack wrappers lean on the logo palette; chocolate tones stay brown for realism.
  noir: { base: "#4A1B1D", deep: "#1F0B0C", light: "#F7A19B", ink: "#FFFFFF" },
  lotte: { base: "#E73437", deep: "#A3121B", light: "#FFD9D5", ink: "#FFFFFF" },
  crimson: { base: "#9C1420", deep: "#5E0A12", light: "#F6DEDF", ink: "#FFFFFF" },
  blush: { base: "#EF7A6D", deep: "#C2161F", light: "#FFF1EE", ink: "#FFFFFF" },
  // Sampled from the Coffy Bite and Caramilk packs on lotteindia.com
  coffee: { base: "#784830", deep: "#3E2418", light: "#D8C090", ink: "#FFFFFF" },
  sun: { base: "#F0D830", deep: "#603078", light: "#FBF5D2", ink: "#3A1A50" },
};

interface PackArtProps {
  shape: PackShape;
  accent: Accent;
  label: string;
  className?: string;
  /** Makes SVG ids unique when the same pack appears twice on a page (e.g. hero + grid). */
  idSuffix?: string;
}

/** Bespoke illustrated packaging silhouettes used as high-craft placeholders for product photography. */
export function PackArt({ shape, accent, label, className, idSuffix }: PackArtProps) {
  // Deterministic gradient ids: the same on server and client, so hydration can never disagree
  // (useId depends on the whole component tree and breaks if any ancestor renders differently).
  // Pass `idSuffix` when a pack can appear twice on one page: duplicate ids are invalid, and if the first
  // copy sits in a hidden (display: none) subtree, browsers can drop the gradients for the visible one.
  const uid = `${shape}-${accent}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}${idSuffix ? `-${idSuffix}` : ""}`;
  const c = palette[accent];
  const g = `g-${uid}`;
  const s = `s-${uid}`;
  const short = label.replace(/^Lotte\s+/i, "").toUpperCase();

  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label={`${label} illustrated pack`}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.base} />
          <stop offset="1" stopColor={c.deep} />
        </linearGradient>
        <radialGradient id={s} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1F0B0C" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1F0B0C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="210" rx="80" ry="10" fill={`url(#${s})`} />

      {shape === "pie" && (
        <g>
          {/* pillow wrapper */}
          <g transform="rotate(-6 120 80)">
            <path d="M36 36 q84 -20 168 0 l6 92 q-90 18 -180 0z" fill={`url(#${g})`} stroke={c.light} strokeOpacity="0.15" />
            <path d="M30 128 l-6 6 m12 -6 l-4 8 m180 -8 l6 6 m-12 -6 l4 8" stroke={c.deep} strokeWidth="2" />
            <path d="M36 36 q84 -20 168 0" fill="none" stroke={c.light} strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 4" />
            <text x="120" y="84" textAnchor="middle" fill={c.ink} fontFamily="var(--font-serif)" fontSize="24" fontStyle="italic">
              {label.replace(/^Lotte\s+/i, "").replace(/^Choco Pie\s+/i, "")}
            </text>
            <text x="120" y="104" textAnchor="middle" fill={c.light} fontFamily="var(--font-sans)" fontSize="8" letterSpacing="3">
              {short.startsWith("CHOCO PIE") ? "LOTTE · SINCE 1914" : `LOTTE ${short.includes("PIE") ? "" : "PIE"}`.trim()}
            </text>
          </g>
          {/* the pie itself */}
          <ellipse cx="120" cy="172" rx="58" ry="16" fill="#24140E" />
          <rect x="62" y="150" width="116" height="22" fill="#3D261B" />
          <rect x="62" y="158" width="116" height="7" fill="#F5EEE4" />
          <ellipse cx="120" cy="150" rx="58" ry="16" fill="#5A3B2C" />
          <path d="M80 146 q40 -14 80 0" fill="none" stroke="#D9A066" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {shape === "toffee" && (
        <g>
          <path d="M22 96 l38 24 l-38 24 l10 -24z" fill={c.deep} />
          <path d="M218 96 l-38 24 l38 24 l-10 -24z" fill={c.deep} />
          <rect x="56" y="82" width="128" height="76" rx="38" fill={`url(#${g})`} />
          <path d="M70 96 q50 -14 100 0" fill="none" stroke={c.light} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
          <text x="120" y="126" textAnchor="middle" fill={c.ink} fontFamily="var(--font-serif)" fontSize="19" fontStyle="italic">
            {label.replace(/^Lotte\s+/i, "")}
          </text>
          <text x="120" y="142" textAnchor="middle" fill={c.light} fontFamily="var(--font-sans)" fontSize="7" letterSpacing="3">
            LOTTE · INDIA
          </text>
          {/* loose candies */}
          <ellipse cx="70" cy="190" rx="18" ry="10" fill={c.base} />
          <ellipse cx="170" cy="194" rx="14" ry="8" fill={c.deep} />
        </g>
      )}

      {shape === "stick" && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${86 + i * 16} ${28 + (i % 2) * 10})`}>
              <rect width="7" height="80" rx="3.5" fill="#E8C99A" />
              <rect width="7" height="62" rx="3.5" fill="#3D261B" />
            </g>
          ))}
          <path d="M60 92 h120 l-6 112 h-108z" fill={`url(#${g})`} />
          <path d="M60 92 h120 v14 h-120z" fill={c.deep} />
          <text x="120" y="148" textAnchor="middle" fill={c.ink} fontFamily="var(--font-serif)" fontSize="26" fontStyle="italic">
            {label.replace(/^Lotte\s+/i, "")}
          </text>
          <text x="120" y="168" textAnchor="middle" fill={c.light} fontFamily="var(--font-sans)" fontSize="7" letterSpacing="3">
            BISCUIT STICKS
          </text>
        </g>
      )}

      {shape === "jar" && (
        <g>
          <rect x="82" y="34" width="76" height="20" rx="5" fill={c.deep} />
          <path d="M70 58 h100 q12 0 12 14 v112 q0 18 -18 18 h-88 q-18 0 -18 -18 v-112 q0 -14 12 -14z" fill={c.light} fillOpacity="0.55" stroke={c.base} strokeWidth="2" />
          {[
            [92, 170], [124, 176], [154, 166], [104, 146], [138, 150], [86, 122], [118, 124], [152, 128], [100, 98], [136, 100],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="14" ry="8" fill={i % 2 ? c.base : "#F5EEE4"} stroke={c.deep} strokeOpacity="0.25" />
          ))}
          <rect x="78" y="112" width="84" height="30" rx="6" fill={`url(#${g})`} />
          <text x="120" y="132" textAnchor="middle" fill={c.ink} fontFamily="var(--font-serif)" fontSize="14" fontStyle="italic">
            {label.replace(/^Lotte\s+/i, "")}
          </text>
        </g>
      )}

      {shape === "gum" && (
        <g>
          <rect x="44" y="78" width="152" height="74" rx="14" fill={`url(#${g})`} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={56 + i * 27} y="90" width="20" height="50" rx="6" fill={c.light} fillOpacity="0.18" />
          ))}
          <text x="120" y="122" textAnchor="middle" fill={c.ink} fontFamily="var(--font-serif)" fontSize="22" fontStyle="italic">
            {label.replace(/^Lotte\s+/i, "")}
          </text>
          <text x="120" y="138" textAnchor="middle" fill={c.light} fontFamily="var(--font-sans)" fontSize="7" letterSpacing="3">
            LOTTE · INDIA
          </text>
          <rect x="70" y="168" width="34" height="20" rx="10" fill={c.base} />
          <rect x="116" y="174" width="30" height="18" rx="9" fill="#F5EEE4" stroke={c.base} strokeOpacity="0.4" />
          <circle cx="170" cy="180" r="12" fill={c.light} stroke={c.base} strokeOpacity="0.5" />
        </g>
      )}

      {shape === "gift" && (
        <g>
          {/* Lid */}
          <rect x="46" y="70" width="148" height="34" rx="6" fill={c.deep} />
          {/* Box */}
          <rect x="54" y="102" width="132" height="96" rx="6" fill={`url(#${g})`} />
          {/* Ribbon */}
          <rect x="110" y="70" width="20" height="128" fill={c.light} fillOpacity="0.9" />
          <rect x="46" y="80" width="148" height="12" fill={c.light} fillOpacity="0.9" />
          <path d="M120 70 C 96 44, 74 52, 92 68 Z M120 70 C 144 44, 166 52, 148 68 Z" fill={c.light} />
          <text x="120" y="158" textAnchor="middle" fill={c.ink} fontFamily="var(--font-serif)" fontSize="15" fontStyle="italic" paintOrder="stroke" stroke={c.base} strokeWidth="5">
            {label.replace(/^Lotte\s+/i, "")}
          </text>
        </g>
      )}
    </svg>
  );
}
