import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const yaml = (folder: string) => glob({ pattern: '*.{yaml,yml}', base: `./src/content/${folder}` });

/** YAML parses a bare 2026-10-31 as a Date: normalise both forms to YYYY-MM-DD. */
const isoDate = z
  .union([z.date(), z.string()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa il formato AAAA-MM-GG'));

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa il formato HH:MM (24 ore)');
const optionalUrl = z.url().nullish();
const optionalText = z.string().trim().min(1).nullish();

const events = defineCollection({
  loader: yaml('events'),
  schema: ({ image }) =>
    z.object({
      date: isoDate,
      /** Show start, local time. Leave empty until confirmed. */
      time: time.nullish(),
      venue: z.string().min(1),
      city: z.string().min(1),
      province: z.string().length(2).toUpperCase(),
      address: optionalText,
      mapsUrl: optionalUrl,
      /** free = ingresso libero, paid = a pagamento (see price). */
      admission: z.enum(['free', 'paid']).nullish(),
      price: optionalText,
      /** Table booking or tickets. */
      bookingUrl: optionalUrl,
      bookingLabel: optionalText,
      poster: image().nullish(),
      note: optionalText,
      status: z.enum(['scheduled', 'cancelled', 'postponed']).default('scheduled'),
    }),
});

const members = defineCollection({
  loader: yaml('members'),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      order: z.number().int(),
      photo: image().nullish(),
    }),
});

const setlist = defineCollection({
  loader: yaml('setlist'),
  schema: z.object({
    title: z.string().min(1),
    note: optionalText,
    songs: z.array(z.string().min(1)).min(1),
  }),
});

const gallery = defineCollection({
  loader: yaml('gallery'),
  schema: ({ image }) =>
    z.object({
      image: image().nullish(),
      alt: z.string().min(1),
      caption: optionalText,
      order: z.number().int(),
    }),
});

const videos = defineCollection({
  loader: yaml('videos'),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** YouTube URL or video id. Empty = "coming soon" card. */
      youtube: optionalText,
      poster: image().nullish(),
      order: z.number().int(),
    }),
});

export const collections = { events, members, setlist, gallery, videos };
