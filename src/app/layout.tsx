import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ConceptBanner } from "@/components/ui/ConceptBanner";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { RouteFocus } from "@/components/ui/RouteFocus";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lotteindia.com"),
  // Concept preview: keep every page out of search results so it can't be confused with the official site.
  robots: { index: false, follow: false },
  title: {
    default: "Lotte India — Crafting Sweet Moments Since 1914",
    template: "%s · Lotte India",
  },
  description:
    "From the Parrys Confectionery legacy of 1914 to Lotte Choco Pie, Coffy Bite and Pepero — Lotte India crafts confectionery loved across a million Indian storefronts.",
  openGraph: {
    type: "website",
    siteName: "Lotte India",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#E73437",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-noir focus:px-5 focus:py-3 focus:text-cream"
          >
            Skip to content
          </a>
          <ConceptBanner />
          <SmoothScroll />
          <ScrollProgress />
          <RouteFocus />
          {/* Each route group renders its own header, <main id="main"> and footer. */}
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
