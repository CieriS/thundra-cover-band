/**
 * Single source of truth for the band's data. Components never hardcode any of
 * these values. Anything still unknown is set to TODO: it renders as a visible
 * "[DA COMPILARE]" marker and is listed by `bun run todo`.
 */
export const TODO = '[DA COMPILARE]';

/** True when a value is missing or still a placeholder. */
/** Missing values are shown as visible markers, except on the demo branch where they are left out. */
export function showTodo(): boolean {
  return !site.demo;
}

export function isTodo(value: string | null | undefined): boolean {
  return !value || value.includes(TODO);
}

export const site = {
  /**
   * [DEMO] Demo branch: stock photos, invented reviews and sample show facts, presented as real.
   * The build refuses to run for production while this is true (see BaseLayout).
   */
  demo: true,
  name: 'Thundra',
  subtitle: 'AC/DC Tribute Band',
  lang: 'it',
  locale: 'it-IT',
  timeZone: 'Europe/Rome',
  description:
    'Thundra è una tribute band degli AC/DC attiva tra Bologna, Modena e Reggio Emilia. Date live, video, scaletta e contatti per portare lo show nel tuo locale.',

  area: {
    cities: ['Bologna', 'Modena', 'Reggio Emilia'],
    note: 'e dintorni',
  },

  contact: {
    phoneDisplay: '+39 333 423 4333',
    phoneHref: 'tel:+393334234333',
    /** WhatsApp number in international format, digits only. */
    whatsapp: '393334234333',
    email: TODO, // [DA COMPILARE] email di contatto per il booking
  },

  social: {
    instagram: {
      label: 'Instagram',
      handle: '@thundra_acdc_tribute_band',
      url: 'https://www.instagram.com/thundra_acdc_tribute_band/',
    },
    facebook: {
      label: 'Facebook',
      handle: 'Thundra - AC/DC Tribute Band',
      url: 'https://www.facebook.com/profile.php?id=61584104571199',
    },
  },

  show: {
    durationLabel: '2 ore',
    durationMinutes: 120,
    sets: '2 set con pausa', // [DEMO] valore di esempio, da confermare
    ownPa: 'Impianto proprio per locali fino a 200 persone', // [DEMO] valore di esempio, da confermare
    experience: 'Club, pub, feste di paese ed eventi privati', // [DEMO] valore di esempio, da confermare
  },

  techRider: {
    href: '/docs/scheda-tecnica-thundra.pdf',
    /** The PDF in public/docs is a placeholder until the real one replaces it. */
    isPlaceholder: true, // [DA COMPILARE] sostituire il PDF e mettere false
  },

  hero: {
    /**
     * Optional background loop. Files go in public/video/ (see README, "Video").
     * Never loaded with reduced motion, data saver or a slow connection.
     */
    video: {
      enabled: false,
      mobile: { webm: '/video/hero-mobile.webm', mp4: '/video/hero-mobile.mp4' },
      desktop: { webm: '/video/hero-desktop.webm', mp4: '/video/hero-desktop.mp4' },
    },
  },

  accessibility: {
    /** Date of the last accessibility check (automatic + manual). */
    lastChecked: '2026-10-08',
  },

  legal: {
    owner: TODO, // [DA COMPILARE] titolare del trattamento (nome e cognome o associazione)
    hosting: 'Vercel Inc.',
    lastUpdated: '2026-10-06',
  },

  /** Who built the site: shown at the bottom of the footer. */
  credit: {
    name: 'Samuele Cieri',
    url: 'https://cierisamuele.vercel.app',
  },

  disclaimer:
    'Tribute band non affiliata agli AC/DC. Tutti i marchi appartengono ai rispettivi proprietari.',
} as const;

/** The "Live" entry (`/#live`) comes back with the first real video: until then the section is not rendered. */
export const nav = [
  { label: 'Date', href: '/date/' },
  { label: 'La band', href: '/#band' },
  { label: 'Scaletta', href: '/#scaletta' },
  { label: 'Galleria', href: '/#galleria' },
  { label: 'Booking', href: '/booking/' },
] as const;
