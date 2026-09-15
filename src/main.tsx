import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/geist-mono/wght.css";
import "@/styles/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/App";
import { Providers } from "@/components/providers";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento #root non trovato in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
