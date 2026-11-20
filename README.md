# Lotte India — concept redesign

> **This is an unofficial concept redesign, not the official Lotte India website.**
> The official site is [lotteindia.com](https://www.lotteindia.com). Brand names and the logo belong to
> Lotte India Corporation Private Limited; they are used here only to present the design concept.

**Live preview:** https://mohith8909.github.io/lotte-india/

## What's inside

- **Homepage** — "A Little Circle of Joy": a scroll-scrubbed 3D Choco Pie (Three.js + React Three Fiber,
  driven by GSAP ScrollTrigger), Motion-powered UI, and a Babylon.js packaging studio that lazy-loads below the fold.
- **Inner pages** — Our Story, Brands (filterable portfolio with quick-view drawers), Manufacturing & Reach,
  FAQ / Contact, Careers and Investor Centre, built from content audited on the current site
  (see [SITE_AUDIT.md](SITE_AUDIT.md)).
- `/classic` — the previous homepage design, kept for reference.

Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion / Motion, GSAP, Three.js, Babylon.js, Lenis.

## Run locally

```bash
npm install
npm run dev
```

The site respects `prefers-reduced-motion`: with it enabled you see calm, static versions of every animation.

## Deploy

Every push to `main` builds a static export and publishes it to GitHub Pages
(`.github/workflows/pages.yml`).

## Before any real launch

Placeholder content is marked `TODO` in the code — official photography and vector logo, some product copy,
customer-care details and a real enquiry endpoint (the form currently sends nothing). See the
"Needs verification" list in [SITE_AUDIT.md](SITE_AUDIT.md).
