import { ArrowUp, ArrowUpRight } from "lucide-react";

import { SocialIcon } from "@/components/ui/social-icon";
import { band, footerContent, sectionOrder, sections } from "@/data/band-data";
import { useToday } from "@/hooks/use-today";

const eyebrowClassName = "font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground";

export function Footer() {
  const year = useToday().slice(0, 4);

  return (
    <footer className="overflow-hidden border-t border-border bg-surface">
      <div className="container-page pt-14 pb-6 sm:pt-24 sm:pb-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <p className={eyebrowClassName}>{footerContent.contactEyebrow}</p>
            <a
              href={`mailto:${band.contactEmail}`}
              className="mt-3 inline-flex min-h-12 items-center font-display text-[clamp(2rem,9vw,4.5rem)] leading-tight underline decoration-accent decoration-2 underline-offset-8 [overflow-wrap:anywhere]"
            >
              {band.contactEmail}
            </a>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{band.slogan}</p>
          </div>

          <nav aria-label="Sezioni del sito" className="lg:col-span-3">
            <p className={eyebrowClassName}>Sezioni</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 lg:grid-cols-1">
              {sectionOrder.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex min-h-12 items-center text-base hover:text-accent-ink">
                    {sections[id].navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className={eyebrowClassName}>Social</p>
            <ul className="mt-2">
              {band.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center gap-3 text-base hover:text-accent-ink"
                  >
                    <SocialIcon platform={social.platform} className="size-5" />
                    <span>{social.label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{social.handle}</span>
                    <ArrowUpRight aria-hidden="true" className="ml-auto size-4 text-muted-foreground lg:ml-0" />
                    <span className="sr-only">(si apre in una nuova scheda)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="text-outline mt-14 select-none font-display text-[clamp(4rem,26vw,23rem)] uppercase leading-[0.8] opacity-25"
        >
          {band.name}
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-start md:justify-between">
          <p className={eyebrowClassName}>
            © {year} {band.name}
          </p>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{footerContent.disclaimer}</p>
          <a
            href="#top"
            className={`inline-flex min-h-12 items-center gap-2 self-start ${eyebrowClassName} hover:text-foreground md:min-h-0`}
          >
            Torna su <ArrowUp className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
