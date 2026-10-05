import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { prerenderPlugin } from "./scripts/vite-plugin-prerender.ts";
import { seoPlugin } from "./scripts/vite-plugin-seo.ts";
import { webpPlugin } from "./scripts/vite-plugin-webp.ts";

const DEFAULT_SITE_URL = "http://localhost:5173";

/** Data locale della build, condivisa da bundle client e prerender (vedi `useToday`). */
function getBuildDate(now = new Date()): string {
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = env.VITE_SITE_URL || DEFAULT_SITE_URL;
  const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };
  const define = { __BUILD_DATE__: JSON.stringify(getBuildDate()) };

  return {
    // Percorsi relativi: la build funziona anche in una sottocartella dell'hosting.
    base: "./",
    plugins: [
      react(),
      tailwindcss(),
      webpPlugin(),
      seoPlugin({ siteUrl }),
      prerenderPlugin({ entry: "/src/entry-server.tsx", alias, define }),
    ],
    define,
    resolve: { alias },
    build: {
      rolldownOptions: {
        output: {
          // Librerie in chunk separati: cache più efficace tra un deploy e l'altro.
          codeSplitting: {
            groups: [
              { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
              { name: "motion", test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 20 },
              { name: "vendor", test: /node_modules[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
    server: {
      host: true,
    },
    preview: {
      host: true,
    },
  };
});
