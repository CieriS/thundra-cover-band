/**
 * Pure flyer layout: turns the data of a night (or of the tour, or of a promo) into a scene,
 * a list of positioned elements in a canvas 1000 units wide. No fonts, no files, no images:
 * the renderer measures text and draws. Everything here is covered by tests.
 */
import { FLYER_COLOURS, variants, type FlyerFont, type VariantId } from './variants';

export type FlyerFormat = 'a4' | 'instagram' | 'wide';

/** Canvas height in units for each format (the width is always 1000). */
export const FORMAT_HEIGHT: Record<FlyerFormat, number> = { a4: 1414, instagram: 1250, wide: 525 };

/** Output width in pixels: A4 at 300 dpi, Instagram portrait, link preview. */
export const FORMAT_PIXELS: Record<FlyerFormat, number> = { a4: 2480, instagram: 1080, wide: 1200 };

export interface Segment {
  text: string;
  size: number;
  colour: string;
  font: FlyerFont;
  /** Extra space between letters, in em. */
  tracking?: number;
}

export type Element =
  /** The lightning image, covering a horizontal band of the canvas. */
  | { kind: 'background'; y: number; height: number; hue: number; saturation: number; fadeTo: string }
  /** The band logo, centred on `cx`. */
  | { kind: 'logo'; cx: number; y: number; width: number }
  /** One line of text made of segments on the same baseline; shrunk to `maxWidth` if needed. */
  | { kind: 'line'; x: number; anchor: 'middle' | 'start'; baseline: number; maxWidth: number; segments: Segment[] }
  /** Rounded box holding the logo of the venue. */
  | { kind: 'venueLogo'; x: number; y: number; width: number; height: number; tone: 'light' | 'dark'; source: string }
  | { kind: 'social'; cx: number; baseline: number; size: number; items: { icon: 'instagram' | 'facebook'; text: string }[] }
  | { kind: 'qr'; x: number; y: number; size: number; url: string }
  /** Flat dark veil under the text, where it would otherwise sit on the lightning. */
  | { kind: 'panel'; x: number; y: number; width: number; height: number; colour: string; opacity: number };

export interface Scene {
  width: 1000;
  height: number;
  elements: Element[];
}

/** Texts and fixed data shared by every flyer; they come from the site config and copy. */
export interface FlyerTexts {
  tribute: string;
  timePrefix: string;
  doorsPrefix: string;
  social: { icon: 'instagram' | 'facebook'; text: string }[];
}

export interface EventFlyer {
  date: string;
  time?: string | null | undefined;
  doorsTime?: string | null | undefined;
  /** Name of the night, e.g. "Halloween Party". */
  title?: string | null | undefined;
  venue: string;
  /** "Lama di Reno (BO)" */
  place: string;
  /** One free line under the place. */
  extra?: string | null | undefined;
  variant: VariantId;
  /** Path of the venue logo file, when there is one. */
  venueLogo?: string | null | undefined;
  venueLogoTone: 'light' | 'dark';
  /** Write the venue name under its logo (for logos that are a symbol only). */
  showVenueName: boolean;
  /** Address of the page of the night, for the QR code of the printable version. */
  url?: string | null | undefined;
}

const MONTHS = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
];

/** "30 GENNAIO 2027"; with a start time the year gives way to it: "31 OTTOBRE". */
export function flyerDate(day: string, withYear: boolean): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month) throw new Error(`Invalid day: "${day}"`);
  return `${Number(match[3])} ${month}${withYear ? ` ${match[1]}` : ''}`.toUpperCase();
}

/** "31-10-2026", as on the tour poster. */
export function flyerShortDate(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) throw new Error(`Invalid day: "${day}"`);
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** Capital letters sit at about three quarters of the font size in a condensed face. */
const CAP = 0.76;

export interface Block {
  height: number;
  /** Builds the elements of the block once its top is known. */
  place: (top: number) => Element[];
}

/** Height of a stack of blocks with the given gap between them. */
export function stackHeight(blocks: readonly Block[], gap: number): number {
  return blocks.reduce((sum, block) => sum + block.height, 0) + gap * Math.max(0, blocks.length - 1);
}

/**
 * Builds the blocks at the wanted scale and, if they do not fit between `top` and `bottom`,
 * builds them again smaller (blocks and gap together) so that nothing ever leaves the sheet.
 */
