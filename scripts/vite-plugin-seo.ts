import type { HtmlTagDescriptor, Plugin } from "vite";

import { band } from "../src/data/band-data.ts";
import { buildStructuredData, serializeJsonLd } from "../src/lib/structured-data.ts";

interface SeoPluginOptions {
  siteUrl: string;
}

/** Colore della barra del browser mobile: coincide con lo sfondo del tema. */
const THEME_COLOR = "#09090b";

function meta(attrs: Record<string, string>): HtmlTagDescriptor {
  return { tag: "meta", attrs, injectTo: "head" };
}

/**
 * Inietta nell'index.html i metadati SEO (title, Open Graph, JSON-LD) letti da
 * `band-data.ts` ed emette `robots.txt` e `sitemap.xml` nella build statica.
 */
export function seoPlugin({ siteUrl }: SeoPluginOptions): Plugin {
  const url = new URL(siteUrl).toString();
  const title = `${band.name} — ${band.tagline}`;

  return {
    name: "thundra-seo",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const tags: HtmlTagDescriptor[] = [
          { tag: "title", children: title, injectTo: "head" },
          meta({ name: "description", content: band.seoDescription }),
          meta({ name: "keywords", content: band.keywords.join(", ") }),
          { tag: "link", attrs: { rel: "canonical", href: url }, injectTo: "head" },
          meta({ property: "og:type", content: "website" }),
          meta({ property: "og:locale", content: "it_IT" }),
          meta({ property: "og:url", content: url }),
          meta({ property: "og:site_name", content: band.name }),
          meta({ property: "og:title", content: title }),
          meta({ property: "og:description", content: band.seoDescription }),
          meta({ name: "twitter:card", content: "summary" }),
          meta({ name: "twitter:title", content: title }),
          meta({ name: "twitter:description", content: band.seoDescription }),
          meta({ name: "theme-color", content: THEME_COLOR }),
          {
            tag: "script",
            attrs: { type: "application/ld+json" },
            children: serializeJsonLd(buildStructuredData(url)),
            injectTo: "head",
          },
        ];

        return { html, tags };
      },
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", url).toString()}\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      });
    },
  };
}
