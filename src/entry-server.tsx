import { StrictMode } from "react";
import { renderToString } from "react-dom/server";

import { App } from "@/App";
import { Providers } from "@/components/providers";

/** Markup statico della pagina, generato in build da `scripts/vite-plugin-prerender.ts`. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  );
}
