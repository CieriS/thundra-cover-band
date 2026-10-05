/** Pure helpers for booking contacts: WhatsApp links, messages, YouTube ids. */

export interface BookingRequest {
  venue?: string | undefined;
  city?: string | undefined;
  date?: string | undefined;
  contact?: string | undefined;
}

const clean = (value: string | undefined) => value?.trim().replace(/\s+/g, ' ') ?? '';

/**
 * Prefilled booking message. Empty fields keep a bracketed hint so the manager
 * can complete the text directly in WhatsApp.
 */
export function bookingMessage(request: BookingRequest = {}): string {
  const venue = clean(request.venue) || '[nome locale]';
  const city = clean(request.city);
  const date = clean(request.date) || '[data]';
  const contact = clean(request.contact);
  const where = city ? `${venue} di ${city}` : venue;
  const lines = [`Ciao, vorrei informazioni per una data al ${where} il ${date}.`];
  if (contact) lines.push(`Potete ricontattarmi qui: ${contact}`);
  return lines.join('\n');
}

/** wa.me link with a prefilled text. `number` is international, digits only. */
export function whatsappUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  if (!digits) throw new Error('WhatsApp number is empty');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** mailto link with subject and body. */
export function mailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** "2027-01-30" → "30/01/2027"; anything else is returned untouched. */
export function italianDate(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());
  return match ? `${match[3]}/${match[2]}/${match[1]}` : day.trim();
}

const YOUTUBE_ID = /^[\w-]{11}$/;

/** Extracts the video id from a YouTube URL (watch, youtu.be, shorts, embed, live) or a bare id. */
export function youtubeId(input: string | null | undefined): string | null {
  const value = input?.trim();
  if (!value) return null;
  if (YOUTUBE_ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  let id: string | null | undefined = null;
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, first, second] = url.pathname.split('/');
    id = first === 'watch' ? url.searchParams.get('v') : ['embed', 'shorts', 'live'].includes(first ?? '') ? second : null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

/** Privacy-friendly embed URL, loaded only after the visitor taps the facade. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
}
