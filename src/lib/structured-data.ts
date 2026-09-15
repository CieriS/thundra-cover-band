// Import relativi: questo modulo viene usato anche dal plugin SEO in vite.config.ts.
import { band, tourDates, type TourStatus } from "../data/band-data.ts";

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const OFFER_AVAILABILITY: Record<TourStatus, string> = {
  AVAILABLE: "https://schema.org/InStock",
  CONFIRMED: "https://schema.org/PreOrder",
  SOLD_OUT: "https://schema.org/SoldOut",
};

/** Dati strutturati schema.org (MusicGroup + MusicEvent) per i motori di ricerca. */
export function buildStructuredData(siteUrl: string): JsonValue {
  const url = new URL(siteUrl).toString();

  const musicGroup: JsonValue = {
    "@type": "MusicGroup",
    "@id": `${url}#band`,
    name: band.name,
    description: band.seoDescription,
    url,
    email: band.contactEmail,
    genre: ["Hard Rock", "Rock 'n' Roll"],
    foundingDate: String(band.foundedYear),
    sameAs: band.socials.map((social) => social.href),
    member: band.members.map((member) => ({
      "@type": "OrganizationRole",
      roleName: member.role,
      member: { "@type": "Person", name: member.name },
    })),
  };

  // Solo i concerti non ancora passati al momento della build.
  const today = new Date().toISOString().slice(0, 10);
  const upcomingShows = tourDates.filter((show) => show.date >= today);

  const events: JsonValue[] = upcomingShows.map((show) => ({
    "@type": "MusicEvent",
    name: `${band.name} — ${band.tagline} @ ${show.venue}`,
    startDate: `${show.date}T${show.doorsTime}`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    performer: { "@id": `${url}#band` },
    location: {
      "@type": "Place",
      name: show.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: show.city,
        addressRegion: show.province,
        addressCountry: band.countryCode,
      },
    },
    offers: {
      "@type": "Offer",
      url: show.ticketUrl ?? `${url}#tour`,
      availability: OFFER_AVAILABILITY[show.status],
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [musicGroup, ...events],
  };
}

/** Serializza il JSON-LD evitando l'iniezione di tag `</script>`. */
export function serializeJsonLd(data: JsonValue): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
