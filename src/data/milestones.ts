// Milestones and reach figures as published on lotteindia.com (milestones.html, about-us.html).

export interface Milestone {
  year: string;
  title: string;
  body: string;
  era: "origins" | "growth" | "lotte" | "today";
}

export interface Metric {
  value: number;
  suffix: string;
  label: string;
  caption: string;
  /** Render without thousands separators (e.g. a year). */
  plain?: boolean;
}

export interface Hub {
  city: string;
  state: string;
  role: string;
}

export const eras: { id: Milestone["era"]; label: string }[] = [
  { id: "origins", label: "Parrys Origins" },
  { id: "growth", label: "Growth" },
  { id: "lotte", label: "The Lotte Era" },
  { id: "today", label: "Today" },
];

export const milestones: Milestone[] = [
  { year: "1914", era: "origins", title: "Parrys Confectionery is born", body: "Confectionery begins as part of EID Parry." },
  { year: "1957", era: "origins", title: "A company of its own", body: "Parrys Confectionery is incorporated as a separate company." },
  { year: "1967", era: "growth", title: "Lotte is founded in Korea", body: "Lotte's Korean headquarters opens — today's Lotte Wellfood, parent of Lotte India." },
  { year: "1981", era: "growth", title: "Murugappa Group takeover", body: "The Murugappa Group takes over Parrys Confectionery." },
  { year: "2004", era: "lotte", title: "Joining the Lotte family", body: "Lotte Wellfood, Korea buys out Parrys Confectionery, forming Lotte India Corporation." },
  { year: "2006", era: "lotte", title: "Lotte Choco Pie launches", body: "Choco Pie arrives in India and goes on to create the country's pie category." },
  { year: "2010", era: "lotte", title: "Chennai Choco Pie facility", body: "A new, fully automated Choco Pie facility opens in Chennai." },
  { year: "2013", era: "lotte", title: "₹100 crore and a new HQ", body: "Head office moves to OMR, Chennai, and Lotte Choco Pie crosses the ₹100 crore mark." },
  { year: "2015", era: "lotte", title: "Rohtak Choco Pie facility", body: "A second Choco Pie facility opens in Rohtak, Haryana." },
  { year: "2016", era: "lotte", title: "Rich Cocoa Pie", body: "Lotte Choco Pie Rich Cocoa joins the range." },
  { year: "2017", era: "today", title: "Havmor joins", body: "Acquisition of Havmor Icecreams." },
  { year: "2018", era: "today", title: "₹200 crore", body: "Lotte Choco Pie crosses the ₹200 crore mark." },
  { year: "2019", era: "today", title: "Coffy Bite relaunch", body: "The cult coffee toffee is relaunched." },
  { year: "2022", era: "today", title: "Fruto Pie & Orange Pie", body: "Two new flavours extend the Choco Pie family." },
];

/** Homepage strip. */
export const metrics: Metric[] = [
  { value: 1914, suffix: "", label: "Founding Legacy", caption: "Rooted in Parrys Confectionery", plain: true },
  { value: 2000, suffix: "+", label: "Distributors", caption: "Spread across the country" },
  { value: 1, suffix: "M+", label: "Retail Outlets", caption: "Reached nationwide" },
  { value: 3, suffix: "", label: "Own Facilities", caption: "Chennai · Rohtak · Nellikuppam" },
];

/** Full distribution figures for the Manufacturing & Reach page. */
export const reachMetrics: Metric[] = [
  { value: 4, suffix: "", label: "Regional Offices", caption: "North, South, East and West" },
  { value: 26, suffix: "", label: "C&F Agencies", caption: "Carrying & forwarding agents" },
  { value: 2000, suffix: "+", label: "Distributors", caption: "Spread across the country" },
  { value: 1, suffix: "M+", label: "Retail Outlets", caption: "Reached nationwide" },
];

export const hubs: Hub[] = [
  { city: "Chennai", state: "Tamil Nadu", role: "Head office & automated Choco Pie facility" },
  { city: "Rohtak", state: "Haryana", role: "Automated Choco Pie facility" },
  { city: "Nellikuppam", state: "Tamil Nadu", role: "Own confectionery manufacturing unit" },
];
