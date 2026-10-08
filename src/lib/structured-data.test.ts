import { describe, expect, test } from 'bun:test';
import type { EventData } from './events';
import { musicEvent, musicGroup, serializeJsonLd, utcOffset, webSite } from './structured-data';

const band = {
  name: 'Band di prova',
  subtitle: 'Tribute Band',
  description: 'Descrizione',
  url: 'https://example.com/',
  image: 'https://example.com/og.jpg',
  sameAs: ['https://instagram.example/band'],
  areaServed: ['Bologna', 'Modena'],
  members: [{ name: 'Mario Rossi', role: 'Voce' }],
};

const event: EventData = {
  date: '2027-01-30',
  venue: 'Locale di prova',
  city: 'Lama di Reno',
  province: 'BO',
  status: 'scheduled',
};

const context = { band, url: 'https://example.com/date/', offset: '+01:00', durationMinutes: 120 };

describe('musicGroup', () => {
  test('describes the band, its members and its area', () => {
    const data = musicGroup(band);
    expect(data['@type']).toBe('MusicGroup');
    expect(data.sameAs).toEqual(band.sameAs);
    expect(data.areaServed).toEqual([
      { '@type': 'City', name: 'Bologna' },
      { '@type': 'City', name: 'Modena' },
    ]);
    expect(data.member[0]).toEqual({
      '@type': 'OrganizationRole',
      roleName: 'Voce',
      member: { '@type': 'Person', name: 'Mario Rossi' },
    });
  });
});

describe('musicEvent', () => {
  test('date-only start while the time is unknown, with an end date', () => {
    const data = musicEvent(event, context);
    expect(data.startDate).toBe('2027-01-30');
    expect(data.endDate).toBe('2027-01-31');
    expect(data).not.toHaveProperty('offers');
  });

  test('full local date-time with offset when the time is known', () => {
    const data = musicEvent({ ...event, time: '22:00' }, context);
    expect(data.startDate).toBe('2027-01-30T22:00:00+01:00');
    expect(data).not.toHaveProperty('endDate');
  });

  test('location carries city, province and optional street address', () => {
    expect(musicEvent(event, context).location.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Lama di Reno',
      addressRegion: 'BO',
      addressCountry: 'IT',
    });
    expect(
      musicEvent({ ...event, address: 'Via Lama 10' }, context).location.address,
    ).toHaveProperty('streetAddress', 'Via Lama 10');
  });

  test.each([
    ['scheduled', 'https://schema.org/EventScheduled'],
    ['cancelled', 'https://schema.org/EventCancelled'],
    ['postponed', 'https://schema.org/EventPostponed'],
  ] as const)('status %s maps to %s', (status, expected) => {
    expect(musicEvent({ ...event, status }, context).eventStatus).toBe(expected);
  });

  test('free admission becomes a zero-price offer, paid has no invented price', () => {
    const free = musicEvent({ ...event, admission: 'free' }, context);
    expect(free.offers).toMatchObject({ price: '0', priceCurrency: 'EUR', url: context.url });
    const paid = musicEvent({ ...event, admission: 'paid', bookingUrl: 'https://tickets.example/x' }, context);
    expect(paid.offers).toMatchObject({ url: 'https://tickets.example/x' });
    expect(paid.offers).not.toHaveProperty('price');
  });
});

describe('description and site', () => {
  test('the event carries the description only when one is given', () => {
    expect(musicEvent(event, context)).not.toHaveProperty('description');
    expect(musicEvent(event, { ...context, description: 'Due ore di show' })).toHaveProperty(
      'description',
      'Due ore di show',
    );
  });

  test('the site entry has name, address and language', () => {
    expect(webSite({ name: 'Band', url: 'https://example.com/', language: 'it' })).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Band',
      url: 'https://example.com/',
      inLanguage: 'it',
    });
  });
});

describe('utcOffset', () => {
  test('follows daylight saving in Rome', () => {
    expect(utcOffset(new Date('2027-01-30T21:00:00Z'), 'Europe/Rome')).toBe('+01:00');
    expect(utcOffset(new Date('2026-07-10T19:00:00Z'), 'Europe/Rome')).toBe('+02:00');
  });

  test('UTC has a zero offset', () => {
    expect(utcOffset(new Date('2027-01-30T21:00:00Z'), 'UTC')).toBe('+00:00');
  });
});

describe('serializeJsonLd', () => {
  test('cannot close the script tag it is inlined in', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)' })).not.toContain('</script>');
  });
});
