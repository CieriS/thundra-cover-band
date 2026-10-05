import "@fontsource/anton/400.css";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/geist-mono/wght.css";
import "@/styles/globals.css";

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { App } from "@/App";
import { Providers } from "@/components/providers";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento #root non trovato in index.html");
}

const app = (
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);

// In build l'HTML arriva già prerenderizzato (scripts/vite-plugin-prerender.ts) e React lo idrata;
// in sviluppo #root è vuoto e l'app viene renderizzata da zero.
if (rootElement.firstElementChild) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
