# lotteindia.com — Extraction & Audit

Crawled **19 Nov 2026** from `https://www.lotteindia.com/` (26 internal pages, stylesheets and pack imagery).
Facts below are quoted or paraphrased from the live site; anything not found there is marked **TODO** in code and in the
"Needs verification" list at the end.

---

## 1. Brand & company details

| Fact (from live site) | Source page | Used in |
|---|---|---|
| Legal name **Lotte India Corporation Private Limited** | about-us, contact-us | `src/data/company.ts` → Footer, FAQ, Investors |
| Formed in **2004** after taking over **Parrys Confectionery** from the **Murugappa Group** | about-us, milestones | `milestones.ts`, Story |
| Parent **Lotte Wellfood** (Korea, est. 1967), part of the **Lotte Group** (founded 1948 in Japan by Mr. Shin Kyu-kho; 80+ affiliates) | about-us | `company.ts` → Story "Lotte Group" band |
| Created the **'Pie' category in India**; Choco Pie is **"India's No.1 Choco Pie"** with "near monopoly status" | about-us, choco-pie | Hero, `products.ts` |
| Reach: **4 regional offices · 26 C&F agencies · 2,000+ distributors · 1M+ retail outlets** | site-wide stat strip | `metrics` → ScaleMetrics, `/reach` |
| Manufacturing: **two fully automated Choco Pie facilities (Chennai, Rohtak)**, own confectionery unit at **Nellikuppam (near Pondicherry)**, plus **three outsourced** confectionery units | about-us | `/reach` facilities |
| Offices & factories with addresses and phone numbers (HO Chennai OMR; regional New Delhi, Kolkata, Mumbai, Chennai; factories Chennai–Thiruvallur Rd, Nellikuppam/Cuddalore, Rohtak IMT) | contact-us | `company.ts` → `/reach`, `/faq` contact |
| **Mission:** "We enrich people's lives by providing superior products and services that our customers love and trust" | vision-mission | Story → Vision & Mission |
| **Core values:** Challenge · Respect · Originality · Beyond customer expectations | vision-mission | Story |
| **Management principles:** Transparent Management · Strengthening Core Competencies · Value Based Management · On-Site Management · Shared Hearts Create Value; Value for Business / Employees / Society | management-principles | Story |
| **Culture pillars:** Appreciate · Connect · Excel | home | CultureBand, Careers |
| **Certifications:** EIC; FSSAI (Chennai, Cuddalore, Rohtak); HACCP (Chennai, Rohtak); ISO (Cuddalore); HALAL (Chennai, Rohtak) | certifications | `/reach` certifications |
| **CSR:** LOTTE SmartLearn Schools Initiative with Bal Raksha Bharat (launched 21 Jul 2026, Ahmedabad): STEM labs, WASH, nutrition education | csr | Story CSR band |
| **Milestones 1914 → 2022** (14 dated entries) | milestones | `milestones.ts` (replaces earlier placeholder dates) |
| **FAQ:** careers, product complaints, "What is Choco Pie?", "Is Choco Pie vegetarian?" (yes), veg/non-veg mark, FSSAI logo, MRP on mono wrappers < 10 g | faq | `src/data/faq.ts` → `/faq` |
| Investor Centre: Annual Returns 2020-21 → 2023-24 (PDF); Policies: CSR, Code of Conduct, Privacy, Vigil Mechanism, Risk Management (PDF) | investor-centre, our-policies | `disclosures.ts` (links to live PDFs) |

## 2. Product portfolio

| Brand | Site copy (verbatim tagline) | Launch | New category |
|---|---|---|---|
| Lotte Choco Pie | "Love and Lotte" — fluffy marshmallows, soft biscuits, rich choco | 2006 | Pies |
| Choco Pie Rich Cocoa | "Rich Choco — burst with a milk créme signature" | 2016 | Pies |
| Orange Pie / Fruto Pie | listed as Choco Pie variants | 2022 | Pies |
| Pepero Original / Crunchy | page is image-only — **copy TODO** | — | Chocolates & Biscuits |
| Coffy Bite | "Rich Coffee! Creamy Toffee!" — "the argument still continues, since 1987" | 1987 (relaunch 2019) | Toffees & Eclairs |
| Lotte Eclairs | "The soft, smooth Éclair" — luscious choco inside soft toffee | — | Toffees & Eclairs |
| Caramilk | "The Rich Taste of Milk" — "the child's first toffee" | 1982 | Toffees & Eclairs |
| Coconut Punch | "The rich coconut toffee" — real desiccated coconut | — | Toffees & Eclairs |
| Lacto King | "Milk & Butter Candy" | 1989 | Candies & Treats |
| Fruitz | "Funky Fruit Flavored candy" — lollipops (blueberry, strawberry), jelly lollipops | — | Candies & Treats |
| Chewits | "Fruit Flavoured Chews" — long-lasting mango chews | — | Candies & Treats |
| Season's Greetings | "Gift Pack Assortments" | — | Candies & Treats |
| BooProo, Spout | named as gum brands in "Our Story"; **no product page — copy TODO** | — | Candies & Treats |

