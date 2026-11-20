// Investor Centre & policy documents, linked to the PDFs published on lotteindia.com
// (investor-centre.html, our-policies.html — crawled Nov 2026).
// TODO: Re-host these PDFs under public/ (or a document CDN) before the old site is retired.

import { company } from "./company";

export const companyName = company.legalName;

const SITE = "https://www.lotteindia.com";

export interface Disclosure {
  title: string;
  period: string;
  format: "PDF" | "Link";
  /** null = listed on the live site but no document was published to link to. */
  href: string | null;
}

export interface DisclosureGroup {
  id: string;
  title: string;
  summary: string;
  items: Disclosure[];
}

export const disclosureGroups: DisclosureGroup[] = [
  {
    id: "annual-returns",
    title: "Annual Returns",
    summary: "Annual returns filed under the Companies Act, 2013.",
    items: [
      { title: "Annual Return", period: "FY 2023–24", format: "PDF", href: `${SITE}/pdf/annual-return/ANNUAL%20RETURN%202023-24.pdf` },
      { title: "Annual Return", period: "FY 2022–23", format: "PDF", href: `${SITE}/pdf/annual-return/Annual%20Return%20-%202022-23.pdf` },
      { title: "Annual Return", period: "FY 2021–22", format: "PDF", href: `${SITE}/pdf/annual-return/LOTTE_ANNUAL_RETURN_2021-22.pdf` },
      { title: "Annual Return", period: "FY 2020–21", format: "PDF", href: `${SITE}/pdf/annual-return/LOTTE_ANNUAL_RETURN_2020-21.pdf` },
    ],
  },
  {
    id: "policies",
    title: "Policies",
    summary: "The policies that govern ethics, privacy, risk and social responsibility.",
    items: [
      { title: "CSR Policy", period: "Current", format: "PDF", href: `${SITE}/pdf/csr_policy_26_08_2026.pdf` },
      { title: "Code of Conduct & Ethics", period: "Current", format: "PDF", href: `${SITE}/pdf/code_of_conduct_and_ethics_09_10_2026.pdf` },
      { title: "Privacy Policy", period: "Current", format: "PDF", href: `${SITE}/pdf/Privacy-Policy.pdf` },
      { title: "Vigil Mechanism Policy", period: "Current", format: "PDF", href: `${SITE}/pdf/vigil_mechanism_policy_26_08_2026.pdf` },
      { title: "Risk Management Policy", period: "Current", format: "PDF", href: `${SITE}/pdf/risk_management_policy_of_lotte_india_25_08_2026.pdf` },
    ],
  },
  {
    // Menu items on the live site; no documents were published at crawl time.
    id: "shareholder",
    title: "Shareholder Information",
    summary: "General meetings, financial reports and announcements.",
    items: [
      { title: "AGM E-Voting & Notice", period: "—", format: "PDF", href: null },
      { title: "Postal Ballot", period: "—", format: "PDF", href: null },
      { title: "Financial Reports", period: "—", format: "PDF", href: null },
      { title: "Press Releases", period: "—", format: "Link", href: null },
    ],
  },
];

/** Employee & statutory links that the current site puts on its homepage — moved to the footer. */
export const utilityLinks: { label: string; detail: string; href: string }[] = [
  // TODO: confirm the live webmail and employee-portal URLs with Lotte India IT.
  { label: "Web Mail", detail: "Staff email login", href: `${SITE}/` },
  { label: "Employee Portal", detail: "Payroll & performance", href: `${SITE}/` },
  { label: "Form 5A — Royapettah", detail: "TNMAS000034500B", href: `${SITE}/pdf/home-page/Form5a_signed%20345B_Royapettah.pdf` },
  { label: "Form 5A — Tambaram", detail: "TBTAM000034500C", href: `${SITE}/pdf/home-page/Form5a_signed%20345C_Tambaram.pdf` },
];
