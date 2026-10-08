/**
 * Adapter between the site (collections, config, copy) and the flyer generator: lists every
 * downloadable file and knows how to produce it. Used by the /volantini/ endpoint.
 */
import { getCollection } from 'astro:content';
import { copy } from '@/config/copy';
import { site } from '@/config/site';
import type { EventEntry } from './content';
import { getEvents } from './content';
import { eventPath, placeLabel } from './events';
import {
  eventScene,
  flyerFiles,
  FORMAT_PIXELS,
  promoScene,
  TOUR_MAX_ROWS,
  tourScene,
  type EventFlyer,
  type FlyerTexts,
  type PromoFlyer,
  type Scene,
} from './flyer/layout';
import { jpegToPdf } from './flyer/pdf';
import { renderScene } from './flyer/render';
import { fill } from './text';

export interface FlyerFile {
  /** File name under /volantini/. */
  name: string;
  type: string;
  build: () => Promise<Uint8Array>;
}

const texts: FlyerTexts = {
  tribute: copy.flyer.tribute,
  timePrefix: copy.flyer.timePrefix,
  doorsPrefix: copy.flyer.doorsPrefix,
  social: [
    { icon: 'instagram', text: site.social.instagram.handle.replace(/^@/, '') },
    { icon: 'facebook', text: site.social.facebook.handle },
  ],
};

function eventFlyer(event: EventEntry, siteUrl: URL): EventFlyer {
  const { data } = event;
  return {
    date: data.date,
    time: data.time,
    doorsTime: data.doorsTime,
    title: data.title,
    venue: data.venue,
    place: placeLabel(data),
    extra: data.flyerNote,
    variant: data.flyerVariant,
    venueLogo: data.venueLogo,
    venueLogoTone: data.venueLogoTone,
    showVenueName: data.showVenueName,
    // Private nights have no public page to point at.
    url: data.private ? null : new URL(eventPath(event.id), siteUrl).href,
  };
}

/** Sheets are drawn once per build even when several files come from the same one. */
const sheets = new Map<string, Promise<Buffer>>();
function jpeg(key: string, scene: () => Scene, format: keyof typeof FORMAT_PIXELS): Promise<Buffer> {
  let sheet = sheets.get(key);
  if (!sheet) {
    sheet = renderScene(scene(), FORMAT_PIXELS[format]).then((image) =>
      // Baseline RGB JPEG: it is also embedded as it is in the PDF.
      image.jpeg({ quality: format === 'a4' ? 88 : 86, progressive: false, mozjpeg: false }).toBuffer(),
    );
    sheets.set(key, sheet);
  }
  return sheet;
}

const A4_HEIGHT = Math.round(FORMAT_PIXELS.a4 * 1.414);
const name = (path: string) => path.replace('/volantini/', '');

/** Files of a sheet that exists in A4 (image and PDF) and in the Instagram format. */
function sheetFiles(id: string, scene: (format: 'a4' | 'instagram') => Scene): FlyerFile[] {
  const files = flyerFiles(id);
  const a4 = () => jpeg(`${id}-a4`, () => scene('a4'), 'a4');
  return [
    { name: name(files.a4), type: 'image/jpeg', build: a4 },
    { name: name(files.pdf), type: 'application/pdf', build: async () => jpegToPdf(await a4(), FORMAT_PIXELS.a4, A4_HEIGHT) },
    { name: name(files.instagram), type: 'image/jpeg', build: () => jpeg(`${id}-instagram`, () => scene('instagram'), 'instagram') },
    {
      name: name(files.thumbnail),
      type: 'image/webp',
      build: async () => (await import('sharp')).default(await a4()).resize({ width: 640 }).webp({ quality: 78 }).toBuffer(),
    },
  ];
}

const promoValues = { name: site.name, duration: site.show.durationLabel };
function promo(kind: 'band' | 'wedding', siteUrl: URL): PromoFlyer {
  const text = copy.flyer[kind];
  return {
    variant: kind === 'wedding' ? 'matrimoni' : 'base',
    headline: text.headline,
    subline: fill(text.subline, promoValues),
    contactLabel: copy.flyer.contactLabel,
    contact: site.contact.phoneDisplay,
    url: new URL('/booking/', siteUrl).href,
  };
}

/** Ids of the flyers that are not tied to a date. */
export const PROMO_FLYERS = { band: 'thundra', wedding: 'matrimoni', tour: 'date' } as const;

/** Every file under /volantini/, for every date (private ones included) plus tour and promos. */
export async function listFlyerFiles(siteUrl: URL): Promise<FlyerFile[]> {
  const events = await getCollection('events');
  const { upcoming } = await getEvents();
  const files: FlyerFile[] = [];
  for (const event of events) {
    const flyer = eventFlyer(event, siteUrl);
    files.push(...sheetFiles(event.id, (format) => eventScene(flyer, format, texts)));
    files.push({
      name: name(flyerFiles(event.id).preview),
      type: 'image/jpeg',
      build: () => jpeg(`${event.id}-wide`, () => eventScene(flyer, 'wide', texts), 'wide'),
    });
  }
  files.push(...sheetFiles(PROMO_FLYERS.band, (format) => promoScene(promo('band', siteUrl), format, texts)));
  files.push(...sheetFiles(PROMO_FLYERS.wedding, (format) => promoScene(promo('wedding', siteUrl), format, texts)));
  if (upcoming.length > 0) {
    const rows = upcoming.slice(0, TOUR_MAX_ROWS).map((event) => ({
      date: event.data.date,
      venue: event.data.venue,
      place: placeLabel(event.data),
      venueLogo: event.data.venueLogo,
      venueLogoTone: event.data.venueLogoTone,
    }));
    files.push({
      name: name(flyerFiles(PROMO_FLYERS.tour).instagram),
      type: 'image/jpeg',
      build: () =>
        jpeg('tour', () => tourScene(rows, { ...texts, title: copy.flyer.tourTitle, footer: copy.flyer.tourFooter }), 'instagram'),
    });
  }
  return files;
}
