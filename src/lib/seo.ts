/** Builds the JSON-LD of the site from config and collections (adapter over structured-data). */
import { site } from '@/config/site';
import type { EventEntry } from './content';
import { getMembers } from './content';
import { countdownTarget } from './events';
import { musicEvent, musicGroup, utcOffset, type BandInfo } from './structured-data';

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

export async function bandJsonLd(siteUrl: URL) {
  return musicGroup(await bandInfo(siteUrl));
}

/** One MusicEvent per upcoming date, pointing at its anchor on /date/. */
export async function eventsJsonLd(events: readonly EventEntry[], siteUrl: URL) {
  const band = await bandInfo(siteUrl);
  return events.map((event) =>
    musicEvent(event.data, {
      band,
      url: new URL(`/date/#${event.id}`, siteUrl).href,
      offset: utcOffset(countdownTarget(event.data, site.timeZone), site.timeZone),
      durationMinutes: site.show.durationMinutes,
    }),
  );
}