**Regulatory notes (from FAQ):** veg = green circle in square, non-veg = red/brown circle in square (FSS Regulations 2011);
FSSAI logo = licensed manufacturer; MRP exempt on packs < 10 g (Legal Metrology Rules 2011). Only Choco Pie is stated
as vegetarian on the site — other products show "check pack for the veg/non-veg mark" rather than an invented claim.

**Removed from the earlier build** (unverified): invented pack formats ("6-pack carton", "Jar of 100"…), invented tasting
notes, BooProo/Spout flavour copy, and placeholder timeline dates (Choco Pie was **2006**, not 2010).

## 3. Visual design tokens

| Token | Value | Extracted from | New role (`tailwind.config.ts`) |
|---|---|---|---|
| Brand red | **#E3000F** (29 uses; h2 colour) | `style.css` | `lotte` — headings accent, CTAs (white on it = 4.91:1 ✓ AA) |
| Red variants | #E30D1C, #E51F27, #DA111F | `style.css` | collapsed into `lotte` / `lotte.deep` |
| Logo red | #E73437 | logo PNG (anti-aliased) | not used as a token — the PNG keeps its own colour |
| Body text | #343434 on #FFFFFF, Roboto 17px | computed `body` | replaced by `noir` #1F0B0C on ivory (higher contrast) |
| Dark navy | #0E1F2A ("View more" buttons) | computed | dropped (off-brand) |
| Link blue | #337AB7 | Bootstrap default | dropped (legacy, not brand) |
| Coffee | #784830 | Coffy Bite pack | `coffee` accent |
| Caramel cream | #D8C090 | Coffy Bite pack | `caramel` accent |
| Milk yellow | #F0D830 | Caramilk / Lacto King packs | `sun` accent |
| Choco Pie red | #D80030 | Choco Pie pack | matches `lotte` family |

**Typography:** live site uses Roboto (body), **Bodoni BT Bold Italic** (display) and Zurich BT. The new build keeps the
same contrast idea — italic display serif + clean sans — with web-licensed equivalents: **Fraunces** (display/italic) +
**Plus Jakarta Sans** (body).

**Layout & navigation (live):** Bootstrap 3 grid; top utility bar (News & Events, FAQ, Contact) + mega-menu (About Us,
Our Brands, Grow With Lotte, Investor Centre) + floating "Enquiry" tab; HR image carousel hero.

## 4. Gaps & modernisation opportunities

| Finding on live site | Fix in new build |
|---|---|
| Hero is an HR stock-photo carousel; products appear far down | Product-led hero with 3D Choco Pie and dual CTAs |
| News & Events last dated **Oct 2019**; copyright **2020** | News removed from primary nav; dynamic copyright year |
| 15–19 `#`/`javascript:` dead links per page; images without `alt` on every page | Real routes only; every image has alt text or is marked decorative |
| Brand list is a mega-menu with no filtering; Pepero page has no text | Filterable portfolio (All, Pies, Chocolates & Biscuits, Toffees & Eclairs, Candies & Treats) with detail drawers |
| Address, factory and reach data buried in Contact | Dedicated **Manufacturing & Reach** page |
| FAQ is plain text; regulatory answers hard to scan | Accessible accordion FAQ grouped by topic, with contact directory |
| Employee portal, webmail and Form 5A on the consumer homepage | Moved to a footer utility row |
| Bootstrap 3, jQuery plugins (aos, animate.css, touch-slider), 361 KB of CSS | Next.js static pages, Tailwind, code-split 3D |

## 5. Needs verification before launch (TODO)

- **Official vector logo** (current build uses the PNG you supplied, cut into mark and wordmark).
- **Product photography** for every brand (placeholders: SVG pack art and procedural 3D models).
- **Copy for Pepero, BooProo, Spout**, and short descriptions for Rich Cocoa / Orange / Fruto Pie.
- **Vision statement** — the live Vision & Mission page shows only the mission text.
- **Customer-care number and email** (FAQ says they are printed on every pack; not published on the site).
- **CIN / registered-office address** for the footer.
- **Careers listings** (`careers.ts` roles are illustrative) and an ATS link.
- AGM e-voting, postal ballot, financial reports and press releases: listed in the live menu, but no documents were crawled.
- **Enquiry form endpoint** (currently simulated client-side).
- Coffy Bite poll counts are seeded demo numbers.

