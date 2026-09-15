import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Reveal, StaggerItem, StaggerList } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import {
  media,
  sections,
  tourCta,
  tourDates,
  tourEmptyMessage,
  tourStatusMeta,
  type TourDate,
  type TourStatus,
} from "@/data/band-data";
import { getDateParts } from "@/lib/format";
import { getUpcomingShows } from "@/lib/tour";
import { cn } from "@/lib/utils";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

function StatusBadge({ status }: { status: TourStatus }) {
  const { label } = tourStatusMeta[status];

  if (status === "AVAILABLE") {
    return (
      <Badge variant="accent">
        <span className="size-1.5 rounded-full bg-accent-foreground" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <Badge variant="outline">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  return <Badge variant="muted">{label}</Badge>;
}

function TourAction({ show }: { show: TourDate }) {
  const { actionLabel } = tourStatusMeta[show.status];

  if (show.status === "AVAILABLE" && show.ticketUrl) {
    return (
      <Button asChild variant="primary" size="sm">
        <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">
          {actionLabel}
          <ArrowUpRight />
          <span className="sr-only">
            per {show.venue}, {show.city} (si apre in una nuova scheda)
          </span>
        </a>
      </Button>
    );
  }

  return (
    <span
      className={cn(
        monoClassName,
        "text-muted-foreground",
        show.status === "SOLD_OUT" && "line-through decoration-accent decoration-2",
      )}
    >
      {actionLabel}
    </span>
  );
}

const upcomingShows = getUpcomingShows(tourDates);

export function TourDates() {
  const availableCount = upcomingShows.filter((show) => show.status === "AVAILABLE").length;

  return (
    <section id="tour" aria-labelledby="tour-title" className="section-y">
      <div className="container-page">
        <SectionHeader copy={sections.tour} titleId="tour-title" />

        <Reveal
          className={cn(
            monoClassName,
            "mt-14 flex flex-wrap items-center justify-between gap-4 text-muted-foreground lg:mt-20",
          )}
        >
          <p>
            <span className="text-foreground">{upcomingShows.length}</span> date ·{" "}
            <span className="text-foreground">{availableCount}</span> con prevendite aperte
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Legenda stati">
            {(Object.keys(tourStatusMeta) as TourStatus[]).map((status) => (
              <li key={status}>
                <StatusBadge status={status} />
              </li>
            ))}
          </ul>
        </Reveal>

        {upcomingShows.length > 0 ? (
        <StaggerList className="mt-6 border-t border-foreground">
          {upcomingShows.map((show) => {
            const date = getDateParts(show.date);

            return (
              <StaggerItem
                key={show.id}
                className="group relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 border-b border-border py-6 transition-colors duration-300 hover:bg-surface sm:grid-cols-[6rem_minmax(0,1fr)] md:grid-cols-[7rem_minmax(0,1.5fr)_minmax(0,1fr)_8.5rem_10rem] md:items-center md:gap-x-6 md:px-4"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100"
                />

                <p>
                  <time dateTime={show.date} className="block">
                    <span className="block font-display text-5xl font-black leading-none tabular-nums font-stretch-condensed sm:text-6xl">
                      {date.day}
                    </span>
                    <span className={cn(monoClassName, "mt-1 block text-muted-foreground")}>
                      {date.monthShort} {date.year}
                    </span>
                  </time>
                </p>

                <div className="flex flex-col gap-3 md:contents">
                  <div>
                    <h3 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight font-stretch-condensed sm:text-3xl">
                      {show.venue}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      {show.city} ({show.province})
                    </p>
                  </div>

                  <p className={cn(monoClassName, "text-muted-foreground")}>
                    {date.weekdayShort} · Porte {show.doorsTime}
                    {show.note && <span className="mt-1 block text-foreground">{show.note}</span>}
                  </p>

                  <div>
                    <StatusBadge status={show.status} />
                  </div>

                  <div className="md:justify-self-end">
                    <TourAction show={show} />
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
        ) : (
          <Reveal className="mt-6 border-y border-foreground py-12">
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{tourEmptyMessage}</p>
          </Reveal>
        )}

        <Reveal className="mt-12 lg:mt-16">
          {/* Card sempre scura (token `.dark` locali) per restare leggibile sopra la foto */}
          <Card className="dark relative isolate grid gap-6 overflow-hidden p-5 sm:p-8 md:grid-cols-12 md:items-center md:py-16">
            <img
              src={media.crowd.src}
              alt=""
              aria-hidden="true"
              width={media.crowd.width}
              height={media.crowd.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/85 to-background/20"
            />
            <div className="md:col-span-8">
              <CardTitle>{tourCta.title}</CardTitle>
              <CardDescription className="mt-3 max-w-xl text-base">{tourCta.description}</CardDescription>
            </div>
            <div className="md:col-span-4 md:justify-self-end">
              <Button asChild variant="primary" size="lg">
                <a href="#booking">
                  {tourCta.action}
                  <ArrowRight />
                </a>
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
