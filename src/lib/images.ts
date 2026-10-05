/*
 * Immagini responsive in WebP. Le varianti vengono generate da
 * `scripts/vite-plugin-webp.ts` (in build e al volo in sviluppo): questo modulo è
 * condiviso tra plugin e componenti, così i percorsi coincidono sempre.
 */

export const IMAGE_WIDTHS = [480, 960, 1600] as const;

/** Formati accettati come sorgente, comprese le foto caricate dal pannello CMS. */
export const SOURCE_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"] as const;

const FALLBACK_WIDTH = 960;
const EXTENSION_PATTERN = /\.[^./]+$/;

export interface ResponsiveSources {
  src: string;
  srcSet: string;
}

export function isSourceImage(fileName: string): boolean {
  const extension = EXTENSION_PATTERN.exec(fileName.toLowerCase())?.[0];
  return SOURCE_IMAGE_EXTENSIONS.some((allowed) => allowed === extension);
}

/** `images/foto.jpg` → `images/foto-960.webp` */
export function toWebpVariant(path: string, width: number): string {
  return `${path.replace(EXTENSION_PATTERN, "")}-${width}.webp`;
}

/** `src` di fallback e `srcset` WebP per un'immagine di `public/`. */
export function toResponsiveSources(path: string): ResponsiveSources {
  const url = encodeURI(path);

  return {
    src: toWebpVariant(url, FALLBACK_WIDTH),
    srcSet: IMAGE_WIDTHS.map((width) => `${toWebpVariant(url, width)} ${width}w`).join(", "),
  };
}
