// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Public URL used for canonical links, Open Graph, sitemap and JSON-LD.
// SITE_URL wins; on Vercel the production domain is picked up automatically.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site =
  process.env.SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:4322');

// The archive page is marked noindex while it has no past dates: it must then stay out of the
// sitemap as well. Same rule as the site: a date is past from the day after, Italian time.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
const eventsDir = new URL('./src/content/events/', import.meta.url);
const hasPastDates = readdirSync(eventsDir)
  .filter((file) => /\.ya?ml$/.test(file))
  .some((file) => {
    const date = /^date:\s*["']?(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(new URL(file, eventsDir), 'utf8'))?.[1];
    return date !== undefined && date < today;
  });

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  server: { port: 4322 },
  integrations: [sitemap({ filter: (page) => hasPastDates || !page.endsWith('/archivio/') })],
  vite: { plugins: [tailwindcss()] },
});
