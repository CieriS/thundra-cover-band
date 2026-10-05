import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import type { Plugin } from "vite";

import { IMAGE_WIDTHS, SOURCE_IMAGE_EXTENSIONS, isSourceImage, toWebpVariant } from "../src/lib/images.ts";

const IMAGES_DIR = "images";
const WEBP_QUALITY = 78;
const WIDTHS_GROUP = IMAGE_WIDTHS.join("|");
const VARIANT_URL_PATTERN = new RegExp(`^/(${IMAGES_DIR}/.+)-(${WIDTHS_GROUP})\\.webp$`);
const GENERATED_FILE_PATTERN = new RegExp(`-(${WIDTHS_GROUP})\\.webp$`);

/** Immagini sorgente sotto `public/images`, come percorsi relativi a `publicDir` con separatore `/`. */
async function listSourceImages(publicDir: string, dir = IMAGES_DIR): Promise<string[]> {
  const entries = await readdir(path.join(publicDir, dir), { withFileTypes: true }).catch(() => []);

  const nested = await Promise.all(
    entries.map((entry) => {
      const relativePath = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return listSourceImages(publicDir, relativePath);
      return isSourceImage(entry.name) && !GENERATED_FILE_PATTERN.test(entry.name) ? [relativePath] : [];
    }),
  );

  return nested.flat();
}

/** Trova il file sorgente di una variante (`images/foto` → `public/images/foto.jpg`). */
async function findSource(publicDir: string, basePath: string): Promise<string | null> {
  const extensions = SOURCE_IMAGE_EXTENSIONS.flatMap((extension) => [extension, extension.toUpperCase()]);

  for (const extension of extensions) {
    const candidate = path.join(publicDir, `${basePath}${extension}`);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Prova l'estensione successiva.
    }
  }

  return null;
}

async function convertToWebp(file: string, width: number): Promise<Buffer> {
  const input = await readFile(file);

  if (file.toLowerCase().endsWith(".svg")) {
    // Vettoriale: rasterizza direttamente alla larghezza richiesta, senza upscaling sfocato.
    const { width: intrinsicWidth = width } = await sharp(input).metadata();
    return sharp(input, { density: (72 * width) / intrinsicWidth })
      .resize({ width })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  }

  return sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Converte ogni immagine di `public/images` (comprese le foto JPG/PNG caricate dal
 * pannello) in varianti WebP responsive: in build le emette nel bundle, in sviluppo
 * le genera al volo alla prima richiesta.
 */
export function webpPlugin(): Plugin {
  let publicDir = "";

  return {
    name: "thundra-webp",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    configureServer(server) {
      const cache = new Map<string, Promise<Buffer | null>>();

      server.watcher.on("all", (_event, file) => {
        if (file.startsWith(path.join(publicDir, IMAGES_DIR))) cache.clear();
      });

      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? "").split("?")[0]);
        const match = VARIANT_URL_PATTERN.exec(pathname);
        if (!match) return next();

        const [, basePath, width] = match;
        let pending = cache.get(pathname);
        if (!pending) {
          pending = findSource(publicDir, basePath).then((source) =>
            source ? convertToWebp(source, Number(width)) : null,
          );
          cache.set(pathname, pending);
        }

        pending
          .then((image) => {
            if (!image) return next();
            res.setHeader("Content-Type", "image/webp");
            res.setHeader("Cache-Control", "no-cache");
            res.end(image);
          })
          .catch(next);
      });
    },
    async generateBundle() {
      if (!publicDir) return;

      const sources = await listSourceImages(publicDir);
      const variants = await Promise.all(
        sources.flatMap((source) =>
          IMAGE_WIDTHS.map(async (width) => ({
            fileName: toWebpVariant(source, width),
            source: await convertToWebp(path.join(publicDir, source), width),
          })),
        ),
      );

      for (const variant of variants) {
        this.emitFile({ type: "asset", ...variant });
      }
    },
  };
}
