import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { ResponsiveImage } from "@/components/ui/responsive-image";
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
import { useToday } from "@/hooks/use-today";
import { getDateParts } from "@/lib/format";
import { formatCountdown, getShowUrgency, getUpcomingShows, hasTickets, type ShowUrgency } from "@/lib/tour";
import { cn } from "@/lib/utils";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

function StatusBadge({ status }: { status: TourStatus }) {
  const { label } = tourStatusMeta[status];

  switch (status) {
    case "LOW_STOCK":
      return (
        <Badge variant="accent">
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-foreground opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent-foreground" />
          </span>
          {label}
        </Badge>
      );
    case "AVAILABLE":
      return (
        <Badge variant="outline">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {label}
        </Badge>
      );
    case "CONFIRMED":
      return <Badge variant="muted">{label}</Badge>;
    case "SOLD_OUT":
      return (
        <Badge variant="muted" className="line-through decoration-accent decoration-2">
          {label}
        </Badge>
      );
  }
}

/** Stato del concerto più i segnali di urgenza reali (conto alla rovescia, ultima data). */
function ShowTags({ show, urgency }: { show: TourDate; urgency: ShowUrgency }) {
  return (
    <ul aria-label="Disponibilità" className="flex flex-wrap gap-2">
      <li>
        <StatusBadge status={show.status} />
      </li>
      {urgency.daysUntil !== null && (
        <li>
          <Badge variant="inverse">{formatCountdown(urgency.daysUntil)}</Badge>
        </li>
      )}
      {urgency.lastDate && (
        <li>
          <Badge variant="warning">Ultima data</Badge>
        </li>
      )}
    </ul>
  );
}

function TourAction({ show }: { show: TourDate }) {
  const { actionLabel } = tourStatusMeta[show.status];

  if (hasTickets(show)) {
    return (
      <Button asChild variant="accent" size="md" className="w-full md:w-auto">
        <a href={show.ticketUrl} target="_blank" rel="noopener noreferrer">
          {actionLabel}
          <ArrowUpRight aria-hidden="true" />
          <span className="sr-only">
            per {show.venue}, {show.city} (si apre in una nuova scheda)
          </span>
        </a>
      </Button>
    );
  }

  return <p className={cn(monoClassName, "text-muted-foreground")}>{actionLabel}</p>;
}

export function TourDates() {
  const today = useToday();
  const upcomingShows = getUpcomingShows(tourDates, today);
  const onSaleCount = upcomingShows.filter(hasTickets).length;

  return (
    <section id="tour" aria-labelledby="tour-title" className="section-y">
      <div className="container-page">
        <SectionHeader copy={sections.tour} titleId="tour-title" />

        {upcomingShows.length > 0 ? (
          <>
            <Reveal
              className={cn(
                monoClassName,
                "mt-10 flex flex-wrap items-center justify-between gap-4 text-muted-foreground lg:mt-20",
              )}
            >
              <p>
                <span className="text-foreground">{upcomingShows.length}</span> date ·{" "}
                <span className="text-foreground">{onSaleCount}</span> con biglietti online
              </p>
              <ul className="hidden flex-wrap gap-2 md:flex" aria-label="Legenda stati">
                {(Object.keys(tourStatusMeta) as TourStatus[]).map((status) => (
                  <li key={status}>
                    <StatusBadge status={status} />
                  </li>
                ))}
              </ul>
            </Reveal>

            <ol className="mt-4 grid gap-3 md:mt-6 md:gap-0 md:border-t md:border-foreground">
              {upcomingShows.map((show) => {
                const date = getDateParts(show.date);
                const urgency = getShowUrgency(show, upcomingShows, today);

                return (
                  <li
                    key={show.id}
                    id={`show-${show.id}`}
                    className="reveal grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 border border-border bg-surface p-4 target:border-accent md:grid-cols-[6rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,13rem)_10rem] md:items-center md:gap-x-6 md:border-x-0 md:border-t-0 md:bg-transparent md:px-4 md:py-6 md:target:bg-surface"
                  >
                    <time dateTime={show.date} className="flex flex-col">
                      <span className="font-display text-5xl leading-[0.9] tabular-nums md:text-6xl">
                        {date.day}
                      </span>
                      <span className={cn(monoClassName, "mt-1 text-muted-foreground")}>
                        {date.monthShort} {date.year}
                      </span>
                    </time>

                    <div className="min-w-0 self-center">
                      <h3 className="font-display text-2xl uppercase leading-none sm:text-3xl">{show.venue}</h3>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        {show.city} ({show.province})
                      </p>
                    </div>

                    <p className={cn(monoClassName, "col-span-2 -mt-1 text-muted-foreground md:col-span-1 md:mt-0")}>
                      {date.weekdayShort} · Porte {show.doorsTime}
                      {show.note && <span className="text-foreground"> · {show.note}</span>}
                    </p>

                    <div className="col-span-2 md:col-span-1">
                      <ShowTags show={show} urgency={urgency} />
                    </div>

                    <div
                      className={cn(
                        "col-span-2 md:col-span-1 md:justify-self-end",
                        show.status === "SOLD_OUT" && "hidden md:block",
                      )}
                    >
                      <TourAction show={show} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <Reveal className="mt-10 border-y border-foreground py-12">
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{tourEmptyMessage}</p>
          </Reveal>
        )}

        <Reveal className="mt-10 lg:mt-16">
          <Card className="relative isolate grid gap-6 overflow-hidden p-5 sm:p-8 md:grid-cols-12 md:items-center md:py-16">
            <ResponsiveImage
              image={media.crowd}
              sizes="100vw"
              decorative
              className="absolute inset-0 -z-10 size-full object-cover opacity-60"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/85 to-background/40 md:bg-linear-to-r md:to-background/20"
            />
            <div className="md:col-span-8">
              <CardTitle>{tourCta.title}</CardTitle>
              <CardDescription className="mt-3 max-w-xl text-base">{tourCta.description}</CardDescription>
            </div>
            <div className="md:col-span-4 md:justify-self-end">
              <Button asChild variant="primary" size="lg" className="w-full md:w-auto">
                <a href="#booking">
                  {tourCta.action}
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
