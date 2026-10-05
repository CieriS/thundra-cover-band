import { describe, expect, test } from 'bun:test';
import type { EventData } from './events';
import { buildIcs, escapeText, foldLine } from './ics';

const event: EventData = {
  date: '2027-01-30',
  venue: 'Osteria Cellulosa',
  city: 'Lama di Reno',
  province: 'BO',
  status: 'scheduled',
};

const options = {
  uid: '2027-01-30-osteria-cellulosa@thundra',
  url: 'https://example.com/date/',
  summary: 'Thundra live @ Osteria Cellulosa',
  durationMinutes: 120,
  timeZone: 'Europe/Rome',
  stamp: new Date('2026-10-06T10:00:00Z'),
};

describe('escapeText', () => {
  test('escapes commas, semicolons, backslashes and newlines', () => {
    expect(escapeText('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne');
  });
});

describe('foldLine', () => {
  test('leaves short lines untouched', () => {
    expect(foldLine('SUMMARY:breve')).toBe('SUMMARY:breve');
  });

  test('folds at 75 octets with a leading space on continuations', () => {
    const folded = foldLine(`SUMMARY:${'a'.repeat(200)}`).split('\r\n');
    expect(folded.length).toBe(3);
    expect(folded[0]).toHaveLength(75);
    expect(folded[1]?.startsWith(' ')).toBe(true);
    expect(folded.every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });

  test('never splits a multi-byte character', () => {
    const folded = foldLine(`SUMMARY:${'è'.repeat(80)}`);
    expect(folded.replace(/\r\n /g, '')).toBe(`SUMMARY:${'è'.repeat(80)}`);
    expect(folded.split('\r\n').every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
});

describe('buildIcs', () => {
  test('all-day event while the time is unknown', () => {
    const ics = buildIcs(event, options);
    expect(ics).toContain('DTSTART;VALUE=DATE:20270130\r\n');
    expect(ics).toContain('DTEND;VALUE=DATE:20270131\r\n');
    expect(ics).not.toContain('DTSTART:');
  });

  test('timed event in UTC with the show duration', () => {
    const ics = buildIcs({ ...event, time: '22:00' }, options);
    expect(ics).toContain('DTSTART:20270130T210000Z\r\n');
    expect(ics).toContain('DTEND:20270130T230000Z\r\n');
  });

  test('has the mandatory structure and CRLF line endings', () => {
    const ics = buildIcs(event, options);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:2027-01-30-osteria-cellulosa@thundra\r\n');
    expect(ics).toContain('DTSTAMP:20261006T100000Z\r\n');
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  test('location joins venue, address and place, escaped', () => {
    const ics = buildIcs({ ...event, address: 'Via Lama, 10' }, options);
    expect(ics).toContain('LOCATION:Osteria Cellulosa\\, Via Lama\\, 10\\, Lama di Reno (BO)\r\n');
  });

  test('cancelled events are marked as such', () => {
    expect(buildIcs({ ...event, status: 'cancelled' }, options)).toContain('STATUS:CANCELLED');
    expect(buildIcs({ ...event, status: 'postponed' }, options)).toContain('STATUS:CONFIRMED');
  });
});
