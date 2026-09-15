import { z } from "zod";

/*
 * Validazione dei contenuti modificabili da Pages CMS (cartella `content/`).
 * Gli schemi girano anche in build (plugin SEO): un contenuto non valido blocca
 * il deploy su Vercel e il sito online resta quello precedente.
 */

export const TOUR_STATUSES = ["AVAILABLE", "CONFIRMED", "SOLD_OUT"] as const;

export const SONG_TAGS = [
  "OPENER",
  "CLOSER",
  "ENCORE",
  "SINGALONG",
  "EXTENDED_SOLO",
  "FX_CUE",
  "BAGPIPES",
  "LEGATO_INTRO",
  "SHUFFLE",
  "HIGH_TEMPO",
] as const;

export const SOCIAL_PLATFORMS = ["instagram", "facebook", "youtube"] as const;

export const RIDER_ICONS = ["stage", "power", "backline", "foh", "monitor", "lights"] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DURATION_PATTERN = /^\d{1,2}:[0-5]\d$/;
const URL_PATTERN = /^https?:\/\/\S+$/;

function isRealIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day;
}

const required = (label: string) =>
  z.string({ error: `${label}: campo obbligatorio` }).trim().min(1, `${label}: campo obbligatorio`);

/** Campo facoltativo: Pages CMS può salvarlo vuoto, `null` oppure ometterlo. */
const optional = () => z.string().nullish().transform((value) => value?.trim() ?? "");

const isoDate = (label: string) =>
  required(label).refine(isRealIsoDate, `${label}: data non valida (formato AAAA-MM-GG)`);

const optionalUrl = (label: string) =>
  optional().refine((value) => value === "" || URL_PATTERN.test(value), `${label}: il link deve iniziare con https://`);

const year = (label: string, min: number) =>
  z.coerce
    .number({ error: `${label}: inserisci un numero` })
    .int(`${label}: inserisci un anno intero`)
    .min(min, `${label}: anno non valido`)
    .max(2100, `${label}: anno non valido`);

const list = <T extends z.ZodType>(item: T, label: string, min = 0) =>
  z.array(item, { error: `${label}: elenco mancante` }).min(min, `${label}: inserisci almeno ${min} elemento`);

/* ---------------------------------------------------------------- tour.json */

export const tourContentSchema = list(
  z.object({
    date: isoDate("Data del concerto"),
    doorsTime: required("Apertura porte").regex(TIME_PATTERN, "Apertura porte: usa il formato 24 ore, es. 21:30"),
    venue: required("Locale"),
    city: required("Città"),
    province: required("Provincia")
      .transform((value) => value.toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{2}$/, "Provincia: usa la sigla di due lettere, es. MI")),
    status: z.enum(TOUR_STATUSES, { error: "Stato: scegli tra Biglietti disponibili, Confermata e Sold out" }),
    ticketUrl: optionalUrl("Link biglietti"),
    note: optional(),
  }),
  "Date del tour",
);

/* ------------------------------------------------------------- setlist.json */

export const setlistContentSchema = list(
  z.object({
    title: required("Titolo brano"),
    album: required("Album"),
    year: year("Anno", 1970),
    duration: required("Durata").regex(DURATION_PATTERN, "Durata: usa minuti:secondi, es. 4:52"),
    tags: z
      .array(z.enum(SONG_TAGS, { error: "Tag tecnico non valido" }))
      .nullish()
      .transform((value) => value ?? []),
  }),
  "Setlist",
  1,
);

/* ---------------------------------------------------------------- band.json */

