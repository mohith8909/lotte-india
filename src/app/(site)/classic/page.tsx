import type { Metadata } from "next";
import { BrandShowcase } from "@/components/sections/BrandShowcase";
import Link from "next/link";
import { ContactInquiry } from "@/components/sections/ContactInquiry";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { faqGroups } from "@/data/faq";
import { BrandBand } from "@/components/sections/BrandBand";
import { CultureBand } from "@/components/sections/CultureBand";
import { HeritageTimeline } from "@/components/sections/HeritageTimeline";
import { Hero } from "@/components/sections/Hero";
import { ScaleMetrics } from "@/components/sections/ScaleMetrics";

// Previous homepage, kept for reference after the new 3D homepage moved to "/".
export const metadata: Metadata = {
  title: "Classic homepage",
  robots: { index: false },
};

export default function ClassicHomePage() {
  return (
    <>
      <Hero />
      <BrandShowcase limit={8} />
      <ScaleMetrics />
      <BrandBand />
      <HeritageTimeline showLink />
      <CultureBand />
      <section aria-labelledby="home-faq-title" className="py-24 md:py-32">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Good to know</p>
            <h2 id="home-faq-title" className="mt-4 text-display-md font-light text-balance">
              What&apos;s on <em className="italic text-lotte">the pack</em>?
            </h2>
            <Link href="/faq" className="btn-ghost mt-8">
              All FAQs
            </Link>
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion compact groups={faqGroups.filter((g) => g.id === "packaging")} />
          </div>
        </div>
      </section>
      <ContactInquiry />
    </>
  );
}
