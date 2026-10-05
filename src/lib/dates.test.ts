import { describe, expect, test } from 'bun:test';
import { countdown, dateParts, dayInTimeZone, nextDay, zonedTimeToUtc } from './dates';

const ROME = 'Europe/Rome';

describe('dayInTimeZone', () => {
  test('uses the calendar day of the time zone, not UTC', () => {
    expect(dayInTimeZone(new Date('2026-10-31T22:30:00Z'), ROME)).toBe('2026-10-31');
    expect(dayInTimeZone(new Date('2026-10-31T23:30:00Z'), ROME)).toBe('2026-11-01');
  });

  test('handles summer time (UTC+2)', () => {
    expect(dayInTimeZone(new Date('2026-07-10T22:30:00Z'), ROME)).toBe('2026-07-11');
  });
});

describe('zonedTimeToUtc', () => {
  test('winter time is UTC+1', () => {
    expect(zonedTimeToUtc('2027-01-30', '22:00', ROME).toISOString()).toBe('2027-01-30T21:00:00.000Z');
  });

  test('summer time is UTC+2', () => {
    expect(zonedTimeToUtc('2026-07-10', '21:30', ROME).toISOString()).toBe('2026-07-10T19:30:00.000Z');
  });

  test('the day summer time ends keeps the right offset on both sides', () => {
    expect(zonedTimeToUtc('2026-10-25', '00:30', ROME).toISOString()).toBe('2026-10-24T22:30:00.000Z');
    expect(zonedTimeToUtc('2026-10-25', '22:00', ROME).toISOString()).toBe('2026-10-25T21:00:00.000Z');
  });

  test('midnight belongs to the same calendar day', () => {
    expect(zonedTimeToUtc('2026-10-31', '00:00', ROME).toISOString()).toBe('2026-10-30T23:00:00.000Z');
  });

  test('rejects malformed input', () => {
    expect(() => zonedTimeToUtc('2026-10', '22:00', ROME)).toThrow();
    expect(() => zonedTimeToUtc('2026-10-31', 'sera', ROME)).toThrow();
  });
});

describe('nextDay', () => {
  test('rolls over months, years and leap days', () => {
    expect(nextDay('2026-10-31')).toBe('2026-11-01');
    expect(nextDay('2026-12-31')).toBe('2027-01-01');
    expect(nextDay('2028-02-28')).toBe('2028-02-29');
    expect(nextDay('2027-02-28')).toBe('2027-03-01');
  });
});

describe('dateParts', () => {
  test('formats in Italian regardless of the machine time zone', () => {
    const parts = dateParts('2026-10-31');
    expect(parts.day).toBe('31');
    expect(parts.month).toBe('OTT');
    expect(parts.year).toBe('2026');
    expect(parts.weekday).toBe('sabato');
    expect(parts.long).toBe('sabato 31 ottobre 2026');
  });

  test('keeps the leading zero on the day', () => {
    expect(dateParts('2027-03-05').day).toBe('05');
  });

  test('rejects an invalid day', () => {
    expect(() => dateParts('non-una-data')).toThrow();
  });
});

describe('countdown', () => {
  const target = new Date('2026-10-31T21:00:00Z');

  test('splits the remaining time into days, hours and minutes', () => {
    expect(countdown(target, new Date('2026-10-29T18:30:00Z'))).toEqual({
      days: 2,
      hours: 2,
      minutes: 30,
      done: false,
    });
  });

  test('rounds down partial minutes', () => {
    expect(countdown(target, new Date('2026-10-31T20:59:30Z')).minutes).toBe(0);
  });

  test('never goes negative once the target has passed', () => {
    expect(countdown(target, new Date('2026-11-02T00:00:00Z'))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      done: true,
    });
  });

  test('is done exactly at the target', () => {
    expect(countdown(target, target).done).toBe(true);
  });
});
