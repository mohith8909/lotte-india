import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
    <SiteNav />
    <main id="main" tabIndex={-1} className="outline-none">
    <section className="mesh-cream grain relative overflow-hidden">
      <div className="container relative z-10 flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-display-lg font-light">
          This page has been <em className="italic text-lotte">eaten</em>.
        </h1>
        <Link href="/" className="btn-primary mt-10">
          Back to home
        </Link>
      </div>
    </section>
    </main>
    <Footer />
    </>
  );
}
