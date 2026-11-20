// Corporate facts published on lotteindia.com (about-us, contact-us, vision-mission,
// management-principles, certifications, csr). See SITE_AUDIT.md for sources.

export const company = {
  legalName: "Lotte India Corporation Private Limited",
  parent: "Lotte Wellfood",
  group: "Lotte Group",
  // TODO: CIN and registered-office address — not published on the current site.
  cin: null as string | null,
  // TODO: customer-care phone and email — the FAQ says they are printed on every pack.
  customerCare: null as { phone: string; email: string } | null,
};

export const groupStory = {
  lotteGroup:
    "Founded by Mr. Shin Kyu-kho, the twin-headquartered Lotte Group was first established in 1948 in Japan as a confectionery company, with its second headquarters in Korea in 1967. It has since diversified into F&B, retail, hospitality, chemicals, construction and finance, with over 80 affiliates.",
  wellfood:
    "Lotte Wellfood, Korea opened its doors in 1967 and leads Korea's food industry in gums, candies, biscuits, chocolates and ice cream.",
};

// The live Vision & Mission page shows a single statement under "Mission".
// TODO: confirm the separate Vision statement with Lotte India.
export const mission =
  "We enrich people's lives by providing superior products and services that our customers love and trust.";

export const coreValues = ["Challenge", "Respect", "Originality", "Beyond customer expectations"] as const;

export const managementPrinciples = [
  "Transparent Management",
  "Strengthening Core Competencies",
  "Value Based Management",
  "On-Site Management",
  "Shared Hearts Create Value",
] as const;

export const valueCreation = [
  { title: "Value for Business", body: "Leverage innovation and efficiency to generate positive results." },
  { title: "Value for Employees", body: "Make people happy through engaging relationships with the work, colleagues and the organisation." },
  { title: "Value for Society", body: "Become good corporate citizens by way of compliance and social representation." },
] as const;

export interface Facility {
  name: string;
  kind: "own" | "outsourced";
  detail: string;
  certifications: string[];
}

export const facilities: Facility[] = [
  { name: "Chennai", kind: "own", detail: "Fully automated Lotte Choco Pie facility (opened 2010).", certifications: ["FSSAI", "HACCP", "HALAL"] },
  { name: "Rohtak, Haryana", kind: "own", detail: "Fully automated Lotte Choco Pie facility (opened 2015).", certifications: ["FSSAI", "HACCP", "HALAL"] },
  { name: "Nellikuppam (near Pondicherry)", kind: "own", detail: "Lotte India's own confectionery manufacturing unit.", certifications: ["FSSAI", "ISO"] },
  { name: "Three partner units", kind: "outsourced", detail: "Confectionery manufacturing outsourced to three units across India.", certifications: [] },
];

/** Also listed on the site: EIC certification and the Lotte Choco Pie IVCA name-change certificate. */
export const otherCertifications = ["EIC", "IVCA — Lotte Choco Pie name change"] as const;

export interface Office {
  region: "Head Office" | "North" | "South" | "East" | "West";
  kind: "Head office" | "Regional office" | "Factory";
  city: string;
  address: string;
  phone: string;
}

export const offices: Office[] = [
  { region: "Head Office", kind: "Head office", city: "Chennai", address: "4/169, Rajiv Gandhi Salai (OMR Road), Kandanchavadi, Chennai – 600096, Tamil Nadu", phone: "044 4545 8888" },
  { region: "South", kind: "Regional office", city: "Chennai", address: "4/169, Rajiv Gandhi Salai (OMR Road), Kandanchavadi, Chennai – 600096", phone: "044 4545 8813" },
  { region: "North", kind: "Regional office", city: "New Delhi", address: "Flat No. 301, 3rd Floor, Shayog Building-58, Nehru Palace, New Delhi – 110019", phone: "011 4659 7214" },
  { region: "East", kind: "Regional office", city: "Kolkata", address: "No. 30A Lake Road, 3rd Floor, Kolkata – 700029", phone: "033 4063 3494" },
  { region: "West", kind: "Regional office", city: "Mumbai", address: "505, 5th Floor, Vakratunda Corporate Park, Visheshwar Nagar, Off Aarey Road, Goregaon (East), Mumbai – 400063", phone: "022 2927 0553" },
  { region: "South", kind: "Factory", city: "Chennai", address: "No. 26, Poonamallee–Thiruvallur Road, Chennai – 602107", phone: "044 2681 2600" },
  { region: "South", kind: "Factory", city: "Nellikuppam, Cuddalore", address: "Morai Street, South Arcot Road District, Nellikuppam, Cuddalore – 607105", phone: "04142 273300" },
  { region: "North", kind: "Factory", city: "Rohtak", address: "4-7, Sector 30A, Rohtak (IMT), Haryana – 124001", phone: "01262 242100" },
];

export const csr = {
  name: "LOTTE SmartLearn Schools Initiative",
  partner: "Bal Raksha Bharat",
  launched: "21 July 2026, Ahmedabad, Gujarat",
  summary:
    "A CSR partnership building future-ready government schools where children learn, grow and thrive.",
  pillars: [
    { title: "Future-ready STEM learning", body: "STEM labs, smart classrooms, experiential kits and teacher capacity building." },
    { title: "Safe & hygienic schools (WASH)", body: "Water, sanitation and hygiene infrastructure and positive hygiene habits." },
    { title: "Nutrition education", body: "Eat Right Corners, nutrition gardens and healthy-eating campaigns." },
  ],
};

/** Convert a display phone number to a tel: href. */
export const telHref = (phone: string) => `tel:+91${phone.replace(/\D/g, "").replace(/^0/, "")}`;