export function fitStack(build: (scale: number) => Block[], scale: number, top: number, bottom: number, gap: number): Element[] {
  const needed = stackHeight(build(scale), gap * scale);
  const factor = Math.min(1, (bottom - top) / needed);
  return stack(build(scale * factor), top, bottom, gap * scale * factor);
}

/** Stacks blocks vertically with a gap and centres the stack between `top` and `bottom`. */
export function stack(blocks: Block[], top: number, bottom: number, gap: number): Element[] {
  let y = top + Math.max(0, (bottom - top - stackHeight(blocks, gap)) / 2);
  return blocks.flatMap((block) => {
    const placed = block.place(y);
    y += block.height + gap;
    return placed;
  });
}

const textBlock = (segments: Segment[], cx: number, maxWidth: number): Block => {
  const size = Math.max(...segments.map((segment) => segment.size));
  return {
    height: size * CAP,
    place: (top) => [{ kind: 'line', x: cx, anchor: 'middle', baseline: top + size * CAP, maxWidth, segments }],
  };
};

/**
 * Keeps centred lines clear of the QR code: a line at the same height as the code is narrowed
 * so that it ends before the code starts. Lines above or below it are left alone.
 */
export function clearOfQr(elements: Element[]): Element[] {
  const code = elements.find((element) => element.kind === 'qr');
  if (!code || code.kind !== 'qr') return elements;
  const margin = 24;
  return elements.map((element) => {
    if (element.kind !== 'line' || element.anchor !== 'middle') return element;
    const size = Math.max(...element.segments.map((segment) => segment.size));
    const overlaps = element.baseline > code.y - margin && element.baseline - size < code.y + code.size + margin;
    return overlaps ? { ...element, maxWidth: Math.min(element.maxWidth, 2 * (code.x - margin - element.x)) } : element;
  });
}

/** The upper part shared by every portrait flyer: lightning, band logo, "Tribute Band", socials. */
function header(height: number, variant: VariantId, texts: FlyerTexts): Element[] {
  const v = variants[variant];
  const logoWidth = height > 900 ? 800 : 700;
  // The logo is about 0.6 times as tall as it is wide.
  const logoHeight = logoWidth * 0.6;
  const logoTop = (height - logoHeight) * 0.36;
  const tributeBaseline = logoTop + logoHeight + height * 0.105;
  return [
    { kind: 'background', y: 0, height, hue: v.hue, saturation: v.saturation, fadeTo: FLYER_COLOURS.band },
    { kind: 'logo', cx: 500, y: logoTop, width: logoWidth },
    {
      kind: 'line',
      x: 500,
      anchor: 'middle',
      baseline: tributeBaseline,
      maxWidth: 700,
      segments: [{ text: texts.tribute.toUpperCase(), size: 42, colour: FLYER_COLOURS.volt, font: 'display', tracking: 0.22 }],
    },
    { kind: 'social', cx: 500, baseline: height - height * 0.075, size: 21, items: texts.social },
  ];
}

/** The lines that describe the night, used by every format. */
function eventBlocks(event: EventFlyer, texts: FlyerTexts, cx: number, maxWidth: number, scale: number): Block[] {
  const v = variants[event.variant];
  const blocks: Block[] = [];
  if (event.title) {
    const text = v.titleUppercase ? event.title.toUpperCase() : event.title;
    blocks.push(textBlock([{ text, size: 76 * scale, colour: v.title, font: v.titleFont, tracking: 0.03 }], cx, maxWidth));
  }
  const date: Segment[] = [{ text: flyerDate(event.date, !event.time), size: 122 * scale, colour: v.accent, font: 'display' }];
  if (event.time) {
    date.push({ text: `  ${texts.timePrefix} ${event.time}`.toUpperCase(), size: 86 * scale, colour: FLYER_COLOURS.bone, font: 'display' });
  }
  blocks.push(textBlock(date, cx, maxWidth));
  if (event.venueLogo) {
    const width = 440 * scale;
    const height = 156 * scale;
    blocks.push({
      height,
      place: (top) => [
        { kind: 'venueLogo', x: cx - width / 2, y: top, width, height, tone: event.venueLogoTone, source: event.venueLogo ?? '' },
      ],
    });
  }
  if (!event.venueLogo || event.showVenueName) {
    blocks.push(textBlock([{ text: event.venue.toUpperCase(), size: 64 * scale, colour: FLYER_COLOURS.bone, font: 'display' }], cx, maxWidth));
  }
  blocks.push(
    textBlock([{ text: event.place.toUpperCase(), size: 46 * scale, colour: FLYER_COLOURS.bone, font: 'display', tracking: 0.06 }], cx, maxWidth),
  );
  const extras = [event.doorsTime ? `${texts.doorsPrefix} ${event.doorsTime}` : null, event.extra ?? null].filter(
    (line): line is string => Boolean(line),
  );
  if (extras.length > 0) {
    blocks.push(
      textBlock([{ text: extras.join('  ·  ').toUpperCase(), size: 30 * scale, colour: FLYER_COLOURS.mute, font: 'display', tracking: 0.08 }], cx, maxWidth),
    );
  }
  return blocks;
}

