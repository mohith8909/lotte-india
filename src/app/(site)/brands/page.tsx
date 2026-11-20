import type { Metadata } from "next";
import { products } from "@/data/products";
import { BrandShowcase } from "@/components/sections/BrandShowcase";
import { PageHero } from "@/components/sections/PageHero";
import { ContactInquiry } from "@/components/sections/ContactInquiry";

export const metadata: Metadata = {
  title: "Our Brands",
  description:
    "Explore the Lotte India portfolio: Choco Pie, Coffy Bite, Lotte Eclairs, Caramilk, Pepero, Lacto King, Fruitz, Chewits and more.",
};

export default function BrandsPage() {
  return (
    <>
      <PageHero
        eyebrow="The full portfolio"
        title={
          <>
            {products.length} ways to <em className="italic text-lotte">sweeten</em> a day.
          </>
        }
        intro="Every brand in our house is built around a single moment of delight. Filter by category and open any product for tasting notes and pack formats."
        mesh="mesh-lotte"
      />
      <BrandShowcase
        syncHash
        eyebrow="Browse"
        title={
          <>
            Pies, toffees <em className="italic text-lotte">&amp; more</em>.
          </>
        }
        intro="Tap any product for its quick-view — and settle the Coffy Bite debate once and for all."
      />
      <ContactInquiry />
    </>
  );
}
