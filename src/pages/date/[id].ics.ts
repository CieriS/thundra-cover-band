import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '@/config/site';
import { getPublicEvents, type EventEntry } from '@/lib/content';
import { eventPath } from '@/lib/events';
import { buildIcs } from '@/lib/ics';

/** One downloadable calendar file per event: adding a date file is enough. */
export const getStaticPaths: GetStaticPaths = async () =>
  (await getPublicEvents()).map((event) => ({ params: { id: event.id }, props: { event } }));

export const GET: APIRoute<{ event: EventEntry }> = ({ props, site: siteUrl }) => {
  const { event } = props;
  const base = siteUrl ?? new URL('http://localhost');
  const body = buildIcs(event.data, {
    uid: `${event.id}@${base.hostname}`,
    url: new URL(eventPath(event.id), base).href,
    summary: `${site.name} - ${site.subtitle} live @ ${event.data.venue}`,
    durationMinutes: site.show.durationMinutes,
    timeZone: site.timeZone,
    stamp: new Date(),
  });
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="thundra-${event.id}.ics"`,
    },
  });
};
