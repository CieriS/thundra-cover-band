import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { seoPlugin } from "./scripts/vite-plugin-seo.ts";

const DEFAULT_SITE_URL = "http://localhost:5173";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const siteUrl = env.VITE_SITE_URL || DEFAULT_SITE_URL;

  return {
    // Percorsi relativi: la build funziona anche in una sottocartella dell'hosting.
    base: "./",
    plugins: [react(), tailwindcss(), seoPlugin({ siteUrl })],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
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
