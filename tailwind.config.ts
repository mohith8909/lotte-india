import type { Config } from "tailwindcss";

const config: Config = {
  content: { relative: true, files: ["./src/**/*.{ts,tsx}"] },
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", md: "2rem", xl: "3rem" },
    },
    extend: {
      // Brand palette = the Lotte India logo: one red (#E73437, sampled from the supplied logo) on white,
      // with a neutral charcoal ink. Product-pack accents (coffee, sun, plum…) are for pack art only.
      colors: {
        cream: "#FAF8F5", // warm off-white editorial canvas (neutral, not pink or beige)
        alabaster: "#FFFFFF", // elevated surfaces
        sand: "#F4F4F4", // neutral alternate section / chip background
        noir: {
          // Neutral charcoal ink & dark surfaces (was a red-black that read as oxblood)
          DEFAULT: "#161616",
          900: "#0D0D0D",
          800: "#1F1F1F",
          700: "#2B2B2B",
          600: "#4A4A4A",
        },
        lotte: {
          DEFAULT: "#E73437", // exact logo red — logo, glyphs, icons, large display type (4.25:1 on white)
          cta: "#D6272C", // buttons, badges and red sections: white text 5.0:1 (AA)
          deep: "#C41E24", // small red text on white/grey (5.9:1)
          light: "#FF9C96", // red tint for text on charcoal (9.0:1)
          pale: "#FDECEB",
        },
        crimson: { DEFAULT: "#9C1420", pale: "#F6DEDF" },
        blush: { DEFAULT: "#EF7A6D", pale: "#FDEFEC" },
        coffee: { DEFAULT: "#784830", pale: "#F1E6DA" }, // Coffy Bite pack
        caramel: { DEFAULT: "#D8C090", pale: "#F7EFDF" }, // Coffy Bite cream
        sun: { DEFAULT: "#F0D830", pale: "#FBF5D2" }, // Caramilk / Lacto King yellow
        plum: "#603078", // Caramilk purple
        // /prototype palette (from the homepage-prototype brief). Scoped tokens so the main site is unaffected.
        proto: {
          red: "#ED1D24", // Lotte Red — arcs, indicators, large type (4.3:1 — not for small text)
          cta: "#D4161D", // CTA fill: white text 5.3:1 (AA)
          cream: "#FFFDF9",
          sand: "#F7F2EA",
          cocoa: "#3B1E12",
          ivory: "#FFF9F0",
          caramel: "#D98A2B", // decorative / 3D only — fails as text on cream
          coffee: "#5C3422",
          muted: "#6B5A50", // 5.9:1 on sand
        },
        ink: {
          soft: "#4D4D4D", // 7.7:1 on grey
          muted: "#6B6B6B", // 5.3:1 on white, 4.85:1 on grey
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7.5vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.5rem, 5.5vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      boxShadow: {
        card: "0 1px 0 rgba(22,22,22,0.04), 0 12px 32px -12px rgba(22,22,22,0.14)",
        lift: "0 2px 0 rgba(22,22,22,0.04), 0 28px 60px -20px rgba(22,22,22,0.28)",
        glow: "0 24px 70px -24px rgba(231,52,55,0.5)",
        pill: "0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 20px -12px rgba(22,22,22,0.18)",
        "pill-lg": "0 1px 0 rgba(255,255,255,0.7) inset, 0 18px 40px -18px rgba(22,22,22,0.35), 0 2px 6px rgba(22,22,22,0.05)",
      },
      // Idle "alive" loops — transform/opacity only, disabled with motion-reduce:animate-none at the call site.
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(var(--float-r, 0deg))" },
          "50%": { transform: "translate3d(0, -12px, 0) rotate(calc(var(--float-r, 0deg) + 4deg))" },
        },
        breathe: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.85" },
          "50%": { transform: "translate(-50%, -50%) scale(1.06)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-9deg) scale(1.05)" },
          "60%": { transform: "rotate(7deg) scale(1.05)" },
        },
      },
      animation: {
        float: "float 6s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        breathe: "breathe 7s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        wiggle: "wiggle 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
