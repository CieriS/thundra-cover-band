import { describe, expect, test } from 'bun:test';
import {
  clearOfQr,
  eventScene,
  fitStack,
  flyerDate,
  flyerFiles,
  flyerShortDate,
  FORMAT_HEIGHT,
  promoScene,
  stack,
  stackHeight,
  TOUR_MAX_ROWS,
  tourScene,
  tourYears,
  type Block,
  type Element,
  type EventFlyer,
  type FlyerTexts,
  type Scene,
} from './layout';
import { FLYER_COLOURS, VARIANT_IDS, variants, type VariantId } from './variants';

const texts: FlyerTexts = {
  tribute: 'Tribute Band',
  timePrefix: 'Ore',
  doorsPrefix: 'Apertura porte ore',
  social: [
    { icon: 'instagram', text: 'band_profile' },
    { icon: 'facebook', text: 'Band Page' },
  ],
};

const night: EventFlyer = {
  date: '2027-01-30',
  venue: 'Locale di prova',
  place: 'Lama di Reno (BO)',
  variant: 'base',
  venueLogoTone: 'light',
  showVenueName: false,
};

const lines = (scene: Scene) => scene.elements.filter((element) => element.kind === 'line');
const textsOf = (scene: Scene) => lines(scene).map((line) => line.segments.map((segment) => segment.text).join(''));
const block = (height: number): Block => ({
  height,
  place: (top) => [{ kind: 'panel', x: 0, y: top, width: 10, height, colour: '#000', opacity: 1 }],
});
const tops = (elements: Element[]) => elements.map((element) => (element.kind === 'panel' ? element.y : -1));

describe('dates on the sheet', () => {
  test('full date in capitals, without leading zero', () => {
    expect(flyerDate('2027-03-05', true)).toBe('5 MARZO 2027');
  });

  test('the year gives way when the time is shown', () => {
    expect(flyerDate('2026-10-31', false)).toBe('31 OTTOBRE');
  });

  test('short date as on the tour poster', () => {
    expect(flyerShortDate('2027-01-30')).toBe('30-01-2027');
  });

  test('a malformed day is an error, not a wrong flyer', () => {
    expect(() => flyerDate('30/01/2027', true)).toThrow();
    expect(() => flyerDate('2027-13-01', true)).toThrow();
    expect(() => flyerShortDate('domani')).toThrow();
  });
});

describe('stacking', () => {
  test('height counts the gaps between blocks, not around them', () => {
    expect(stackHeight([block(10), block(20), block(30)], 5)).toBe(70);
    expect(stackHeight([], 5)).toBe(0);
  });

  test('the stack is centred in the space it is given', () => {
    expect(tops(stack([block(10), block(20)], 100, 200, 10))).toEqual([130, 150]);
  });

  test('a stack that is too tall starts at the top instead of going above it', () => {
    expect(tops(stack([block(80), block(80)], 100, 200, 10))[0]).toBe(100);
  });

  test('fitStack shrinks blocks and gap until everything fits', () => {
    const elements = fitStack((scale) => [block(100 * scale), block(100 * scale)], 1, 0, 110, 20);
    const last = elements.at(-1);
    expect(tops(elements)[0]).toBeCloseTo(0, 5);
    expect(last?.kind === 'panel' ? last.y + last.height : 0).toBeCloseTo(110, 5);
  });

  test('fitStack never enlarges what already fits', () => {
    const elements = fitStack((scale) => [block(10 * scale)], 1, 0, 100, 20);
    expect(elements[0]?.kind === 'panel' ? elements[0].height : 0).toBe(10);
  });
});

