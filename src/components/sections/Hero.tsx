import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { band, hero, setlist, tourDates } from "@/data/band-data";
import { getDateParts } from "@/lib/format";
import { easeOutExpo } from "@/lib/motion";
import { getUpcomingShows } from "@/lib/tour";
import { cn } from "@/lib/utils";

/** Profilo statico della waveform: valori letterali per un markup SSR deterministico. */
const WAVEFORM = [
  0.32, 0.54, 0.41, 0.72, 0.58, 0.9, 0.66, 0.44, 0.78, 1, 0.7, 0.52, 0.84, 0.62, 0.38, 0.56, 0.8,
  0.94, 0.6, 0.46, 0.74, 0.88, 0.5, 0.34, 0.64, 0.82, 0.96, 0.7, 0.48, 0.58, 0.86, 0.66, 0.42, 0.3,
  0.52, 0.76, 0.6, 0.4, 0.28, 0.36,
] as const;

const PLAYED_BARS = 15;

const featuredTitle = hero.featuredSongTitle.trim().toLowerCase();
const featuredSong = setlist.find((song) => song.title.toLowerCase() === featuredTitle) ?? setlist[0];
const featuredTrackNumber = setlist.indexOf(featuredSong) + 1;
const nextShow = getUpcomingShows(tourDates).find((show) => show.status !== "SOLD_OUT");
const headlineLetters = band.name.toUpperCase().split("");

export function Hero() {
  const nextShowDate = nextShow ? getDateParts(nextShow.date) : null;

  return (
    <section id="top" aria-label={`${band.name} — ${band.tagline}`} className="relative pt-24 sm:pt-28">
      <div
        aria-hidden="true"
        className="bg-columns pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          <span>[ {hero.eyebrow} ]</span>
          <span className="hidden md:inline">
            Est. {band.foundedYear} — {band.baseCity}, {band.countryCode}
          </span>
          <span className="inline-flex items-center gap-2 text-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {hero.availability}
          </span>
        </motion.div>

        <h1 className="mt-6 font-display text-[clamp(4rem,21vw,23rem)] font-black uppercase leading-[0.8] tracking-[-0.02em] font-stretch-condensed sm:mt-10">
          <span className="sr-only">
            {band.name} — {band.tagline}
          </span>
          <span aria-hidden="true" className="flex overflow-hidden pb-[0.04em]">
            {headlineLetters.map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: easeOutExpo, delay: 0.15 + index * 0.05 }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-12 lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.55 }}
            className="lg:col-span-5"
          >
            <p className="font-display text-3xl font-extrabold uppercase leading-[0.95] text-balance font-stretch-condensed sm:text-4xl">
              {band.slogan}
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
              {band.shortBio}
            </p>

            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Button asChild variant="accent" size="lg">
                <a href="#booking">
                  {hero.primaryCta}
                  <ArrowUpRight />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#tour">
                  {hero.secondaryCta}
                  <ArrowDown />
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.7 }}
            className="lg:col-span-6 lg:col-start-7"
          >
            <figure className="border border-border bg-background/70 p-4 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {hero.signalLabel}
                </span>
                <span className="tabular-nums">
                  Trk {String(featuredTrackNumber).padStart(2, "0")}/{setlist.length}
                </span>
              </div>

              <div aria-hidden="true" className="mt-6 flex h-28 items-center gap-[3px] sm:h-36">
                {WAVEFORM.map((height, index) => (
                  <motion.span
                    key={index}
                    className={cn(
                      "block h-full flex-1 origin-center rounded-full",
                      index < PLAYED_BARS ? "bg-foreground" : "bg-foreground/25",
                      index === PLAYED_BARS && "bg-accent",
                    )}
                    initial={{ scaleY: height }}
                    animate={{ scaleY: [height, height * 0.35, height] }}
                    transition={{
                      duration: 1.1 + (index % 5) * 0.18,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: index * 0.035,
                    }}
                  />
                ))}
              </div>

              <div className="mt-5 h-px w-full bg-border">
                <div className="h-px w-[38%] bg-accent" />
              </div>

              <figcaption className="mt-4 flex items-end justify-between gap-4">
                <span className="min-w-0">
                  <span className="block truncate font-display text-xl font-extrabold uppercase leading-tight font-stretch-condensed sm:text-2xl">
                    {featuredSong.title}
                  </span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {featuredSong.album} · {featuredSong.year}
                  </span>
                </span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {featuredSong.duration}
                </span>
              </figcaption>
            </figure>

            {nextShow && nextShowDate && (
              <a
                href="#tour"
                className="group mt-4 flex items-center justify-between gap-4 border-b border-border py-3 font-mono text-[11px] uppercase tracking-[0.14em]"
              >
                <span className="text-muted-foreground">{hero.nextShowLabel}</span>
                <span className="link-underline truncate text-foreground">
                  {nextShowDate.day} {nextShowDate.monthShort} {nextShowDate.year} · {nextShow.venue},{" "}
                  {nextShow.city}
                </span>
              </a>
            )}
          </motion.div>
        </div>
      </div>

      <div aria-hidden="true" className="relative mt-16 overflow-hidden border-y border-border py-5 sm:mt-24">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {setlist.map((song) => (
                <li
                  key={`${copy}-${song.id}`}
                  className="flex items-center gap-8 pr-8 font-display text-3xl font-extrabold uppercase whitespace-nowrap font-stretch-condensed sm:text-5xl"
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
