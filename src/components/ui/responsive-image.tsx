import type { ComponentProps } from "react";

import type { ImageAsset } from "@/data/band-data";

interface ResponsiveImageProps
  extends Omit<ComponentProps<"img">, "src" | "srcSet" | "sizes" | "width" | "height" | "alt"> {
  image: ImageAsset;
  sizes: string;
  /** Immagine LCP sopra la piega: caricamento immediato con priorità alta (mai lazy). */
  priority?: boolean;
  /** Immagine puramente decorativa: nascosta alle tecnologie assistive. */
  decorative?: boolean;
}

/** Immagine WebP responsive: lazy loading di default, dimensioni esplicite contro il layout shift. */
export function ResponsiveImage({ image, sizes, priority = false, decorative = false, ...props }: ResponsiveImageProps) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={decorative ? "" : image.alt}
      aria-hidden={decorative || undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "auto" : "async"}
      {...props}
    />
  );
}
