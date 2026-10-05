import { z } from "zod";

/*
 * Validazione dei contenuti modificabili da Pages CMS (cartella `content/`).
 * Gli schemi girano anche in build (plugin SEO): un contenuto non valido blocca
 * il deploy su Vercel e il sito online resta quello precedente.
 */

export const TOUR_STATUSES = ["AVAILABLE", "LOW_STOCK", "CONFIRMED", "SOLD_OUT"] as const;

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
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;
const YOUTUBE_URL_PATTERN =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:\S*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/;

function isRealIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day;
}

/** Accetta l'ID di un video o un link YouTube (watch, youtu.be, shorts, embed, live). */
function extractYoutubeId(value: string): string | null {
  if (YOUTUBE_ID_PATTERN.test(value)) return value;
  return YOUTUBE_URL_PATTERN.exec(value)?.[1] ?? null;
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

/** Elenco facoltativo: vuoto, `null` o assente diventano `[]`. */
const optionalList = <T extends z.ZodType>(item: T, label: string) =>
  z
    .array(item, { error: `${label}: elenco non valido` })
    .nullish()
    .transform((value) => value ?? []);

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
    status: z.enum(TOUR_STATUSES, {
      error: "Stato: scegli tra Biglietti disponibili, In esaurimento, Confermata e Sold out",
    }),
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

/* ------------------------------------------------------------- reviews.json */

const rating = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce
    .number({ error: "Valutazione: inserisci un numero da 1 a 5" })
    .int("Valutazione: inserisci un numero intero")
    .min(1, "Valutazione: minimo 1")
    .max(5, "Valutazione: massimo 5")
    .optional(),
);

export const reviewsContentSchema = list(
  z.object({
    quote: required("Recensione: testo").max(280, "Recensione: massimo 280 caratteri"),
    author: required("Recensione: autore o ruolo"),
    venue: required("Recensione: locale o evento"),
    city: required("Recensione: città"),
    rating,
  }),
  "Recensioni",
);

/* --------------------------------------------------------------- media.json */

const youtubeVideoId = required("Link YouTube").transform((value, ctx) => {
  const id = extractYoutubeId(value);
  if (id) return id;

  ctx.addIssue({
    code: "custom",
    message: "Link YouTube: incolla il link del video, es. https://www.youtube.com/watch?v=…",
  });
  return z.NEVER;
});

export const mediaContentSchema = z.object({
  videos: optionalList(z.object({ youtube: youtubeVideoId, title: required("Titolo video") }), "Video"),
  photos: optionalList(
    z.object({
      photo: required("Foto"),
      alt: required("Foto: descrizione"),
      caption: optional(),
    }),
    "Foto",
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

const imageSchema = (label: string) =>
  z.object({
    photo: required(label),
    alt: required(`${label}: descrizione`),
  });

export const textsContentSchema = z.object({
  hero: z.object({
    eyebrow: required("Hero: occhiello"),
    availability: required("Hero: disponibilità"),
    nextShowCta: required("Hero: pulsante prossima data"),
    bookingCta: required("Hero: pulsante prenota la band"),
  }),
  sections: z.object({
    tour: sectionCopySchema,
    reviews: sectionCopySchema,
    media: sectionCopySchema,
    about: sectionCopySchema,
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
    hero: imageSchema("Foto hero"),
    liveStage: imageSchema("Foto live").extend({ caption: optional() }),
    crowd: imageSchema("Foto pubblico"),
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
