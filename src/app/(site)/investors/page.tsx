import type { Metadata } from "next";
import { ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { ContactInquiry } from "@/components/sections/ContactInquiry";
import { DisclosureAccordion } from "@/components/sections/DisclosureAccordion";
import { PageHero } from "@/components/sections/PageHero";
import { RevealItem, Stagger } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Investor Centre — Corporate Governance & Disclosures",
  description:
    "Corporate governance, annual reports, statutory disclosures and policies of Lotte India Corporation Private Limited, plus corporate and distributor inquiries.",
};

const quickLinks = [
  { href: "#disclosures", title: "Statutory disclosures", body: "Annual reports, returns and notices." },
  { href: "#disclosures", title: "Governance & policies", body: "Board, committees and codes of conduct." },
  { href: "#inquiry", title: "Investor relations", body: "Reach our secretarial team directly." },
];

export default function InvestorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Corporate & investor centre"
        title={
          <>
            Built on governance, <em className="italic text-lotte">backed by Lotte</em>.
          </>
        }
        intro="Lotte India Corporation Private Limited is a member of the global Lotte Group. Find our governance framework, statutory filings and investor contacts here."
        mesh="mesh-blush"
      />

      <section aria-label="Quick links" className="-mt-10 relative z-20">
        <Stagger as="ul" className="container grid gap-4 md:grid-cols-3">
          {quickLinks.map((q) => (
            <RevealItem as="li" key={q.title}>
              <Link
                href={q.href}
                className="group flex h-full items-start justify-between gap-6 rounded-3xl bg-alabaster p-7 shadow-card ring-1 ring-noir/5 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span>
                  <span className="block font-serif text-2xl">{q.title}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{q.body}</span>
                </span>
                <ArrowDownRight
                  className="h-5 w-5 shrink-0 text-lotte transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </RevealItem>
          ))}
        </Stagger>
      </section>

      <DisclosureAccordion />
      <ContactInquiry />
    </>
  );
}
