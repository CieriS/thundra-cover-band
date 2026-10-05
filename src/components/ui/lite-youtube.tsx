import { Play } from "lucide-react";
import { useState } from "react";

import type { Video } from "@/data/band-data";
import { cn } from "@/lib/utils";

interface LiteYouTubeProps {
  video: Video;
  className?: string;
}

/**
 * Facade per gli embed YouTube: finché non si preme play mostra solo la miniatura
 * WebP in lazy loading. L'iframe, e il JS di terze parti che si porta dietro,
 * viene caricato soltanto al tocco.
 */
export function LiteYouTube({ video, className }: LiteYouTubeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className="relative aspect-video overflow-hidden border border-border bg-surface">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&playsinline=1&rel=0`}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 grid place-items-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <img
              src={`https://i.ytimg.com/vi_webp/${video.youtubeId}/hqdefault.webp`}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-background/30" />
            <span
              aria-hidden="true"
              className="relative grid size-16 place-items-center bg-accent text-accent-foreground transition-transform duration-150 group-active:scale-90"
            >
              <Play className="size-7 translate-x-0.5" fill="currentColor" strokeWidth={0} />
            </span>
            <span className="sr-only">Riproduci il video: {video.title}</span>
          </button>
        )}
      </div>
      <figcaption className="font-display text-xl uppercase leading-tight">{video.title}</figcaption>
    </figure>
  );
}
