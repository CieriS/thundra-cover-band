import react from "@vitejs/plugin-react";
import { createServer, type AliasOptions, type HtmlTagDescriptor, type Plugin } from "vite";

interface PrerenderPluginOptions {
  /** Modulo che esporta `render(): string`. */
  entry: string;
  alias: AliasOptions;
  define: Record<string, string>;
}

const ROOT_MARKUP = '<div id="root"></div>';
const DISPLAY_FONT_PATTERN = /^assets\/anton-latin-400-normal-[\w-]+\.woff2$/;

/**
 * Prerender statico: in build esegue l'app React in un server Vite temporaneo e ne
 * inserisce l'HTML in `#root`. Il primo paint non attende più download ed esecuzione
 * del JS; `main.tsx` idrata il markup esistente.
 */
export function prerenderPlugin({ entry, alias, define }: PrerenderPluginOptions): Plugin {
  let root = process.cwd();

  return {
    name: "thundra-prerender",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml: {
      order: "post",
      async handler(html, ctx) {
        if (!html.includes(ROOT_MARKUP)) {
          throw new Error(`Prerender: ${ROOT_MARKUP} non trovato in index.html`);
        }

        const server = await createServer({
          configFile: false,
          root,
          logLevel: "error",
          appType: "custom",
          plugins: [react()],
          resolve: { alias },
          define,
          optimizeDeps: { noDiscovery: true },
          server: { middlewareMode: true, hmr: false, watch: null },
        });

        try {
          const { render } = (await server.ssrLoadModule(entry)) as { render: () => string };
          const page = html.replace(ROOT_MARKUP, `<div id="root">${render()}</div>`);

          // Preload del font dei titoli: riduce lo scambio di font sopra la piega.
          const displayFont = Object.keys(ctx.bundle ?? {}).find((fileName) => DISPLAY_FONT_PATTERN.test(fileName));
          const tags: HtmlTagDescriptor[] = displayFont
            ? [
                {
                  tag: "link",
                  attrs: { rel: "preload", href: `./${displayFont}`, as: "font", type: "font/woff2", crossorigin: true },
                  injectTo: "head",
                },
              ]
            : [];

          return { html: page, tags };
        } finally {
          await server.close();
        }
      },
    },
  };
}
