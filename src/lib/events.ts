/** Pure event logic: upcoming/past split, start instant, links. No Astro imports. */
import { zonedTimeToUtc } from './dates';

export interface EventData {
  date: string;
  time?: string | null | undefined;
  venue: string;
  city: string;
  province: string;
  address?: string | null | undefined;
  mapsUrl?: string | null | undefined;
  admission?: 'free' | 'paid' | null | undefined;
  price?: string | null | undefined;
  bookingUrl?: string | null | undefined;
  bookingLabel?: string | null | undefined;
  note?: string | null | undefined;
  status: 'scheduled' | 'cancelled' | 'postponed';
}

export interface EventLike {
  id: string;
  data: EventData;
}

/** An event stays "upcoming" for the whole day it takes place. */
export function isPast(event: EventLike, today: string): boolean {
  return event.data.date < today;
}

/** Upcoming events soonest first, past events most recent first. */
export function splitEvents<T extends EventLike>(
  events: readonly T[],
  today: string,
): { upcoming: T[]; past: T[] } {
  const byDate = (a: T, b: T) =>
    a.data.date.localeCompare(b.data.date) || a.id.localeCompare(b.id);
  return {
    upcoming: events.filter((event) => !isPast(event, today)).sort(byDate),
    past: events
      .filter((event) => isPast(event, today))
      .sort(byDate)
      .reverse(),
  };
}

/** First upcoming event that is not cancelled. */
export function nextEvent<T extends EventLike>(upcoming: readonly T[]): T | undefined {
  return upcoming.find((event) => event.data.status !== 'cancelled');
}

/** Start instant, or null while the time is not confirmed. */
export function eventStart(event: EventData, timeZone: string): Date | null {
  return event.time ? zonedTimeToUtc(event.date, event.time, timeZone) : null;
}

/** Instant the countdown points at: the start time, or midnight of the day if unknown. */
export function countdownTarget(event: EventData, timeZone: string): Date {
  return zonedTimeToUtc(event.date, event.time ?? '00:00', timeZone);
}

/** "Lama di Reno (BO)" */
export function placeLabel(event: Pick<EventData, 'city' | 'province'>): string {
  return `${event.city} (${event.province})`;
}

/** Explicit Google Maps link, or a search for venue and city when none is set. */
export function mapsUrl(event: EventData): string {
  if (event.mapsUrl) return event.mapsUrl;
  const query = [event.venue, event.address, event.city, event.province].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "Ingresso libero", "Ingresso 10 €", or null when not known yet. */
export function admissionLabel(event: Pick<EventData, 'admission' | 'price'>): string | null {
  if (event.admission === 'free') return 'Ingresso libero';
  if (event.admission === 'paid') return event.price ? `Ingresso ${event.price}` : 'Ingresso a pagamento';
  return null;
}

/** Unique cities of the given events, in order of appearance. */
export function uniqueCities(events: readonly EventLike[]): string[] {
  return [...new Set(events.map((event) => event.data.city))];
}