export const bandContentSchema = z.object({
  name: required("Nome band"),
  tagline: required("Sottotitolo"),
  slogan: required("Slogan"),
  shortBio: required("Bio breve"),
  manifesto: list(required("Paragrafo del manifesto"), "Manifesto", 1),
  seoDescription: required("Descrizione per Google"),
  foundedYear: year("Anno di fondazione", 1950),
  baseCity: required("Città di base"),
  contactEmail: required("Email di contatto").pipe(z.email("Email di contatto: formato non valido")),
  responseTime: required("Tempo di risposta"),
  members: list(
    z.object({
      name: required("Nome musicista"),
      role: required("Ruolo"),
      photo: required("Foto musicista"),
    }),
    "Line-up",
    1,
  ),
  stats: list(
    z.object({
      value: required("Numero chiave"),
      label: required("Etichetta"),
      description: required("Descrizione"),
    }),
    "Numeri chiave",
  ),
  socials: list(
    z.object({
      platform: z.enum(SOCIAL_PLATFORMS, { error: "Social: piattaforma non valida" }),
      handle: required("Nome profilo"),
      href: required("Link social").regex(URL_PATTERN, "Link social: deve iniziare con https://"),
    }),
    "Social",
  ),
});

/* ---------------------------------------------------------- tech-rider.json */

export const techRiderContentSchema = z.object({
  version: required("Versione rider"),
  updatedAt: isoDate("Data di aggiornamento"),
  summary: list(z.object({ value: required("Valore"), label: required("Etichetta") }), "Riepilogo"),
  sections: list(
    z.object({
      title: required("Titolo sezione"),
      icon: z.enum(RIDER_ICONS, { error: "Icona sezione non valida" }),
      items: list(z.object({ label: required("Voce"), value: required("Valore") }), "Voci della sezione", 1),
    }),
    "Sezioni del rider",
    1,
  ),
  inputList: list(
    z.object({
      source: required("Sorgente"),
      microphone: required("Microfono / DI"),
      stand: optional(),
    }),
    "Input list",
  ),
  notes: list(required("Nota"), "Note"),
});

/* --------------------------------------------------------------- texts.json */

const sectionCopySchema = z.object({
  navLabel: required("Voce di menu"),
  eyebrow: required("Occhiello"),
  title: required("Titolo"),
  description: required("Descrizione"),
});

export const textsContentSchema = z.object({
  hero: z.object({
    eyebrow: required("Hero: occhiello"),
    availability: required("Hero: disponibilità"),
    primaryCta: required("Hero: pulsante principale"),
    secondaryCta: required("Hero: pulsante secondario"),
    signalLabel: required("Hero: etichetta player"),
    nextShowLabel: required("Hero: etichetta prossimo show"),
    featuredSongTitle: optional(),
  }),
  sections: z.object({
    about: sectionCopySchema,
    tour: sectionCopySchema,
    setlist: sectionCopySchema,
    rider: sectionCopySchema,
    booking: sectionCopySchema,
  }),
  tourCta: z.object({
    title: required("Box tour: titolo"),
    description: required("Box tour: descrizione"),
    action: required("Box tour: pulsante"),
  }),
  tourEmptyMessage: required("Messaggio senza date"),
  booking: z.object({
    steps: list(z.object({ title: required("Passaggio: titolo"), description: required("Passaggio: descrizione") }), "Passaggi", 1),
    directContactLabel: required("Booking: etichetta contatto"),
    note: required("Booking: nota"),
    privacyNote: required("Booking: nota privacy"),
  }),
  footer: z.object({
    contactEyebrow: required("Footer: occhiello"),
    disclaimer: required("Footer: disclaimer"),
  }),
  images: z.object({
    liveStage: z.object({
      photo: required("Foto live"),
      alt: required("Foto live: descrizione"),
      caption: optional(),
    }),
    crowd: z.object({
      photo: required("Foto pubblico"),
      alt: required("Foto pubblico: descrizione"),
    }),
  }),
  techRiderRequest: z.object({
    label: required("Rider: testo pulsante"),
    subject: required("Rider: oggetto email"),
  }),
});

/** Valida un file di contenuto con un messaggio d'errore leggibile nei log di build. */
export function parseContent<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => {
      const path = issue.path.map((key) => (typeof key === "number" ? `#${key + 1}` : String(key))).join(" › ");
      return `  • ${path || "file"}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`Contenuto non valido in content/${file}\n${details}`);
}
