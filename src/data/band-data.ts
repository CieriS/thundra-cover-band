/* ===========================================================================
 * THUNDRA — Dati del sito
 * I contenuti modificabili vivono in `content/*.json` (pannello Pages CMS) e
 * vengono validati qui. In questo file restano i tipi e la configurazione tecnica.
 * ========================================================================= */

// Import con estensione e attributi JSON: il modulo è caricato anche da vite.config.ts.
import bandJson from "../../content/band.json" with { type: "json" };
import setlistJson from "../../content/setlist.json" with { type: "json" };
import techRiderJson from "../../content/tech-rider.json" with { type: "json" };
import textsJson from "../../content/texts.json" with { type: "json" };
import tourJson from "../../content/tour.json" with { type: "json" };
import {
  RIDER_ICONS,
  SOCIAL_PLATFORMS,
  SONG_TAGS,
  TOUR_STATUSES,
  bandContentSchema,
  parseContent,
  setlistContentSchema,
  techRiderContentSchema,
  textsContentSchema,
  tourContentSchema,
} from "./content-schema.ts";

/* ---------------------------------------------------------------------------
 * Tipi condivisi
 * ------------------------------------------------------------------------- */

/** Data in formato ISO `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`;

/** Durata brano in formato `m:ss`. */
export type TrackDuration = `${number}:${number}`;

export type NavSectionId = "about" | "tour" | "setlist" | "rider" | "booking";

export type SectionId = "top" | NavSectionId;

export interface SectionCopy {
  index: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
}

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  handle: string;
  href: string;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface BandMember {
  name: string;
  role: string;
  image: ImageAsset;
}

export interface KeyStat {
  value: string;
  label: string;
  description: string;
}

export interface BandInfo {
  name: string;
  tagline: string;
  slogan: string;
  shortBio: string;
  manifesto: readonly string[];
  seoDescription: string;
  keywords: readonly string[];
  foundedYear: number;
  baseCity: string;
  countryCode: string;
  contactEmail: string;
  responseTime: string;
  members: readonly BandMember[];
  stats: readonly KeyStat[];
  socials: readonly SocialLink[];
}

export interface HeroContent {
  eyebrow: string;
  availability: string;
  primaryCta: string;
  secondaryCta: string;
  signalLabel: string;
  nextShowLabel: string;
  featuredSongTitle: string;
}

export type TourStatus = (typeof TOUR_STATUSES)[number];

export interface TourDate {
  id: string;
  date: IsoDate;
  doorsTime: string;
  venue: string;
  city: string;
  province: string;
  status: TourStatus;
  ticketUrl?: string;
  note?: string;
}

export interface TourStatusMeta {
  label: string;
  actionLabel: string;
}

export interface TourCta {
  title: string;
  description: string;
  action: string;
}

export type SongTag = (typeof SONG_TAGS)[number];

export interface Song {
  id: string;
  title: string;
  album: string;
  year: number;
  duration: TrackDuration;
  tags: readonly SongTag[];
}

export type EraId = "ALL" | "BON_SCOTT" | "BRIAN_JOHNSON";

export interface YearRange {
  from: number;
  to: number | null;
}

export interface EraFilter {
  id: EraId;
  label: string;
  period: string;
  range: YearRange | null;
}

export type RiderSectionIcon = (typeof RIDER_ICONS)[number];

export interface RiderItem {
  label: string;
  value: string;
}

export interface RiderSection {
  id: string;
  title: string;
  icon: RiderSectionIcon;
  items: readonly RiderItem[];
}

export interface InputChannel {
  channel: number;
  source: string;
  microphone: string;
  stand: string;
}

export interface RiderSummaryItem {
  value: string;
  label: string;
}

export interface TechRider {
  version: string;
  updatedAt: IsoDate;
  summary: readonly RiderSummaryItem[];
  sections: readonly RiderSection[];
  inputList: readonly InputChannel[];
  notes: readonly string[];
  requestLabel: string;
  requestSubject: string;
}

export interface BookingStep {
  title: string;
  description: string;
}

export interface BookingContent {
  steps: readonly BookingStep[];
  directContactLabel: string;
  note: string;
  privacyNote: string;
}

export interface FooterContent {
  contactEyebrow: string;
  disclaimer: string;
}

/* ---------------------------------------------------------------------------
 * Configurazione tecnica (non modificabile dal pannello)
 * ------------------------------------------------------------------------- */

const SEO_KEYWORDS: readonly string[] = [
  "AC/DC tribute band",
  "tribute band AC/DC Italia",
  "Thundra",
  "cover band rock",
  "booking band rock Milano",
];

const COUNTRY_CODE = "IT";

