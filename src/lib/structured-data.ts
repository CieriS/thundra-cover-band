/** schema.org JSON-LD builders. Pure: every input is passed in. */
import { nextDay } from './dates';
import { type EventData } from './events';

export interface BandInfo {
  name: string;
  subtitle: string;
  description: string;
  url: string;
  image: string;
  sameAs: readonly string[];
  areaServed: readonly string[];
  members: readonly { name: string; role: string }[];
}

const STATUS = {
  scheduled: 'https://schema.org/EventScheduled',
  cancelled: 'https://schema.org/EventCancelled',
  postponed: 'https://schema.org/EventPostponed',
} as const;

function performer(band: Pick<BandInfo, 'name' | 'url'>) {
  return { '@type': 'MusicGroup', name: band.name, url: band.url };
}

export function musicGroup(band: BandInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `${band.url}#band`,
    name: band.name,
    alternateName: `${band.name} - ${band.subtitle}`,
    description: band.description,
    url: band.url,
    image: band.image,
    genre: ['Hard rock', 'Tribute band'],
    sameAs: [...band.sameAs],
    areaServed: band.areaServed.map((name) => ({ '@type': 'City', name })),
    member: band.members.map((member) => ({
      '@type': 'OrganizationRole',
      roleName: member.role,
      member: { '@type': 'Person', name: member.name },
    })),
  };
}

export interface EventContext {
  band: Pick<BandInfo, 'name' | 'subtitle' | 'url' | 'image'>;
  /** Canonical page that lists the event. */
  url: string;
  /** UTC offset of the venue at start time, e.g. "+01:00". */
  offset: string;
  durationMinutes: number;
}

/** startDate is a full local date-time when the time is known, a plain date otherwise. */
export function musicEvent(event: EventData, context: EventContext) {
  const startDate = event.time ? `${event.date}T${event.time}:00${context.offset}` : event.date;
  const endDate = event.time ? undefined : nextDay(event.date);
  const offers = event.admission
    ? {
        offers: {
          '@type': 'Offer',
          url: event.bookingUrl ?? context.url,
          availability: 'https://schema.org/InStock',
          ...(event.admission === 'free' ? { price: '0', priceCurrency: 'EUR' } : {}),
        },
      }
    : {};
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: `${context.band.name} - ${context.band.subtitle} live @ ${event.venue}`,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: STATUS[event.status],
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: context.url,
    image: context.band.image,
    location: {
      '@type': 'MusicVenue',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        ...(event.address ? { streetAddress: event.address } : {}),
        addressLocality: event.city,
        addressRegion: event.province,
        addressCountry: 'IT',
      },
    },
    performer: performer(context.band),
    organizer: performer(context.band),
    ...offers,
  };
}

/** UTC offset string ("+02:00") for an instant in a time zone. */
export function utcOffset(instant: Date, timeZone: string): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = /GMT([+-]\d{2}:\d{2})?/.exec(name ?? '');
  if (!match) throw new Error(`Cannot resolve offset for ${timeZone}`);
  return match[1] ?? '+00:00';
}

/** Safe to inline in a <script type="application/ld+json">. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