describe('flyer of a night', () => {
  test('without a time: the date with the year, no time segment', () => {
    const all = textsOf(eventScene(night, 'a4', texts));
    expect(all).toContain('30 GENNAIO 2027');
    expect(all.some((text) => text.includes('ORE'))).toBe(false);
  });

  test('with a time: day and month, then the time in another colour', () => {
    const scene = eventScene({ ...night, date: '2026-10-31', time: '21:30' }, 'a4', texts);
    const date = lines(scene).find((line) => line.segments[0]?.text === '31 OTTOBRE');
    expect(date?.segments.map((segment) => segment.text.trim())).toEqual(['31 OTTOBRE', 'ORE 21:30']);
    expect(date?.segments[0]?.colour).toBe(variants.base.accent);
    expect(date?.segments[1]?.colour).toBe(FLYER_COLOURS.bone);
  });

  test('the name of the night appears only when there is one, in the variant typeface', () => {
    expect(textsOf(eventScene(night, 'a4', texts))).not.toContain('HALLOWEEN PARTY');
    const scene = eventScene({ ...night, title: 'Halloween Party', variant: 'halloween' }, 'a4', texts);
    const title = lines(scene).find((line) => line.segments[0]?.text === 'HALLOWEEN PARTY');
    expect(title?.segments[0]?.font).toBe('creepster');
    expect(title?.segments[0]?.colour).toBe(variants.halloween.title);
  });

  test('script variants keep the title in lower case', () => {
    const scene = eventScene({ ...night, title: 'Anna e Marco', variant: 'matrimoni' }, 'a4', texts);
    expect(textsOf(scene)).toContain('Anna e Marco');
  });

  test('no venue logo: the venue name is written instead', () => {
    const scene = eventScene(night, 'a4', texts);
    expect(scene.elements.some((element) => element.kind === 'venueLogo')).toBe(false);
    expect(textsOf(scene)).toContain('LOCALE DI PROVA');
  });

  test('with a venue logo the name is written only when asked', () => {
    const withLogo = { ...night, venueLogo: 'src/assets/venues/x.jpg' };
    expect(textsOf(eventScene(withLogo, 'a4', texts))).not.toContain('LOCALE DI PROVA');
    expect(textsOf(eventScene({ ...withLogo, showVenueName: true }, 'a4', texts))).toContain('LOCALE DI PROVA');
    expect(eventScene(withLogo, 'a4', texts).elements.some((element) => element.kind === 'venueLogo')).toBe(true);
  });

  test('missing data is left out, never printed as a placeholder', () => {
    const all = textsOf(eventScene(night, 'a4', texts)).join(' | ');
    expect(all).not.toContain('APERTURA');
    expect(all).not.toContain('undefined');
    expect(all).not.toContain('null');
  });

  test('doors time and free note share the last line', () => {
    const all = textsOf(eventScene({ ...night, doorsTime: '20:00', extra: 'Cena e concerto' }, 'a4', texts));
    expect(all).toContain('APERTURA PORTE ORE 20:00  ·  CENA E CONCERTO');
  });

  test('the QR code is on the printable sheet only, and only with an address', () => {
    const withUrl = { ...night, url: 'https://example.com/date/x/' };
    expect(eventScene(withUrl, 'a4', texts).elements.some((element) => element.kind === 'qr')).toBe(true);
    expect(eventScene(withUrl, 'instagram', texts).elements.some((element) => element.kind === 'qr')).toBe(false);
    expect(eventScene(withUrl, 'wide', texts).elements.some((element) => element.kind === 'qr')).toBe(false);
    expect(eventScene(night, 'a4', texts).elements.some((element) => element.kind === 'qr')).toBe(false);
  });

  test.each(['a4', 'instagram', 'wide'] as const)('everything stays inside the %s sheet, even a crowded one', (format) => {
    const crowded = {
      ...night,
      time: '21:30',
      doorsTime: '20:00',
      title: 'Halloween Party',
      extra: 'Cena e concerto',
      venueLogo: 'src/assets/venues/x.jpg',
      showVenueName: true,
      url: 'https://example.com/date/x/',
    };
    const scene = eventScene(crowded, format, texts);
    expect(scene.height).toBe(FORMAT_HEIGHT[format]);
    for (const element of scene.elements) {
      if (element.kind === 'line') expect(element.baseline).toBeLessThanOrEqual(scene.height);
      if (element.kind === 'venueLogo') expect(element.y + element.height).toBeLessThanOrEqual(scene.height);
    }
  });

  test.each([...VARIANT_IDS])('variant %s tints the background and colours the date', (variant: VariantId) => {
    const scene = eventScene({ ...night, variant }, 'a4', texts);
    const background = scene.elements.find((element) => element.kind === 'background');
    expect(background?.kind === 'background' && background.hue).toBe(variants[variant].hue);
    const date = lines(scene).find((line) => line.segments[0]?.text === '30 GENNAIO 2027');
    expect(date?.segments[0]?.colour).toBe(variants[variant].accent);
  });
});

