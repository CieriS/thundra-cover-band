import type { TourDate } from "@/data/band-data";
import { getTodayIsoDate } from "@/lib/format";

/** Finestra entro cui un concerto non esaurito mostra il conto alla rovescia. */
const COUNTDOWN_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Solo le date di oggi o future (già ordinate): quelle passate spariscono da sole. */
export function getUpcomingShows(shows: readonly TourDate[], today: string = getTodayIsoDate()): TourDate[] {
  return shows.filter((show) => show.date >= today);
}

/** Prossimo concerto non esaurito: destinazione della CTA "Prossima data". */
export function getNextShow(upcomingShows: readonly TourDate[]): TourDate | undefined {
  return upcomingShows.find((show) => show.status !== "SOLD_OUT");
}

export function hasTickets(show: TourDate): boolean {
  return (show.status === "AVAILABLE" || show.status === "LOW_STOCK") && Boolean(show.ticketUrl);
}

export interface ShowUrgency {
  /** Ultimo concerto in calendario. */
  lastDate: boolean;
  /** Giorni mancanti, solo per concerti non esauriti entro `COUNTDOWN_DAYS`. */
  daysUntil: number | null;
}

/**
 * Segnali di urgenza derivati solo da dati reali del calendario. "In esaurimento"
 * non viene mai dedotto: è lo stato LOW_STOCK impostato a mano dal pannello.
 */
export function getShowUrgency(show: TourDate, upcomingShows: readonly TourDate[], today: string): ShowUrgency {
  const daysUntil = Math.round((Date.parse(show.date) - Date.parse(today)) / DAY_MS);

  return {
    lastDate: upcomingShows.at(-1)?.id === show.id,
    daysUntil: show.status !== "SOLD_OUT" && daysUntil <= COUNTDOWN_DAYS ? daysUntil : null,
  };
}

export function formatCountdown(days: number): string {
  if (days <= 0) return "Stasera";
  if (days === 1) return "Domani";
  return `Tra ${days} giorni`;
}
