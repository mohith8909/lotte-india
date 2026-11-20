import Link from "next/link";
import { LotteMark } from "@/components/brand/LotteMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { company, offices, telHref } from "@/data/company";

const regional = offices.filter((o) => o.kind !== "Factory");

export function ProtoFooter() {
  return (
    <footer data-nav-theme="dark" className="mesh-ember grain relative text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LotteMark tone="light" />
            <p className="mt-6 max-w-xs text-white/80">Your very own little circle of joy — made in India since 1914.</p>
            <nav aria-label="Corporate" className="mt-8 flex flex-wrap gap-3">
              {[
                { href: "/careers", label: "Grow With Lotte" },
                { href: "/investors", label: "Investor Centre" },
                { href: "/faq#contact", label: "Enquiry" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-proto-cocoa"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <SocialLinks className="mt-6" />
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF8A8E]">Regional offices</h2>
            <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
              {regional.map((o) => (
                <li key={o.region + o.city} className="bg-[#1C0E08] p-5">
                  <p className="font-semibold">
                    {o.city} <span className="text-sm font-normal text-white/70">· {o.region === "Head Office" ? "Head office" : o.region}</span>
                  </p>
                  <p className="mt-1 text-sm text-white/70">{o.address}</p>
                  <a href={telHref(o.phone)} className="mt-2 inline-block text-sm font-semibold tabular-nums text-white hover:underline">
                    {o.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/60">
          © {new Date().getFullYear()} {company.legalName}. A member of the Lotte Group. Concept redesign — not the official website.
        </p>
      </div>
    </footer>
  );
}
