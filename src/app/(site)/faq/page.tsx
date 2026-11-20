import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { ContactInquiry } from "@/components/sections/ContactInquiry";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { PageHero } from "@/components/sections/PageHero";
import { company, offices, telHref } from "@/data/company";

export const metadata: Metadata = {
  title: "FAQ & Contact",
  description:
    "Answers about Lotte products, veg/non-veg marks, the FSSAI logo and MRP on mono wrappers — plus Lotte India's head office contact and enquiry form.",
};

export default function FaqPage() {
  const head = offices.find((o) => o.kind === "Head office")!;

  return (
    <>
      <PageHero
        eyebrow="FAQ & contact"
        title={
          <>
            Questions, <em className="italic text-lotte">answered</em>.
          </>
        }
        intro="Product questions, what the marks on our packs mean, careers — and how to reach us."
      />

      <section aria-labelledby="faq-title" className="py-24 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="faq-title" className="text-display-md font-light">
              Frequently <em className="italic text-lotte">asked</em>.
            </h2>
            <nav aria-label="FAQ topics" className="mt-8">
              <ul className="space-y-2 text-sm">
                {[
                  { href: "#products", label: "Products" },
                  { href: "#packaging", label: "Packaging marks" },
                  { href: "#careers", label: "Careers" },
                  { href: "#contact", label: "Contact us" },
                ].map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="inline-flex min-h-[32px] items-center font-semibold text-ink-soft hover:text-lotte-deep">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="bg-sand/60 py-20">
        <div className="container grid gap-10 md:grid-cols-3">
          <div>
            <p className="eyebrow">Head office</p>
            <h2 id="contact-title" className="mt-3 text-3xl">
              Contact Lotte India
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{company.legalName}</p>
          </div>
          <address className="flex gap-3 text-ink-soft not-italic">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-lotte" aria-hidden="true" />
            {head.address}
          </address>
          <div className="space-y-3">
            <a href={telHref(head.phone)} className="flex items-center gap-3 font-semibold hover:text-lotte-deep">
              <Phone className="h-5 w-5 text-lotte" aria-hidden="true" />
              <span className="tabular-nums">{head.phone}</span>
            </a>
            <p className="flex gap-3 text-sm text-ink-soft">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-lotte" aria-hidden="true" />
              {/* TODO: Add the customer-care number and email once confirmed (printed on every pack). */}
              <span>
                For product or quality complaints, use the Customer Care details printed on your pack.{" "}
                <Link href="/reach" className="font-semibold text-noir underline-offset-4 hover:underline">
                  All offices
                </Link>
              </span>
            </p>
          </div>
        </div>
      </section>

      <ContactInquiry />
    </>
  );
}
