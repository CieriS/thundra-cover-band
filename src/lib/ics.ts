/** iCalendar (RFC 5545) file for a single event. Pure: the timestamp is injected. */
import { nextDay } from './dates';
import { eventStart, placeLabel, type EventData } from './events';

export interface IcsOptions {
  uid: string;
  url: string;
  summary: string;
  durationMinutes: number;
  timeZone: string;
  /** DTSTAMP; pass the build time. */
  stamp: Date;
}

/** Escapes TEXT values: backslash, semicolon, comma and newlines. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds a content line at 75 octets, continuation lines start with a space. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = chunks.length === 0 ? 75 : 74;
    if (size + bytes > limit) {
      chunks.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += bytes;
  }
  chunks.push(current);
  return chunks.join('\r\n ');
}

const utcStamp = (instant: Date) =>
  instant
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

const compactDay = (day: string) => day.replace(/-/g, '');

/** A timed event when the start time is known, an all-day event otherwise. */
export function buildIcs(event: EventData, options: IcsOptions): string {
  const start = eventStart(event, options.timeZone);
  const when = start
    ? [
        `DTSTART:${utcStamp(start)}`,
        `DTEND:${utcStamp(new Date(start.getTime() + options.durationMinutes * 60_000))}`,
      ]
    : [
        `DTSTART;VALUE=DATE:${compactDay(event.date)}`,
        `DTEND;VALUE=DATE:${compactDay(nextDay(event.date))}`,
      ];
  const location = [event.venue, event.address, placeLabel(event)].filter(Boolean).join(', ');
  const status = event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Thundra//Date live//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${options.uid}`,
    `DTSTAMP:${utcStamp(options.stamp)}`,
    ...when,
    `SUMMARY:${escapeText(options.summary)}`,
    `LOCATION:${escapeText(location)}`,
    `URL:${options.url}`,
    `STATUS:${status}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