/** Flyer of one night. */
export function eventScene(event: EventFlyer, format: FlyerFormat, texts: FlyerTexts): Scene {
  const height = FORMAT_HEIGHT[format];
  if (format === 'wide') {
    // Link preview: logo on the left, the night on the right, lightning behind everything.
    const v = variants[event.variant];
    return {
      width: 1000,
      height,
      elements: [
        { kind: 'background', y: 0, height, hue: v.hue, saturation: v.saturation, fadeTo: FLYER_COLOURS.band },
        { kind: 'panel', x: 480, y: 0, width: 520, height, colour: FLYER_COLOURS.band, opacity: 0.6 },
        { kind: 'logo', cx: 250, y: 130, width: 420 },
        ...fitStack((scale) => eventBlocks(event, texts, 730, 480, scale), 0.56, 30, height - 30, 46),
      ],
    };
  }
  const headerHeight = format === 'a4' ? 1000 : 800;
  const elements = [
    ...header(headerHeight, event.variant, texts),
    ...fitStack((scale) => eventBlocks(event, texts, 500, 880, scale), format === 'a4' ? 1 : 0.9, headerHeight + 6, height - 44, 34),
  ];
  // The QR code only on the printable sheet: on a phone the link is already one tap away.
  if (format === 'a4' && event.url) elements.push({ kind: 'qr', x: 842, y: height - 158, size: 110, url: event.url });
  return { width: 1000, height, elements: clearOfQr(elements) };
}

export interface TourRow {
  date: string;
  venue: string;
  place: string;
  venueLogo?: string | null | undefined;
  venueLogoTone: 'light' | 'dark';
}

export interface TourTexts extends FlyerTexts {
  /** "Date" */
  title: string;
  /** "Date in aggiornamento" */
  footer: string;
}

/** Years covered by the rows: "2026 / 2027", or a single year. */
export function tourYears(rows: readonly Pick<TourRow, 'date'>[]): string {
  return [...new Set(rows.map((row) => row.date.slice(0, 4)))].sort().join(' / ');
}

/** How many dates fit on the poster. */
export const TOUR_MAX_ROWS = 4;

