import { ArrowUp, ArrowUpRight } from "lucide-react";

import { SocialIcon } from "@/components/ui/social-icon";
import { band, footerContent, navigationOrder, sections } from "@/data/band-data";

const eyebrowClassName = "font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-border bg-surface">
      <div className="container-page pt-16 pb-8 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className={eyebrowClassName}>{footerContent.contactEyebrow}</p>
            <a
              href={`mailto:${band.contactEmail}`}
              className="link-underline mt-4 inline font-display text-[clamp(2rem,6vw,4.5rem)] font-bold leading-tight [overflow-wrap:anywhere] font-stretch-condensed"
            >
              {band.contactEmail}
            </a>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {band.slogan}
            </p>
          </div>

          <nav aria-label="Sezioni del sito" className="lg:col-span-3">
            <p className={eyebrowClassName}>Sezioni</p>
            <ul className="mt-4 space-y-2.5">
              {navigationOrder.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className="link-strike text-base">
                    {sections[id].navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className={eyebrowClassName}>Social</p>
            <ul className="mt-4 space-y-2.5">
              {band.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-base"
                  >
                    <SocialIcon platform={social.platform} className="size-4" />
                    <span className="link-strike">{social.label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {social.handle}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <span className="sr-only">(si apre in una nuova scheda)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="text-outline mt-20 select-none font-display text-[clamp(4rem,21vw,23rem)] font-black uppercase leading-[0.75] tracking-[-0.02em] opacity-25 font-stretch-condensed"
        >
          {band.name}
        </p>

        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-6 md:flex-row md:items-start md:justify-between">
          <p className={eyebrowClassName}>
            © {year} {band.name}
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            {footerContent.disclaimer}
          </p>
          <a
            href="#top"
            className={`link-underline inline-flex items-center gap-2 self-start ${eyebrowClassName} hover:text-foreground`}
          >
            Torna su <ArrowUp className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
