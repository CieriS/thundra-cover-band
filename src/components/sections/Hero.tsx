import { ArrowRight, CalendarDays, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { band, hero, media, setlist, tourDates } from "@/data/band-data";
import { useToday } from "@/hooks/use-today";
import { getDateParts } from "@/lib/format";
import { getNextShow, getUpcomingShows } from "@/lib/tour";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

export function Hero() {
  const today = useToday();
  const nextShow = getNextShow(getUpcomingShows(tourDates, today));
  const nextShowDate = nextShow ? getDateParts(nextShow.date) : null;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh_-_var(--bottom-nav-height)_-_var(--safe-bottom))] flex-col overflow-hidden lg:min-h-svh"
    >
      {/* Immagine LCP: caricata subito e con priorità alta, mai in lazy loading. */}
      <ResponsiveImage
        image={media.hero}
        sizes="100vw"
        priority
        className="absolute inset-0 -z-20 size-full object-cover object-[50%_30%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(9_9_11/0.75)_0%,rgb(9_9_11/0.05)_28%,rgb(9_9_11/0.8)_62%,#09090b_100%)]"
      />

      <div className={`${monoClassName} container-page pt-[max(1.25rem,env(safe-area-inset-top))] lg:pt-28`}>
        <p className="flex items-center gap-2">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {hero.availability}
        </p>
      </div>

      <div className="container-page mt-auto pt-16 pb-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-16">
        <div className="lg:col-span-7">
          <p className={`${monoClassName} mb-3 flex items-center gap-2 text-accent-ink`}>
            <Zap className="size-3.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="font-display text-[clamp(5rem,26vw,16rem)] uppercase leading-[0.8] tracking-[-0.01em]"
          >
            {band.name}
            <span className="sr-only"> — {band.tagline}</span>
          </h1>
          <p className="mt-4 max-w-md text-lg font-medium leading-snug text-balance sm:text-xl">{band.slogan}</p>
          <p className="mt-4 hidden max-w-md text-base leading-relaxed text-muted-foreground lg:block">
            {band.shortBio}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:max-w-md lg:col-span-5 lg:col-start-8 lg:mt-0 lg:max-w-none">
          {nextShow && nextShowDate && (
            <Button asChild variant="accent" size="lg" className="min-h-16 justify-between gap-4 py-3 text-left">
              <a href={`#show-${nextShow.id}`}>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span>{hero.nextShowCta}</span>
                  <span className="truncate text-base font-medium normal-case tracking-normal">
                    {nextShowDate.weekdayShort} {Number(nextShowDate.day)} {nextShowDate.monthShort} ·{" "}
                    {nextShow.city}
                  </span>
                </span>
                <CalendarDays className="size-6" aria-hidden="true" />
              </a>
            </Button>
          )}
          <Button asChild variant={nextShow ? "outline" : "accent"} size="lg" className="justify-between">
            <a href="#booking">
              {hero.bookingCta}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>

      <div aria-hidden="true" className="relative hidden overflow-hidden border-y border-border py-5 lg:block">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {setlist.map((song) => (
                <li
                  key={`${copy}-${song.id}`}
                  className="flex items-center gap-8 pr-8 font-display text-5xl uppercase whitespace-nowrap"
                >
                  <span>{song.title}</span>
                  <Zap className="size-5 text-accent-ink" fill="currentColor" strokeWidth={0} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