/** Poster with the list of the coming dates (Instagram portrait). */
export function tourScene(rows: readonly TourRow[], texts: TourTexts): Scene {
  const height = FORMAT_HEIGHT.instagram;
  const shown = rows.slice(0, TOUR_MAX_ROWS);
  const rowHeight = 104;
  const blocks: Block[] = shown.map((row) => ({
    height: rowHeight,
    place: (top) => [
      ...(row.venueLogo
        ? [{ kind: 'venueLogo', x: 56, y: top + 4, width: 204, height: rowHeight - 14, tone: row.venueLogoTone, source: row.venueLogo } satisfies Element]
        : []),
      {
        kind: 'line',
        x: 290,
        anchor: 'start',
        baseline: top + 68,
        maxWidth: 240,
        segments: [{ text: flyerShortDate(row.date), size: 56, colour: FLYER_COLOURS.red, font: 'display' }],
      },
      {
        kind: 'line',
        x: 548,
        anchor: 'start',
        baseline: top + 44,
        maxWidth: 400,
        segments: [{ text: row.venue, size: 40, colour: FLYER_COLOURS.bone, font: 'display' }],
      },
      {
        kind: 'line',
        x: 548,
        anchor: 'start',
        baseline: top + 86,
        maxWidth: 400,
        segments: [{ text: row.place, size: 28, colour: FLYER_COLOURS.volt, font: 'display', tracking: 0.03 }],
      },
    ],
  }));
  blocks.push(textBlock([{ text: texts.footer.toUpperCase(), size: 54, colour: FLYER_COLOURS.volt, font: 'display', tracking: 0.02 }], 500, 880));
  const headerHeight = 700;
  const years = tourYears(shown);
  return {
    width: 1000,
    height,
    elements: [
      { kind: 'background', y: 90, height: headerHeight, hue: 0, saturation: 1, fadeTo: FLYER_COLOURS.band },
      { kind: 'logo', cx: 500, y: 215, width: 600 },
      {
        kind: 'line',
        x: 500,
        anchor: 'middle',
        baseline: 108,
        maxWidth: 900,
        segments: [{ text: `${texts.title} ${years}`.trim().toUpperCase(), size: 100, colour: FLYER_COLOURS.gold, font: 'display', tracking: 0.02 }],
      },
      {
        kind: 'line',
        x: 500,
        anchor: 'middle',
        baseline: 655,
        maxWidth: 700,
        segments: [{ text: texts.tribute.toUpperCase(), size: 34, colour: FLYER_COLOURS.volt, font: 'display', tracking: 0.22 }],
      },
      { kind: 'social', cx: 500, baseline: 728, size: 19, items: texts.social },
      ...stack(blocks, 770, height - 36, 16),
    ],
  };
}

export interface PromoFlyer {
  variant: VariantId;
  /** Two short lines, e.g. ["Portaci nel", "tuo locale"]. */
  headline: readonly string[];
  /** One line under the headline. */
  subline: string;
  /** Label and value of the contact, e.g. "Booking" and the phone number. */
  contactLabel: string;
  contact: string;
  /** Address the QR code points to (printable version only). */
  url?: string | null | undefined;
}

/** Flyer without a date: the band for venues, or for weddings. */
export function promoScene(promo: PromoFlyer, format: Exclude<FlyerFormat, 'wide'>, texts: FlyerTexts): Scene {
  const v = variants[promo.variant];
  const height = FORMAT_HEIGHT[format];
  const headerHeight = format === 'a4' ? 1000 : 800;
  const blocks = (scale: number): Block[] => [
    ...promo.headline.map((line, index) =>
      textBlock(
        [
          {
            text: v.titleUppercase || index > 0 ? line.toUpperCase() : line,
            size: (index === 0 && !v.titleUppercase ? 96 : 104) * scale,
            colour: index === 0 ? v.title : v.accent,
            font: index === 0 ? v.titleFont : 'display',
          },
        ],
        500,
        880,
      ),
    ),
    textBlock([{ text: promo.subline.toUpperCase(), size: 34 * scale, colour: FLYER_COLOURS.mute, font: 'display', tracking: 0.08 }], 500, 880),
    textBlock(
      [
        { text: `${promo.contactLabel}  `.toUpperCase(), size: 44 * scale, colour: FLYER_COLOURS.volt, font: 'display', tracking: 0.08 },
        { text: promo.contact, size: 64 * scale, colour: FLYER_COLOURS.bone, font: 'display' },
      ],
      500,
      880,
    ),
  ];
  const elements = [
    ...header(headerHeight, promo.variant, texts),
    ...fitStack(blocks, format === 'a4' ? 1 : 0.9, headerHeight + 6, height - 44, 30),
  ];
  if (format === 'a4' && promo.url) elements.push({ kind: 'qr', x: 842, y: height - 158, size: 110, url: promo.url });
  return { width: 1000, height, elements: clearOfQr(elements) };
}

/** File names of the downloads of one night, shared by the generator and by the pages. */
export function flyerFiles(id: string) {
  return {
    pdf: `/volantini/${id}-a4.pdf`,
    a4: `/volantini/${id}-a4.jpg`,
    instagram: `/volantini/${id}-instagram.jpg`,
    preview: `/volantini/${id}-anteprima.jpg`,
    thumbnail: `/volantini/${id}-miniatura.webp`,
  };
}