## 6. Data refresh (20 Nov 2026)

Updated from the extracted site data file (`lotteindia_website_data.md`):

- **Products:** pack counts for the four pies, price points where the page copy states them (Coffy Bite, Coconut Punch, Fruitz lollipops), and fuller variant lists. Variants include Coffy Bite Stick Pack, Eclairs Choco/Milk, the Lacto King lollipops, and the Chewits and Season's Greetings formats. Pie drawers now include a "Where to buy" panel (Amazon, BigBasket, Flipkart, Blinkit).
  - Price points known only from image filenames (Eclairs, Caramilk, Lacto King, the Choco Pie ₹10 pack) were left out.
- **Our Story:**
  - Lotte Group markets and its top-10-in-Asia ambition, plus Lotte Wellfood's Korean favourites.
  - CSR frameworks and the 2017–2018 community-work history.
  - A new "In the news" section on the October 2019 Coffy Bite relaunch press coverage.
- **Certifications:** IVCA (cert. GVCSIN00051118) is now listed against Lotte Choco Pie. HALAL is shown only for Rohtak (valid to Mar 2028): the Chennai certificate on the live site expired on 19 Jul 2026, so its badge is hidden until a renewal is confirmed. The separate "Name Change" document has no details yet, so it is not shown.
- **Careers:** Life at Lotte (training, celebrations, insurance, level-based perks), the equal-opportunity statement, the Darwinbox portal and careers@lotteindia.com.
- **FAQ / contact:**
  - The enquiry form now asks "I have a…" (Query / Suggestion / Feedback / Complaint).
  - New FAQs on HR Services and a "Website & legal" summary.
  - The careers email is listed.
- **Footers:** official Instagram, Facebook, YouTube and LinkedIn links. Web Mail and the Employee Portal now point to mail.lotteindia.com and Darwinbox.

Still TODO:
- The X/Twitter link on the live site is a placeholder.
- The enquiry form's country dropdown and file attachment are not mirrored yet.
- Retailer links are search URLs, not the official listings.
- The Chewits page heading says "Mango Toffee" while its copy describes coconut toffee — confirm with the brand team.

## 7. Full site audit (21 Nov 2026)

Run on the GitHub Pages production build, served locally under `/lotte-india/`, across all 8 routes plus the 404 page.

Passed:
- Type-check, lint with zero warnings, and production build (13/13 pages).
- 116 internal links and every image resolve; the 404 page returns 404.
- No console errors or failed requests on any page; the intro finishes everywhere.
- Each page has one H1, a title, a meta description, `lang="en-IN"` and Open Graph tags.
- Accessibility checks (in-page script): no unnamed links or buttons, no unlabelled form fields, no focusable elements inside `aria-hidden`, no positive tabindex, no heading skips, one `<main>` per page.
- No horizontal scrolling at 375px on any page.
- Code scan: external links all have `rel="noopener noreferrer"`, storage access is wrapped in try/catch, listeners and timers are cleaned up.
- Interactions: FAQ accordion, enquiry form validation (6 errors, focus on first), Brands mega-menu with Esc, page transition under the base path, mobile menu.
- Layout shift: about 0 on the homepage and Story.

Fixed in this pass:
- Homepage H1 had no spaces between its animated words ("ALittleCircleofJoy" to screen readers); it now has an explicit name.
- `/classic` had duplicate SVG gradient ids (the same pack in the hero and the grid). `PackArt` takes an `idSuffix`, which the hero instances now pass.
- The Coffy Bite card said "Live poll" over a seeded sample tally; it now says "Poll" (the results already say "Sample results").
- Meta descriptions over 160 characters (site default, Brands, Reach) were shortened.
- Small phone tap targets: the studio's "Pack details" button and "See the full portfolio" link.
- Earlier the same day: the menu-bar wordmark failed to load locally (the dev image optimiser hung at 2x); the logo is now served unoptimised.

Not covered or still open:
- An automated axe-core scan (blocked in this environment); contrast was only checked on solid backgrounds, not gradients.
- Load timings (LCP) can't be measured in the hidden preview pane; run Lighthouse on the live URL.
- No canonical URLs (`metadataBase`) yet — add once the final domain is known.
- Real-device checks: touch scrolling over the studio, and WebGL on low-end phones.