describe('clearOfQr', () => {
  const code: Element = { kind: 'qr', x: 842, y: 1256, size: 110, url: 'https://example.com/' };
  const line = (baseline: number): Element => ({
    kind: 'line',
    x: 500,
    anchor: 'middle',
    baseline,
    maxWidth: 880,
    segments: [{ text: 'X', size: 40, colour: '#fff', font: 'display' }],
  });
  const widthOf = (element: Element | undefined) => (element?.kind === 'line' ? element.maxWidth : 0);

  test('a centred line at the height of the code is narrowed to end before it', () => {
    expect(widthOf(clearOfQr([line(1300), code])[0])).toBe(2 * (842 - 24 - 500));
  });

  test('lines above and below the code keep their width', () => {
    expect(widthOf(clearOfQr([line(1200), code])[0])).toBe(880);
    expect(widthOf(clearOfQr([line(1460), code])[0])).toBe(880);
  });

  test('without a code nothing changes', () => {
    const elements = [line(1300)];
    expect(clearOfQr(elements)).toBe(elements);
  });
});

describe('tour poster', () => {
  const rows = [
    { date: '2026-10-31', venue: 'Uno', place: 'Corniano (RE)', venueLogoTone: 'light' as const },
    { date: '2027-01-30', venue: 'Due', place: 'Lama di Reno (BO)', venueLogoTone: 'light' as const, venueLogo: 'src/x.jpg' },
  ];
  const tour = { ...texts, title: 'Date', footer: 'Date in aggiornamento' };

  test('years covered by the dates, once each', () => {
    expect(tourYears(rows)).toBe('2026 / 2027');
    expect(tourYears([rows[0]!])).toBe('2026');
    expect(tourYears([])).toBe('');
  });

  test('title, one row per date, footer', () => {
    const all = textsOf(tourScene(rows, tour));
    expect(all).toContain('DATE 2026 / 2027');
    expect(all).toContain('31-10-2026');
    expect(all).toContain('Due');
    expect(all).toContain('Lama di Reno (BO)');
    expect(all).toContain('DATE IN AGGIORNAMENTO');
  });

  test('a logo box only for the venues that have a logo', () => {
    expect(tourScene(rows, tour).elements.filter((element) => element.kind === 'venueLogo')).toHaveLength(1);
  });

  test('never more rows than fit on the sheet', () => {
    const many = Array.from({ length: 9 }, (_, index) => ({ ...rows[0]!, venue: `Locale ${index}` }));
    const all = textsOf(tourScene(many, tour));
    expect(all.filter((text) => text.startsWith('Locale '))).toHaveLength(TOUR_MAX_ROWS);
  });

  test('without dates the poster still has title and footer', () => {
    const all = textsOf(tourScene([], tour));
    expect(all).toContain('DATE');
    expect(all).toContain('DATE IN AGGIORNAMENTO');
  });
});

describe('promo flyer', () => {
  const promo = {
    variant: 'base' as const,
    headline: ['Live', 'nel tuo locale'],
    subline: 'Tributo · 2 ore',
    contactLabel: 'Booking',
    contact: '+39 000 000 0000',
    url: 'https://example.com/booking/',
  };

  test('headline, subline and contact, no date', () => {
    const all = textsOf(promoScene(promo, 'a4', texts));
    expect(all).toContain('LIVE');
    expect(all).toContain('NEL TUO LOCALE');
    expect(all).toContain('TRIBUTO · 2 ORE');
    expect(all.some((text) => text.includes('+39 000 000 0000'))).toBe(true);
    expect(all.some((text) => /\d{4}$/.test(text) && text.includes('GENNAIO'))).toBe(false);
  });

  test('the wedding variant keeps the first line in lower case script', () => {
    const scene = promoScene({ ...promo, variant: 'matrimoni', headline: ['Il vostro matrimonio', 'a tutto rock'] }, 'a4', texts);
    const first = lines(scene).find((line) => line.segments[0]?.text === 'Il vostro matrimonio');
    expect(first?.segments[0]?.font).toBe('script');
    expect(textsOf(scene)).toContain('A TUTTO ROCK');
  });
});

describe('flyerFiles', () => {
  test('all the downloads of a night live under /volantini/', () => {
    expect(flyerFiles('2026-10-31-x')).toEqual({
      pdf: '/volantini/2026-10-31-x-a4.pdf',
      a4: '/volantini/2026-10-31-x-a4.jpg',
      instagram: '/volantini/2026-10-31-x-instagram.jpg',
      preview: '/volantini/2026-10-31-x-anteprima.jpg',
      thumbnail: '/volantini/2026-10-31-x-miniatura.webp',
    });
  });
});
