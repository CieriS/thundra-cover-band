/** Builds the JSON-LD of the site from config and collections (adapter over structured-data). */
import { copy } from '@/config/copy';
import { site } from '@/config/site';
import { fill } from './text';
import type { EventEntry } from './content';
import { getMembers } from './content';
import { dateParts } from './dates';
import { countdownTarget, eventPath, placeLabel } from './events';
import { musicEvent, musicGroup, utcOffset, webSite, type BandInfo } from './structured-data';

/** Values for the {tokens} of the search texts in copy.seo. */
export const seoValues = {
  name: site.name,
  cities: site.area.cities.join(', '),
  area: `${site.area.cities.join(', ')} ${site.area.note}`,
  duration: site.show.durationLabel,
} as const;

/** Title and description of a page, with the tokens filled in. */
export function seoText(page: { title: string; description?: string }, extra: Readonly<Record<string, string>> = {}) {
  const values = { ...seoValues, ...extra };
  return {
    title: fill(page.title, values),
    ...(page.description ? { description: fill(page.description, values) } : {}),
  };
}

/** Values for the tokens that describe one date: venue, city, place and the date in two lengths. */
export function eventValues(event: EventEntry) {
  const date = dateParts(event.data.date);
  return {
    venue: event.data.venue,
    city: event.data.city,
    place: placeLabel(event.data),
    dateShort: `${Number(date.day)} ${date.month.toLowerCase()} ${date.year}`,
    dateLong: date.long,
  };
}

async function bandInfo(siteUrl: URL): Promise<BandInfo> {
  const members = await getMembers();
  return {
    name: site.name,
    subtitle: site.subtitle,
    description: site.description,
    url: new URL('/', siteUrl).href,
    image: new URL('/og.jpg', siteUrl).href,
    sameAs: [site.social.instagram.url, site.social.facebook.url],
    areaServed: site.area.cities,
    members: members.map((member) => ({ name: member.data.name, role: member.data.role })),
  };
}

/** The site itself: helps search engines show the right site name. */
export function siteJsonLd(siteUrl: URL) {
  return webSite({ name: `${site.name} - ${site.subtitle}`, url: new URL('/', siteUrl).href, language: site.lang });
}

export async function bandJsonLd(siteUrl: URL) {
  return musicGroup(await bandInfo(siteUrl));
}

/** One MusicEvent per upcoming date, pointing at its anchor on /date/. */
export async function eventsJsonLd(events: readonly EventEntry[], siteUrl: URL) {
  const band = await bandInfo(siteUrl);
  return events.map((event) =>
    musicEvent(event.data, {
      band,
      url: new URL(eventPath(event.id), siteUrl).href,
      offset: utcOffset(countdownTarget(event.data, site.timeZone), site.timeZone),
      durationMinutes: site.show.durationMinutes,
      description: fill(copy.seo.eventDescription, seoValues),
    }),
  );
}
