import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { LotteMark } from "@/components/brand/LotteMark";
import { companyName, utilityLinks } from "@/data/disclosures";
import { hubs } from "@/data/milestones";

const columns = [
  {
    title: "About Lotte",
    links: [
      { href: "/story", label: "Our Story" },
      { href: "/story#values", label: "Vision & Values" },
      { href: "/story#archive-title", label: "Milestones" },
      { href: "/reach", label: "Manufacturing & Reach" },
    ],
  },
  {
    title: "Lotte Brands",
    links: [
      { href: "/brands#pies", label: "Pies" },
      { href: "/brands#chocolates", label: "Chocolates & Biscuits" },
      { href: "/brands#toffees", label: "Toffees & Eclairs" },
      { href: "/brands#candies", label: "Candies & Treats" },
    ],
  },
  {
    title: "Connect",
    links: [
      { href: "/careers", label: "Grow With Lotte" },
      { href: "/investors", label: "Investor Centre" },
      { href: "/faq", label: "FAQ" },
      { href: "/faq#contact", label: "Contact & Enquiry" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mesh-noir grain relative overflow-hidden text-alabaster">
      <BrandGlyph
        filled={false}
        className="pointer-events-none absolute -bottom-40 -right-32 h-[34rem] w-[34rem] text-lotte/15"
      />
      <div className="container relative z-10 pb-10 pt-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <LotteMark tone="light" />
            <p className="mt-8 max-w-sm font-serif text-3xl italic leading-tight text-alabaster/90">
              Sweet moments, crafted in India for over a century.
            </p>
            <address className="mt-8 space-y-1 text-sm not-italic text-alabaster/60">
              <p className="text-alabaster/85">{companyName}</p>
              <p>Chennai, Tamil Nadu, India</p>
              {/* TODO: Add registered office address, CIN and contact numbers from official records */}
            </address>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="eyebrow !text-lotte-light">{col.title}</h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-alabaster/70 transition hover:text-alabaster">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-alabaster/10 bg-alabaster/10 sm:grid-cols-3">
          {hubs.map((h) => (
            <li key={h.city} className="bg-noir/85 p-5">
              <p className="font-serif text-xl">{h.city}</p>
              <p className="mt-1 text-xs text-alabaster/55">
                {h.state} · {h.role}
              </p>
            </li>
          ))}
        </ul>

        <nav aria-label="Employee and statutory" className="mt-10">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-alabaster/55">
            {utilityLinks.map((u) => (
              <li key={u.label}>
                {/* TODO: Point to the live webmail, employee portal and Form 5A documents */}
                <a href={u.href} className="group inline-flex items-center gap-1.5 transition hover:text-alabaster">
                  <span className="font-semibold text-alabaster/75 group-hover:text-alabaster">{u.label}</span>
                  <span className="hidden sm:inline">· {u.detail}</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col gap-4 border-t border-alabaster/10 pt-6 text-xs text-alabaster/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {companyName}. A member of the Lotte Group. Concept redesign — not the official website.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/investors#disclosures" className="hover:text-alabaster">
                Legal
              </Link>
            </li>
            <li>
              <Link href="/faq#contact" className="hover:text-alabaster">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
