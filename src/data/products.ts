// Portfolio as published on lotteindia.com (crawled Nov 2026 — see SITE_AUDIT.md).
// Taglines and descriptions are taken from the live brand pages. Where the live site has
// no copy, `copyTodo` is set and the text is a neutral, factual placeholder.

export type CategoryId = "pies" | "chocolates" | "toffees" | "candies";
export type Accent = "lotte" | "crimson" | "noir" | "blush" | "coffee" | "sun";
export type PackShape = "pie" | "toffee" | "stick" | "jar" | "gum" | "gift";

export interface Category {
  id: CategoryId | "all";
  label: string;
}

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
  /** Tagline as written on the live brand page. */
  tagline: string;
  description: string;
  /** Flavour/format cues drawn from the live copy — not invented tasting notes. */
  highlights: string[];
  variants?: string[];
  /** Year of launch, when the live site states it. */
  launched?: string;
  /** Only set when the live site states it (FAQ: "Lotte Choco Pie is vegetarian"). */
  vegetarian?: true;
  accent: Accent;
  shape: PackShape;
  featured?: boolean;
  /** Enables the interactive "Coffee vs. Toffee" poll in the quick-view drawer. */
  hasPoll?: boolean;
  /** Live site has no copy for this brand — needs official text before launch. */
  copyTodo?: true;
  /** Link to the brand's page on the current site, for the content team. */
  sourceUrl: string;
}

export const categories: Category[] = [
  { id: "all", label: "All" },
  { id: "pies", label: "Pies" },
  { id: "chocolates", label: "Chocolates & Biscuits" },
  { id: "toffees", label: "Toffees & Eclairs" },
  { id: "candies", label: "Candies & Treats" },
];

const SITE = "https://www.lotteindia.com";

