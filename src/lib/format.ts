import type { TrackDuration } from "@/data/band-data";

/*
 * Formattazione deterministica (nessuna dipendenza da Intl/timezone) per
 * garantire output identico tra server e client ed evitare errori di idratazione.
 */

const MONTHS = [
  { short: "Gen", long: "gennaio" },
  { short: "Feb", long: "febbraio" },
  { short: "Mar", long: "marzo" },
  { short: "Apr", long: "aprile" },
  { short: "Mag", long: "maggio" },
  { short: "Giu", long: "giugno" },
  { short: "Lug", long: "luglio" },
  { short: "Ago", long: "agosto" },
  { short: "Set", long: "settembre" },
  { short: "Ott", long: "ottobre" },
  { short: "Nov", long: "novembre" },
  { short: "Dic", long: "dicembre" },
] as const;

const WEEKDAYS = [
  { short: "Dom", long: "domenica" },
  { short: "Lun", long: "lunedì" },
  { short: "Mar", long: "martedì" },
  { short: "Mer", long: "mercoledì" },
  { short: "Gio", long: "giovedì" },
  { short: "Ven", long: "venerdì" },
  { short: "Sab", long: "sabato" },
] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface DateParts {
  day: string;
  monthShort: string;
  monthLong: string;
  weekdayShort: string;
  weekdayLong: string;
  year: number;
}

function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));

  const isSameDay =
    date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day;

  return isSameDay ? date : null;
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

export function getDateParts(value: string): DateParts {
  const date = parseIsoDate(value);
  if (!date) throw new Error(`Data ISO non valida: "${value}"`);

  const month = MONTHS[date.getUTCMonth()];
  const weekday = WEEKDAYS[date.getUTCDay()];

  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    monthShort: month.short,
    monthLong: month.long,
    weekdayShort: weekday.short,
    weekdayLong: weekday.long,
    year: date.getUTCFullYear(),
  };
}

/** Es. "sabato 17 ottobre 2026". */
export function formatLongDate(value: string): string {
  const parts = getDateParts(value);
  return `${parts.weekdayLong} ${Number(parts.day)} ${parts.monthLong} ${parts.year}`;
}

/** Es. "01 Giu 2026". */
export function formatShortDate(value: string): string {
  const parts = getDateParts(value);
  return `${parts.day} ${parts.monthShort} ${parts.year}`;
}

/** Data locale odierna in formato `YYYY-MM-DD` (solo client). */
export function getTodayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function durationToSeconds(duration: TrackDuration): number {
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + seconds;
}

/** Sotto l'ora: "14:32"; oltre: "1h 32′". */
export function formatRuntime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}′`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
