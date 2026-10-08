import { describe, expect, test } from 'bun:test';
import {
  admissionLabel,
  countdownTarget,
  eventPath,
  eventStart,
  isPast,
  mapsUrl,
  nextEvent,
  placeLabel,
  splitEvents,
  uniqueCities,
  type EventData,
  type EventLike,
} from './events';

const make = (id: string, data: Partial<EventData> = {}): EventLike => ({
  id,
  data: {
    date: '2026-10-31',
    venue: 'Locale di prova',
    city: 'Bologna',
    province: 'BO',
    status: 'scheduled',
    ...data,
  },
});

describe('splitEvents', () => {
  const events = [
    make('c', { date: '2027-03-05' }),
    make('a', { date: '2026-09-01' }),
    make('b', { date: '2026-10-31' }),
    make('z', { date: '2026-05-01' }),
  ];

  test('an event stays upcoming for its whole day', () => {
    expect(isPast(make('x'), '2026-10-31')).toBe(false);
    expect(isPast(make('x'), '2026-11-01')).toBe(true);
  });

  test('upcoming are soonest first, past are most recent first', () => {
    const { upcoming, past } = splitEvents(events, '2026-10-06');
    expect(upcoming.map((event) => event.id)).toEqual(['b', 'c']);
    expect(past.map((event) => event.id)).toEqual(['a', 'z']);
  });

  test('moves everything to the archive when all dates are gone', () => {
    const { upcoming, past } = splitEvents(events, '2028-01-01');
    expect(upcoming).toEqual([]);
    expect(past).toHaveLength(4);
  });

  test('handles an empty list and does not mutate the input', () => {
    expect(splitEvents([], '2026-10-06')).toEqual({ upcoming: [], past: [] });
    const order = events.map((event) => event.id);
    splitEvents(events, '2026-10-06');
    expect(events.map((event) => event.id)).toEqual(order);
  });

  test('same-day events are ordered by id for a stable build', () => {
    const same = [make('b'), make('a')];
    expect(splitEvents(same, '2026-01-01').upcoming.map((event) => event.id)).toEqual(['a', 'b']);
  });
});

describe('nextEvent', () => {
  test('skips cancelled events', () => {
    const list = [make('a', { status: 'cancelled' }), make('b', { status: 'postponed' })];
    expect(nextEvent(list)?.id).toBe('b');
  });

  test('is undefined without events', () => {
    expect(nextEvent([])).toBeUndefined();
  });
});

describe('start and countdown target', () => {
  test('no start instant while the time is unknown', () => {
    expect(eventStart(make('a').data, 'Europe/Rome')).toBeNull();
    expect(eventStart(make('a', { time: null }).data, 'Europe/Rome')).toBeNull();
  });

  test('start instant is in the venue time zone', () => {
    const start = eventStart(make('a', { time: '22:00' }).data, 'Europe/Rome');
    expect(start?.toISOString()).toBe('2026-10-31T21:00:00.000Z');
  });

  test('countdown falls back to midnight of the day', () => {
    expect(countdownTarget(make('a').data, 'Europe/Rome').toISOString()).toBe(
      '2026-10-30T23:00:00.000Z',
    );
  });
});

describe('eventPath', () => {
  test('is the dates folder plus the file name, with a trailing slash', () => {
    expect(eventPath('2026-10-31-metheglin-pub')).toBe('/date/2026-10-31-metheglin-pub/');
  });
});

describe('labels and links', () => {
  test('place label', () => {
    expect(placeLabel({ city: 'Lama di Reno', province: 'BO' })).toBe('Lama di Reno (BO)');
  });

  test('explicit maps link wins', () => {
    const url = 'https://maps.app.goo.gl/abc';
    expect(mapsUrl(make('a', { mapsUrl: url }).data)).toBe(url);
  });

  test('maps search is built from venue, address and city, URL-encoded', () => {
    const url = mapsUrl(make('a', { venue: 'Rock & Roll Pub', address: 'Via Roma 1' }).data);
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=Rock%20%26%20Roll%20Pub%2C%20Via%20Roma%201%2C%20Bologna%2C%20BO',
    );
  });

  test('admission label', () => {
    expect(admissionLabel({ admission: 'free' })).toBe('Ingresso libero');
    expect(admissionLabel({ admission: 'paid', price: '10 €' })).toBe('Ingresso 10 €');
    expect(admissionLabel({ admission: 'paid' })).toBe('Ingresso a pagamento');
    expect(admissionLabel({})).toBeNull();
    expect(admissionLabel({ admission: null, price: '10 €' })).toBeNull();
  });

  test('unique cities keep the order of appearance', () => {
    const list = [make('a'), make('b', { city: 'Modena' }), make('c')];
    expect(uniqueCities(list)).toEqual(['Bologna', 'Modena']);
  });
});