export const products: Product[] = [
  // ── Pies ────────────────────────────────────────────────────────────────
  {
    slug: "choco-pie-classic",
    name: "Lotte Choco Pie",
    category: "pies",
    tagline: "Love and Lotte",
    description:
      "Fluffy marshmallows, soft biscuits and rich choco come together to bring you India's No.1 Choco Pie. A quick, convenient and hygienic snack to relish and cherish the moment.",
    highlights: ["Fluffy marshmallow", "Soft biscuit", "Rich choco"],
    variants: ["Original", "Rich Cocoa", "Orange Pie", "Fruto Pie"],
    launched: "2006",
    vegetarian: true,
    accent: "lotte",
    shape: "pie",
    featured: true,
    sourceUrl: `${SITE}/choco-pie.html`,
  },
  {
    slug: "choco-pie-rich-cocoa",
    name: "Choco Pie Rich Cocoa",
    category: "pies",
    tagline: "Rich Choco",
    description: "Burst with a milk créme signature — the richer, cocoa-forward Choco Pie.",
    highlights: ["Rich cocoa", "Milk créme"],
    launched: "2016",
    accent: "noir",
    shape: "pie",
    copyTodo: true,
    sourceUrl: `${SITE}/choco-pie.html`,
  },
  {
    slug: "orange-pie",
    name: "Orange Pie",
    category: "pies",
    tagline: "A citrus twist on the pie",
    description: "An orange-flavoured addition to the Lotte Choco Pie family.",
    highlights: ["Orange flavour", "Choco Pie family"],
    launched: "2022",
    accent: "blush",
    shape: "pie",
    copyTodo: true,
    sourceUrl: `${SITE}/choco-pie.html`,
  },
  {
    slug: "fruto-pie",
    name: "Fruto Pie",
    category: "pies",
    tagline: "A fruity twist on the pie",
    description: "A fruit-flavoured addition to the Lotte Choco Pie family.",
    highlights: ["Fruit flavour", "Choco Pie family"],
    launched: "2022",
    accent: "crimson",
    shape: "pie",
    copyTodo: true,
    sourceUrl: `${SITE}/choco-pie.html`,
  },

  // ── Chocolates & Biscuits ───────────────────────────────────────────────
  {
    slug: "pepero-original",
    name: "Pepero Original",
    category: "chocolates",
    tagline: "The original chocolate-dipped stick",
    description: "Crisp biscuit sticks dipped in chocolate.",
    highlights: ["Biscuit stick", "Chocolate coating"],
    accent: "lotte",
    shape: "stick",
    featured: true,
    copyTodo: true,
    sourceUrl: `${SITE}/pepero.html`,
  },
  {
    slug: "pepero-crunchy",
    name: "Pepero Crunchy",
    category: "chocolates",
    tagline: "Extra crunch in every stick",
    description: "Chocolate-dipped biscuit sticks with a crunchy coating.",
    highlights: ["Biscuit stick", "Crunchy coating"],
    accent: "crimson",
    shape: "stick",
    copyTodo: true,
    sourceUrl: `${SITE}/pepero.html`,
  },

  // ── Toffees & Eclairs ───────────────────────────────────────────────────
  {
    slug: "coffy-bite",
    name: "Coffy Bite",
    category: "toffees",
    tagline: "Rich Coffee! Creamy Toffee!",
    description:
      "A perfect blend of rich coffee and creamy toffee rolled into one stimulating, addictive experience. Whether it's a coffee or a toffee, the argument still continues — since 1987.",
    highlights: ["Rich coffee", "Creamy toffee"],
    variants: ["Classic", "Eclairs"],
    launched: "1987",
    accent: "coffee",
    shape: "toffee",
    featured: true,
    hasPoll: true,
    sourceUrl: `${SITE}/coffy-bite.html`,
  },
  {
    slug: "lotte-eclairs",
    name: "Lotte Eclairs",
    category: "toffees",
    tagline: "The soft, smooth Éclair",
    description:
      "Luscious choco encapsulated inside a soft, smooth toffee. Feel the burst of rich choco in every bite.",
    highlights: ["Soft toffee", "Choco centre"],
    accent: "lotte",
    shape: "toffee",
    sourceUrl: `${SITE}/lotte-eclairs.html`,
  },
  {
    slug: "caramilk",
    name: "Caramilk",
    category: "toffees",
    tagline: "The Rich Taste of Milk",
    description:
      "This dairy-rich confection, supple and delicious, is fondly remembered as “the child's first toffee” — a requisite for auspicious occasions.",
    highlights: ["Dairy-rich", "Soft toffee"],
    variants: ["Caramilk", "Caramilk Eclairs"],
    launched: "1982",
    accent: "sun",
    shape: "toffee",
    sourceUrl: `${SITE}/caramilk.html`,
  },
  {
    slug: "coconut-punch",
    name: "Coconut Punch",
    category: "toffees",
    tagline: "The rich coconut toffee",
    description: "Tiny bits of real desiccated coconut inclusions in soft, yummy toffee — pure delight in every bite.",
    highlights: ["Real desiccated coconut", "Soft toffee"],
    accent: "blush",
    shape: "toffee",
    sourceUrl: `${SITE}/other-brands.html`,
  },

  // ── Candies & Treats ────────────────────────────────────────────────────
  {
    slug: "lacto-king",
    name: "Lacto King",
    category: "candies",
    tagline: "Milk & Butter Candy",
    description: "A duet of milk and butter that titillates your taste buds so much that you can't stop with just one.",
    highlights: ["Milk", "Butter"],
    launched: "1989",
    accent: "sun",
    shape: "jar",
    sourceUrl: `${SITE}/lacto-king.html`,
  },
  {
    slug: "fruitz",
    name: "Fruitz",
    category: "candies",
    tagline: "Funky Fruit Flavored Candy",
    description: "Mouthwatering, fun-filled candies in exciting tropical fruit flavours that lift your mood.",
    highlights: ["Tropical fruit flavours"],
    variants: ["Lollipops (Blueberry, Strawberry)", "Jelly Lollipops"],
    accent: "crimson",
    shape: "jar",
    sourceUrl: `${SITE}/other-brands2.html`,
  },
  {
    slug: "chewits",
    name: "Chewits",
    category: "candies",
    tagline: "Fruit Flavoured Chews",
    description: "Premium sweet and tangy, long-lasting mango-flavoured chews to indulge in.",
    highlights: ["Mango flavour", "Long-lasting chew"],
    accent: "blush",
    shape: "gum",
    sourceUrl: `${SITE}/other-brands3.html`,
  },
  {
    slug: "seasons-greetings",
    name: "Season's Greetings",
    category: "candies",
    tagline: "Gift Pack Assortments",
    description:
      "Little treats for those special moments to celebrate with your loved ones — assortments, elegantly packed to suit all occasions.",
    highlights: ["Assorted confectionery", "Gift packs"],
    accent: "lotte",
    shape: "gift",
    sourceUrl: `${SITE}/other-brands1.html`,
  },
  {
    slug: "booproo",
    name: "BooProo",
    category: "candies",
    tagline: "A Lotte India gum brand",
    description: "One of Lotte India's gum brands.",
    highlights: ["Gum"],
    accent: "crimson",
    shape: "gum",
    copyTodo: true,
    sourceUrl: `${SITE}/about-us.html`,
  },
  {
    slug: "spout",
    name: "Spout",
    category: "candies",
    tagline: "A Lotte India gum brand",
    description: "One of Lotte India's gum brands.",
    highlights: ["Gum"],
    accent: "noir",
    shape: "gum",
    copyTodo: true,
    sourceUrl: `${SITE}/about-us.html`,
  },
];

export const featuredProducts = products.filter((p) => p.featured);
