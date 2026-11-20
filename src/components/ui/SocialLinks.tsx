import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { socialLinks } from "@/data/company";
import { cn } from "@/lib/cn";

const icons = { instagram: Instagram, facebook: Facebook, youtube: Youtube, linkedin: Linkedin } as const;

/** Official Lotte India social channels, for dark footers. */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul aria-label="Lotte India on social media" className={cn("flex gap-2", className)}>
      {socialLinks.map(({ id, label, href }) => {
        const Icon = icons[id];
        return (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/80 transition hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#161616]"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{label} (opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