const SECTION_INDEX: Record<NavSectionId, string> = {
  about: "01",
  tour: "02",
  setlist: "03",
  rider: "04",
  booking: "05",
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

const PORTRAIT_SIZE = { width: 800, height: 1000 } as const;
const LANDSCAPE_SIZE = { width: 1600, height: 900 } as const;

export const navigationOrder: readonly NavSectionId[] = ["about", "tour", "setlist", "rider", "booking"];

export const tourStatusMeta: Record<TourStatus, TourStatusMeta> = {
  AVAILABLE: { label: "Disponibile", actionLabel: "Biglietti" },
  CONFIRMED: { label: "Upcoming", actionLabel: "Prevendite a breve" },
  SOLD_OUT: { label: "Sold Out", actionLabel: "Esaurito" },
};

export const songTagLabels: Record<SongTag, string> = {
  OPENER: "Opener",
  CLOSER: "Closer",
  ENCORE: "Encore",
  SINGALONG: "Sing-along",
  EXTENDED_SOLO: "Extended solo",
  FX_CUE: "FX cue",
  BAGPIPES: "Cornamusa",
  LEGATO_INTRO: "Legato intro",
  SHUFFLE: "Shuffle",
  HIGH_TEMPO: "High tempo",
};

export const eraFilters: readonly EraFilter[] = [
  { id: "ALL", label: "Tutto", period: "1976 — 2008", range: null },
  { id: "BON_SCOTT", label: "Bon Scott era", period: "1976 — 1979", range: { from: 1973, to: 1979 } },
  { id: "BRIAN_JOHNSON", label: "Brian Johnson era", period: "1980 — oggi", range: { from: 1980, to: null } },
];

/* ---------------------------------------------------------------------------
 * Contenuti (content/*.json)
 * ------------------------------------------------------------------------- */

const bandContent = parseContent(bandContentSchema, bandJson, "band.json");
const tourContent = parseContent(tourContentSchema, tourJson, "tour.json");
const setlistContent = parseContent(setlistContentSchema, setlistJson, "setlist.json");
const techRiderContent = parseContent(techRiderContentSchema, techRiderJson, "tech-rider.json");
const textsContent = parseContent(textsContentSchema, textsJson, "texts.json");

/** Pages CMS salva i percorsi con "/" iniziale; con `base: "./"` di Vite servono relativi. */
function toRelativeAsset(path: string): string {
  return path.replace(/^\/+/, "");
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const band: BandInfo = {
  name: bandContent.name,
  tagline: bandContent.tagline,
  slogan: bandContent.slogan,
  shortBio: bandContent.shortBio,
  manifesto: bandContent.manifesto,
  seoDescription: bandContent.seoDescription,
  keywords: SEO_KEYWORDS,
  foundedYear: bandContent.foundedYear,
  baseCity: bandContent.baseCity,
  countryCode: COUNTRY_CODE,
  contactEmail: bandContent.contactEmail,
  responseTime: bandContent.responseTime,
  members: bandContent.members.map((member) => ({
    name: member.name,
    role: member.role,
    image: {
      src: toRelativeAsset(member.photo),
      alt: `${member.name}, ${member.role}`,
      ...PORTRAIT_SIZE,
    },
  })),
  stats: bandContent.stats,
  socials: bandContent.socials.map((social) => ({ ...social, label: SOCIAL_LABELS[social.platform] })),
};

export const hero: HeroContent = textsContent.hero;

export const media: Record<"liveStage" | "crowd", ImageAsset> = {
  liveStage: {
    src: toRelativeAsset(textsContent.images.liveStage.photo),
    alt: textsContent.images.liveStage.alt,
    caption: textsContent.images.liveStage.caption,
    ...LANDSCAPE_SIZE,
  },
  crowd: {
    src: toRelativeAsset(textsContent.images.crowd.photo),
    alt: textsContent.images.crowd.alt,
    ...LANDSCAPE_SIZE,
  },
};

export const sections: Record<NavSectionId, SectionCopy> = {
  about: { index: SECTION_INDEX.about, ...textsContent.sections.about },
  tour: { index: SECTION_INDEX.tour, ...textsContent.sections.tour },
  setlist: { index: SECTION_INDEX.setlist, ...textsContent.sections.setlist },
  rider: { index: SECTION_INDEX.rider, ...textsContent.sections.rider },
  booking: { index: SECTION_INDEX.booking, ...textsContent.sections.booking },
};

/** Tutte le date, ordinate cronologicamente (l'ordine nel pannello non conta). */
export const tourDates: readonly TourDate[] = [...tourContent]
  .sort((a, b) => a.date.localeCompare(b.date) || a.doorsTime.localeCompare(b.doorsTime))
  .map((show, index) => ({
    id: `${show.date}-${slugify(show.city)}-${index}`,
    date: show.date as IsoDate,
    doorsTime: show.doorsTime,
    venue: show.venue,
    city: show.city,
    province: show.province,
    status: show.status,
    ticketUrl: show.ticketUrl || undefined,
    note: show.note || undefined,
  }));

export const tourCta: TourCta = textsContent.tourCta;

export const tourEmptyMessage: string = textsContent.tourEmptyMessage;

/** Brani ordinati per anno (ordinamento stabile: a parità di anno resta l'ordine del pannello). */
export const setlist: readonly Song[] = setlistContent
  .map((song, index) => ({
    id: `${slugify(song.title)}-${index}`,
    title: song.title,
    album: song.album,
    year: song.year,
    duration: song.duration as TrackDuration,
    tags: song.tags,
  }))
  .sort((a, b) => a.year - b.year);

export const techRider: TechRider = {
  version: techRiderContent.version,
  updatedAt: techRiderContent.updatedAt as IsoDate,
  summary: techRiderContent.summary,
  sections: techRiderContent.sections.map((section, index) => ({
    id: `rider-${index}-${slugify(section.title)}`,
    title: section.title,
    icon: section.icon,
    items: section.items,
  })),
  inputList: techRiderContent.inputList.map((input, index) => ({
    channel: index + 1,
    source: input.source,
    microphone: input.microphone,
    stand: input.stand || "—",
  })),
  notes: techRiderContent.notes,
  requestLabel: textsContent.techRiderRequest.label,
  requestSubject: textsContent.techRiderRequest.subject,
};

export const bookingContent: BookingContent = textsContent.booking;

export const footerContent: FooterContent = textsContent.footer;
