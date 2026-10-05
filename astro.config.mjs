// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Public URL used for canonical links, Open Graph, sitemap and JSON-LD.
// SITE_URL wins; on Vercel the production domain is picked up automatically.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site =
  process.env.SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:4322');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  server: { port: 4322 },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
