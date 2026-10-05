/** Pure date helpers. Calendar days are 'YYYY-MM-DD' strings, times are 'HH:MM'. */

const pad = (value: number) => String(value).padStart(2, '0');

/** Calendar day in the given IANA time zone for an instant. */
export function dayInTimeZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Offset (minutes east of UTC) of a time zone at a given instant. */
function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

/** Converts a wall-clock day and time in a time zone to the matching instant. */
export function zonedTimeToUtc(day: string, time: string, timeZone: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if ([year, month, date, hour, minute].some((value) => value === undefined || Number.isNaN(value))) {
    throw new Error(`Invalid day or time: "${day}" "${time}"`);
  }
  const wallClock = Date.UTC(year!, month! - 1, date!, hour!, minute!);
  // Two passes settle the offset across daylight-saving changes.
  let instant = wallClock - offsetMinutes(new Date(wallClock), timeZone) * 60_000;
  instant = wallClock - offsetMinutes(new Date(instant), timeZone) * 60_000;
  return new Date(instant);
}

/** Day after the given one, as 'YYYY-MM-DD'. */
export function nextDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, date! + 1));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

export interface DateParts {
  day: string;
  month: string;
  monthLong: string;
  year: string;
  weekday: string;
  /** e.g. "sabato 31 ottobre 2026" */
  long: string;
}

/** Display parts of a calendar day, independent of the machine's time zone. */
export function dateParts(day: string, locale = 'it-IT'): DateParts {
  const instant = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(instant.getTime())) throw new Error(`Invalid day: "${day}"`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(instant);
  return {
    day: format({ day: '2-digit' }),
    month: format({ month: 'short' }).replace('.', '').toUpperCase(),
    monthLong: format({ month: 'long' }),
    year: format({ year: 'numeric' }),
    weekday: format({ weekday: 'long' }),
    long: format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  /** True once the target is reached. */
  done: boolean;
}

/** Whole days, hours and minutes left until the target. Never negative. */
export function countdown(target: Date, now: Date): Countdown {
  const totalMinutes = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 60_000));
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    done: target.getTime() <= now.getTime(),
  };
}
